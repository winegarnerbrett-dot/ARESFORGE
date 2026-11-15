import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express, { type Request, type Response } from 'express';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

interface WearableTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  userId?: string;
  athleteName?: string;
}

interface PendingPkce {
  verifier: string;
  createdAt: number;
}

// In-memory store keyed by HttpOnly session ID cookie
const sessionStore = new Map<string, { fitbit?: WearableTokens; strava?: WearableTokens }>();
const pkceStore = new Map<string, PendingPkce>();

function getAppBaseUrl(): string {
  const envUrl = (process.env.APP_URL || '').trim().replace(/\/+$/, '');
  if (envUrl && envUrl !== 'MY_APP_URL') {
    return envUrl;
  }
  return `http://localhost:${PORT}`;
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    try {
      result[key] = decodeURIComponent(val);
    } catch {
      result[key] = val;
    }
  }
  return result;
}

function ensureSessionId(req: Request, res: Response): string {
  const cookies = parseCookies(req.headers.cookie);
  let sid = cookies['aresforge_wearable_sid'];
  if (!sid || sid.length < 16) {
    sid = crypto.randomBytes(24).toString('hex');
    res.cookie('aresforge_wearable_sid', sid, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 30,
      path: '/',
    });
  }
  if (!sessionStore.has(sid)) {
    sessionStore.set(sid, {});
  }
  return sid;
}

function base64UrlEncode(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  // 1. Wearable Configuration & Connection Status
  app.get('/api/wearables/status', (req: Request, res: Response) => {
    const sid = ensureSessionId(req, res);
    const session = sessionStore.get(sid) || {};
    const baseUrl = getAppBaseUrl();

    const fitbitConfigured = Boolean(process.env.FITBIT_CLIENT_ID && process.env.FITBIT_CLIENT_SECRET);
    const stravaConfigured = Boolean(process.env.STRAVA_CLIENT_ID && process.env.STRAVA_CLIENT_SECRET);

    res.json({
      fitbit: {
        configured: fitbitConfigured,
        connected: Boolean(session.fitbit?.accessToken),
        accountLabel: session.fitbit?.athleteName || session.fitbit?.userId || null,
        callbackUrl: `${baseUrl}/auth/fitbit/callback`,
      },
      strava: {
        configured: stravaConfigured,
        connected: Boolean(session.strava?.accessToken),
        accountLabel: session.strava?.athleteName || session.strava?.userId || null,
        callbackUrl: `${baseUrl}/auth/strava/callback`,
      },
    });
  });

  // 2. Fitbit OAuth 2.0 PKCE URL Generator
  app.get('/api/wearables/fitbit/url', (req: Request, res: Response) => {
    const clientId = process.env.FITBIT_CLIENT_ID;
    const clientSecret = process.env.FITBIT_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      res.status(400).json({
        error: 'FITBIT_NOT_CONFIGURED',
        message: 'FITBIT_CLIENT_ID and FITBIT_CLIENT_SECRET must be set in environment secrets.',
        callbackUrl: `${getAppBaseUrl()}/auth/fitbit/callback`,
      });
      return;
    }

    const sid = ensureSessionId(req, res);
    const verifier = base64UrlEncode(crypto.randomBytes(48));
    const challenge = base64UrlEncode(crypto.createHash('sha256').update(verifier).digest());
    const state = `${sid}:${crypto.randomBytes(12).toString('hex')}`;

    pkceStore.set(state, { verifier, createdAt: Date.now() });

    const redirectUri = `${getAppBaseUrl()}/auth/fitbit/callback`;
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'activity heartrate profile',
      code_challenge: challenge,
      code_challenge_method: 'S256',
      state,
    });

    res.json({ url: `https://www.fitbit.com/oauth2/authorize?${params.toString()}` });
  });

  // 3. Fitbit OAuth Callback (handles both trailing slash variants)
  const fitbitCallback = async (req: Request, res: Response) => {
    const code = typeof req.query.code === 'string' ? req.query.code : '';
    const state = typeof req.query.state === 'string' ? req.query.state : '';
    const errorParam = typeof req.query.error === 'string' ? req.query.error : '';

    if (errorParam || !code || !state) {
      res.status(400).send(`
        <html><body style="font-family:sans-serif;padding:24px;">
          <h3>Fitbit connection cancelled</h3>
          <p>${errorParam || 'Missing authorization code.'}</p>
          <script>if(window.opener){window.opener.postMessage({type:'WEARABLE_OAUTH_ERROR',provider:'fitbit',error:${JSON.stringify(errorParam || 'cancelled')}},'*');setTimeout(()=>window.close(),800);}</script>
        </body></html>
      `);
      return;
    }

    const pkce = pkceStore.get(state);
    pkceStore.delete(state);
    const sid = state.split(':')[0] || ensureSessionId(req, res);

    if (!pkce) {
      res.status(400).send('Invalid or expired OAuth state.');
      return;
    }

    const clientId = process.env.FITBIT_CLIENT_ID || '';
    const clientSecret = process.env.FITBIT_CLIENT_SECRET || '';
    const redirectUri = `${getAppBaseUrl()}/auth/fitbit/callback`;

    try {
      const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const tokenRes = await fetch('https://api.fitbit.com/oauth2/token', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          code,
          code_verifier: pkce.verifier,
        }),
      });

      const tokenJson = (await tokenRes.json()) as {
        access_token?: string;
        refresh_token?: string;
        expires_in?: number;
        user_id?: string;
        errors?: Array<{ message?: string }>;
      };

      if (!tokenRes.ok || !tokenJson.access_token) {
        const msg = tokenJson.errors?.[0]?.message || 'Token exchange failed';
        res.status(400).send(`<html><body><p>Fitbit Error: ${msg}</p></body></html>`);
        return;
      }

      const current = sessionStore.get(sid) || {};
      current.fitbit = {
        accessToken: tokenJson.access_token,
        refreshToken: tokenJson.refresh_token,
        expiresAt: Date.now() + (tokenJson.expires_in || 28800) * 1000,
        userId: tokenJson.user_id,
      };
      sessionStore.set(sid, current);

      res.cookie('aresforge_wearable_sid', sid, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 60 * 24 * 30,
        path: '/',
      });

      res.send(`
        <html>
          <body style="font-family:sans-serif;padding:24px;text-align:center;">
            <h3>Fitbit Connected</h3>
            <p>Syncing with ARESFORGE. You can close this window.</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'WEARABLE_OAUTH_SUCCESS', provider: 'fitbit' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
          </body>
        </html>
      `);
    } catch (err) {
      res.status(500).send(`Fitbit OAuth error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  app.get(['/auth/fitbit/callback', '/auth/fitbit/callback/'], fitbitCallback);

  // 4. Fitbit Real Activity & Heart Rate Sync
  app.post('/api/wearables/fitbit/sync', async (req: Request, res: Response) => {
    const sid = ensureSessionId(req, res);
    const session = sessionStore.get(sid);
    if (!session?.fitbit?.accessToken) {
      res.status(401).json({ error: 'Fitbit is not connected.' });
      return;
    }

    const dateKey = typeof req.body?.dateKey === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(req.body.dateKey)
      ? req.body.dateKey
      : new Date().toISOString().slice(0, 10);

    try {
      const headers = { Authorization: `Bearer ${session.fitbit.accessToken}` };
      const [activityRes, heartRes] = await Promise.all([
        fetch(`https://api.fitbit.com/1/user/-/activities/date/${dateKey}.json`, { headers }),
        fetch(`https://api.fitbit.com/1/user/-/activities/heart/date/${dateKey}/1d.json`, { headers }),
      ]);

      if (activityRes.status === 401) {
        delete session.fitbit;
        res.status(401).json({ error: 'Fitbit session expired. Please reconnect.' });
        return;
      }

      const activityJson = (await activityRes.json()) as {
        summary?: {
          steps?: number;
          activityCalories?: number;
          caloriesOut?: number;
          fairlyActiveMinutes?: number;
          veryActiveMinutes?: number;
        };
      };

      const heartJson = heartRes.ok
        ? ((await heartRes.json()) as {
            'activities-heart'?: Array<{
              value?: {
                restingHeartRate?: number;
                heartRateZones?: Array<{ name?: string; minutes?: number }>;
              };
            }>;
          })
        : {};

      const summary = activityJson.summary || {};
      const heartDay = heartJson['activities-heart']?.[0]?.value;

      res.json({
        provider: 'fitbit',
        dateKey,
        steps: Math.round(summary.steps || 0),
        activeCalories: Math.round(summary.activityCalories || summary.caloriesOut || 0),
        restingHeartRate: Math.round(heartDay?.restingHeartRate || 0),
        avgHeartRate: 0,
        activeMinutes: Math.round((summary.fairlyActiveMinutes || 0) + (summary.veryActiveMinutes || 0)),
      });
    } catch (err) {
      res.status(502).json({
        error: err instanceof Error ? err.message : 'Failed to fetch Fitbit telemetry',
      });
    }
  });

  app.post('/api/wearables/fitbit/disconnect', (req: Request, res: Response) => {
    const sid = ensureSessionId(req, res);
    const session = sessionStore.get(sid);
    if (session) delete session.fitbit;
    res.json({ ok: true });
  });

  // 5. Strava OAuth 2.0 (Syncs Garmin, Apple Watch, Coros, Polar activities via Strava API)
  app.get('/api/wearables/strava/url', (req: Request, res: Response) => {
    const clientId = process.env.STRAVA_CLIENT_ID;
    const clientSecret = process.env.STRAVA_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      res.status(400).json({
        error: 'STRAVA_NOT_CONFIGURED',
        message: 'STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET must be set in environment secrets.',
        callbackUrl: `${getAppBaseUrl()}/auth/strava/callback`,
      });
      return;
    }

    const sid = ensureSessionId(req, res);
    const redirectUri = `${getAppBaseUrl()}/auth/strava/callback`;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      approval_prompt: 'auto',
      scope: 'read,activity:read_all',
      state: sid,
    });

    res.json({ url: `https://www.strava.com/oauth/authorize?${params.toString()}` });
  });

  const stravaCallback = async (req: Request, res: Response) => {
    const code = typeof req.query.code === 'string' ? req.query.code : '';
    const state = typeof req.query.state === 'string' ? req.query.state : '';
    const errorParam = typeof req.query.error === 'string' ? req.query.error : '';

    if (errorParam || !code) {
      res.status(400).send(`
        <html><body style="font-family:sans-serif;padding:24px;">
          <h3>Strava connection cancelled</h3>
          <script>if(window.opener){window.opener.postMessage({type:'WEARABLE_OAUTH_ERROR',provider:'strava',error:${JSON.stringify(errorParam || 'cancelled')}},'*');setTimeout(()=>window.close(),800);}</script>
        </body></html>
      `);
      return;
    }

    const sid = state || ensureSessionId(req, res);
    const clientId = process.env.STRAVA_CLIENT_ID || '';
    const clientSecret = process.env.STRAVA_CLIENT_SECRET || '';

    try {
      const tokenRes = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
        }),
      });

      const tokenJson = (await tokenRes.json()) as {
        access_token?: string;
        refresh_token?: string;
        expires_at?: number;
        athlete?: { id?: number; firstname?: string; lastname?: string };
      };

      if (!tokenRes.ok || !tokenJson.access_token) {
        res.status(400).send('Strava token exchange failed.');
        return;
      }

      const current = sessionStore.get(sid) || {};
      const fullName = [tokenJson.athlete?.firstname, tokenJson.athlete?.lastname].filter(Boolean).join(' ').trim();
      current.strava = {
        accessToken: tokenJson.access_token,
        refreshToken: tokenJson.refresh_token,
        expiresAt: (tokenJson.expires_at || 0) * 1000,
        userId: tokenJson.athlete?.id ? String(tokenJson.athlete.id) : undefined,
        athleteName: fullName || undefined,
      };
      sessionStore.set(sid, current);

      res.cookie('aresforge_wearable_sid', sid, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 60 * 24 * 30,
        path: '/',
      });

      res.send(`
        <html>
          <body style="font-family:sans-serif;padding:24px;text-align:center;">
            <h3>Strava Connected</h3>
            <p>Activities from your watch are ready to sync.</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'WEARABLE_OAUTH_SUCCESS', provider: 'strava' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
          </body>
        </html>
      `);
    } catch (err) {
      res.status(500).send(`Strava OAuth error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  app.get(['/auth/strava/callback', '/auth/strava/callback/'], stravaCallback);

  app.post('/api/wearables/strava/sync', async (req: Request, res: Response) => {
    const sid = ensureSessionId(req, res);
    const session = sessionStore.get(sid);
    if (!session?.strava?.accessToken) {
      res.status(401).json({ error: 'Strava is not connected.' });
      return;
    }

    try {
      const activitiesRes = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=15', {
        headers: { Authorization: `Bearer ${session.strava.accessToken}` },
      });

      if (activitiesRes.status === 401) {
        delete session.strava;
        res.status(401).json({ error: 'Strava session expired. Please reconnect.' });
        return;
      }

      const activities = (await activitiesRes.json()) as Array<{
        id: number;
        name: string;
        type: string;
        start_date_local: string;
        moving_time: number;
        calories?: number;
        kilojoules?: number;
        average_heartrate?: number;
        device_name?: string;
      }>;

      res.json({
        provider: 'strava',
        activities: (Array.isArray(activities) ? activities : []).map((a) => ({
          id: String(a.id),
          name: a.name,
          type: a.type,
          dateKey: (a.start_date_local || '').slice(0, 10),
          durationMinutes: Math.max(1, Math.round((a.moving_time || 0) / 60)),
          caloriesBurned: Math.round(a.calories || a.kilojoules || Math.round(((a.moving_time || 0) / 60) * 7.5)),
          avgHeartRate: Math.round(a.average_heartrate || 0),
          deviceName: a.device_name || 'Connected Watch',
        })),
      });
    } catch (err) {
      res.status(502).json({
        error: err instanceof Error ? err.message : 'Failed to fetch Strava activities',
      });
    }
  });

  app.post('/api/wearables/strava/disconnect', (req: Request, res: Response) => {
    const sid = ensureSessionId(req, res);
    const session = sessionStore.get(sid);
    if (session) delete session.strava;
    res.json({ ok: true });
  });

  // Vite / Static serving
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      const indexHtml = path.join(distDir, 'index.html');
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ARESFORGE server listening on port ${PORT}`);
  });
}

startServer();
