import type { WearablesStatusResponse } from '../types/fitness';

export interface ParsedWearableDay {
  dateKey: string;
  steps: number;
  activeCalories: number;
  restingHeartRate: number;
  avgHeartRate: number;
}

export async function fetchWearableStatus(): Promise<WearablesStatusResponse> {
  const res = await fetch('/api/wearables/status', { credentials: 'include' });
  if (!res.ok) {
    throw new Error('Unable to load wearable connection status');
  }
  return (await res.json()) as WearablesStatusResponse;
}

export async function getWearableOAuthUrl(provider: 'fitbit' | 'strava'): Promise<{
  url?: string;
  error?: string;
  message?: string;
  callbackUrl?: string;
}> {
  const res = await fetch(`/api/wearables/${provider}/url`, { credentials: 'include' });
  return (await res.json()) as {
    url?: string;
    error?: string;
    message?: string;
    callbackUrl?: string;
  };
}

export async function syncFitbitDay(dateKey: string): Promise<{
  dateKey: string;
  steps: number;
  activeCalories: number;
  restingHeartRate: number;
  avgHeartRate: number;
  activeMinutes: number;
}> {
  const res = await fetch('/api/wearables/fitbit/sync', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dateKey }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Fitbit sync failed');
  }
  return data;
}

export async function syncStravaActivities(): Promise<
  Array<{
    id: string;
    name: string;
    type: string;
    dateKey: string;
    durationMinutes: number;
    caloriesBurned: number;
    avgHeartRate: number;
    deviceName: string;
  }>
> {
  const res = await fetch('/api/wearables/strava/sync', {
    method: 'POST',
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Strava sync failed');
  }
  return data.activities || [];
}

export async function disconnectWearable(provider: 'fitbit' | 'strava'): Promise<void> {
  await fetch(`/api/wearables/${provider}/disconnect`, {
    method: 'POST',
    credentials: 'include',
  });
}

// Apple Health / Apple Watch Export Parser (XML, Health Auto Export JSON, or CSV)
export function parseAppleHealthContent(content: string): ParsedWearableDay[] {
  const trimmed = content.trim();
  const byDate = new Map<
    string,
    { steps: number; activeCalories: number; rhrSum: number; rhrCount: number; hrSum: number; hrCount: number }
  >();

  const getBucket = (dateKey: string) => {
    let b = byDate.get(dateKey);
    if (!b) {
      b = { steps: 0, activeCalories: 0, rhrSum: 0, rhrCount: 0, hrSum: 0, hrCount: 0 };
      byDate.set(dateKey, b);
    }
    return b;
  };

  // Format 1: JSON (Health Auto Export iOS app or Apple Health Shortcut JSON)
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    const parsed = JSON.parse(trimmed) as unknown;
    const records: Array<Record<string, unknown>> = [];

    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        if (item && typeof item === 'object') records.push(item as Record<string, unknown>);
      }
    } else if (parsed && typeof parsed === 'object') {
      const obj = parsed as Record<string, unknown>;
      if (obj.data && typeof obj.data === 'object' && Array.isArray((obj.data as Record<string, unknown>).metrics)) {
        const metrics = (obj.data as { metrics: Array<{ name?: string; data?: Array<{ date?: string; qty?: number }> }> }).metrics;
        for (const metric of metrics) {
          const metricName = (metric.name || '').toLowerCase();
          for (const pt of metric.data || []) {
            const dk = (pt.date || '').slice(0, 10);
            if (!/^\d{4}-\d{2}-\d{2}$/.test(dk)) continue;
            const bucket = getBucket(dk);
            const qty = Number(pt.qty || 0);
            if (metricName.includes('step')) bucket.steps += qty;
            else if (metricName.includes('active_energy') || metricName.includes('calories')) bucket.activeCalories += qty;
            else if (metricName.includes('resting_heart_rate')) {
              bucket.rhrSum += qty;
              bucket.rhrCount += 1;
            } else if (metricName.includes('heart_rate')) {
              bucket.hrSum += qty;
              bucket.hrCount += 1;
            }
          }
        }
      } else {
        records.push(obj);
      }
    }

    for (const rec of records) {
      const dk = String(rec.date || rec.dateKey || new Date().toISOString().slice(0, 10)).slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dk)) continue;
      const bucket = getBucket(dk);
      if (typeof rec.steps === 'number') bucket.steps += rec.steps;
      if (typeof rec.activeCalories === 'number') bucket.activeCalories += rec.activeCalories;
      if (typeof rec.restingHeartRate === 'number' && rec.restingHeartRate > 0) {
        bucket.rhrSum += rec.restingHeartRate;
        bucket.rhrCount += 1;
      }
      if (typeof rec.avgHeartRate === 'number' && rec.avgHeartRate > 0) {
        bucket.hrSum += rec.avgHeartRate;
        bucket.hrCount += 1;
      }
    }
  } else if (trimmed.includes('<Record') || trimmed.includes('<HealthData')) {
    // Format 2: Apple Health export.xml
    const recordRegex = /<Record\s+([^>]+?)\/?>(?:<\/Record>)?/g;
    let match: RegExpExecArray | null;
    let iterations = 0;
    while ((match = recordRegex.exec(trimmed)) !== null && iterations < 50000) {
      iterations += 1;
      const attrs = match[1];
      const typeMatch = /type="([^"]+)"/.exec(attrs);
      const valMatch = /value="([^"]+)"/.exec(attrs);
      const dateMatch = /startDate="(\d{4}-\d{2}-\d{2})/.exec(attrs);
      if (!typeMatch || !valMatch || !dateMatch) continue;
      const t = typeMatch[1];
      const val = Number(valMatch[1]);
      const dk = dateMatch[1];
      if (!Number.isFinite(val)) continue;
      const bucket = getBucket(dk);
      if (t.includes('StepCount')) bucket.steps += val;
      else if (t.includes('ActiveEnergyBurned')) bucket.activeCalories += val;
      else if (t.includes('RestingHeartRate')) {
        bucket.rhrSum += val;
        bucket.rhrCount += 1;
      } else if (t.includes('HeartRate')) {
        bucket.hrSum += val;
        bucket.hrCount += 1;
      }
    }
  } else {
    // Format 3: CSV (date,steps,activeCalories,restingHeartRate,avgHeartRate)
    const lines = trimmed.split(/\r?\n/).filter(Boolean);
    for (let i = 0; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      if (i === 0 && !/^\d{4}-\d{2}-\d{2}/.test(cols[0] || '')) continue;
      const dk = (cols[0] || '').slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dk)) continue;
      const bucket = getBucket(dk);
      bucket.steps += Number(cols[1] || 0);
      bucket.activeCalories += Number(cols[2] || 0);
      const rhr = Number(cols[3] || 0);
      if (rhr > 0) {
        bucket.rhrSum += rhr;
        bucket.rhrCount += 1;
      }
      const hr = Number(cols[4] || 0);
      if (hr > 0) {
        bucket.hrSum += hr;
        bucket.hrCount += 1;
      }
    }
  }

  return Array.from(byDate.entries())
    .map(([dateKey, b]) => ({
      dateKey,
      steps: Math.round(b.steps),
      activeCalories: Math.round(b.activeCalories),
      restingHeartRate: b.rhrCount > 0 ? Math.round(b.rhrSum / b.rhrCount) : 0,
      avgHeartRate: b.hrCount > 0 ? Math.round(b.hrSum / b.hrCount) : 0,
    }))
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}

// Garmin Connect Activity Parser (.tcx, .gpx, or Garmin Summary CSV)
export function parseGarminContent(content: string): ParsedWearableDay[] {
  const trimmed = content.trim();

  if (trimmed.includes('<TrainingCenterDatabase') || trimmed.includes('<Activity')) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(trimmed, 'application/xml');
    const dateNode = doc.querySelector('Id') || doc.querySelector('Lap');
    const rawDate = dateNode?.getAttribute('StartTime') || dateNode?.textContent || '';
    const dateKey = /^\d{4}-\d{2}-\d{2}/.test(rawDate) ? rawDate.slice(0, 10) : new Date().toISOString().slice(0, 10);

    let totalCalories = 0;
    doc.querySelectorAll('Lap > Calories').forEach((el) => {
      totalCalories += Number(el.textContent || 0);
    });

    let hrSum = 0;
    let hrCount = 0;
    doc.querySelectorAll('HeartRateBpm > Value').forEach((el) => {
      const val = Number(el.textContent || 0);
      if (val > 25 && val < 240) {
        hrSum += val;
        hrCount += 1;
      }
    });

    let totalSteps = 0;
    doc.querySelectorAll('Steps').forEach((el) => {
      totalSteps += Number(el.textContent || 0);
    });

    return [
      {
        dateKey,
        steps: Math.round(totalSteps),
        activeCalories: Math.round(totalCalories),
        restingHeartRate: 0,
        avgHeartRate: hrCount > 0 ? Math.round(hrSum / hrCount) : 0,
      },
    ];
  }

  if (trimmed.includes('<gpx')) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(trimmed, 'application/xml');
    const timeText = doc.querySelector('metadata > time, trkpt > time')?.textContent || '';
    const dateKey = /^\d{4}-\d{2}-\d{2}/.test(timeText) ? timeText.slice(0, 10) : new Date().toISOString().slice(0, 10);

    let hrSum = 0;
    let hrCount = 0;
    doc.querySelectorAll('*').forEach((el) => {
      if (el.localName === 'hr') {
        const val = Number(el.textContent || 0);
        if (val > 25 && val < 240) {
          hrSum += val;
          hrCount += 1;
        }
      }
    });

    return [
      {
        dateKey,
        steps: 0,
        activeCalories: 0,
        restingHeartRate: 0,
        avgHeartRate: hrCount > 0 ? Math.round(hrSum / hrCount) : 0,
      },
    ];
  }

  return parseAppleHealthContent(trimmed);
}

// Real Web Bluetooth GATT Heart Rate Service (0x180D / 0x2A37)
export interface BluetoothHRConnection {
  deviceName: string;
  disconnect: () => void;
}

export async function connectBluetoothHeartRate(
  onHeartRate: (bpm: number) => void,
  onDisconnect?: () => void
): Promise<BluetoothHRConnection> {
  const nav = navigator as unknown as {
    bluetooth?: {
      requestDevice: (opts: { filters: Array<{ services: number[] }> }) => Promise<{
        name?: string;
        gatt?: {
          connect: () => Promise<{
            disconnect: () => void;
            getPrimaryService: (svc: number) => Promise<{
              getCharacteristic: (char: number) => Promise<{
                startNotifications: () => Promise<void>;
                addEventListener: (ev: string, fn: (e: Event) => void) => void;
              }>;
            }>;
          }>;
        };
        addEventListener: (ev: string, fn: () => void) => void;
      }>;
    };
  };

  if (!nav.bluetooth) {
    throw new Error(
      'Web Bluetooth is not supported in this browser. Use Chrome/Edge on Android or Desktop, or sync via Apple Health / Fitbit.'
    );
  }

  const device = await nav.bluetooth.requestDevice({
    filters: [{ services: [0x180d] }],
  });

  if (!device.gatt) {
    throw new Error('Selected device does not expose GATT heart rate service.');
  }

  const server = await device.gatt.connect();
  const service = await server.getPrimaryService(0x180d);
  const characteristic = await service.getCharacteristic(0x2a37);

  await characteristic.startNotifications();
  characteristic.addEventListener('characteristicvaluechanged', (event: Event) => {
    const target = event.target as unknown as { value?: DataView };
    const value = target?.value;
    if (!value) return;
    const flags = value.getUint8(0);
    const is16Bit = (flags & 0x01) !== 0;
    const bpm = is16Bit ? value.getUint16(1, true) : value.getUint8(1);
    if (bpm > 25 && bpm < 240) {
      onHeartRate(bpm);
    }
  });

  device.addEventListener('gattserverdisconnected', () => {
    onDisconnect?.();
  });

  return {
    deviceName: device.name || 'Bluetooth Heart Rate Monitor',
    disconnect: () => {
      try {
        server.disconnect();
      } catch {
        // ignore
      }
    },
  };
}
