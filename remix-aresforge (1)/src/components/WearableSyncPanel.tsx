import React, { useEffect, useState } from 'react';
import {
  Activity,
  Bluetooth,
  CheckCircle2,
  ExternalLink,
  HeartPulse,
  Loader2,
  RefreshCw,
  Upload,
  Watch,
  X,
} from 'lucide-react';
import {
  connectBluetoothHeartRate,
  disconnectWearable,
  fetchWearableStatus,
  getWearableOAuthUrl,
  parseAppleHealthContent,
  parseGarminContent,
  syncFitbitDay,
  syncStravaActivities,
  type BluetoothHRConnection,
  type ParsedWearableDay,
} from '../lib/wearables';
import type { WearableSource, WearablesStatusResponse } from '../types/fitness';

interface WearableSyncModalProps {
  selectedDateKey: string;
  liveHeartRate: number | null;
  bleDeviceName: string | null;
  onUpdateBleHeartRate: (bpm: number | null, deviceName: string | null, conn: BluetoothHRConnection | null) => void;
  onImportWearableDays: (days: ParsedWearableDay[], source: WearableSource) => void;
  onClose: () => void;
}

export const WearableSyncModal: React.FC<WearableSyncModalProps> = ({
  selectedDateKey,
  liveHeartRate,
  bleDeviceName,
  onUpdateBleHeartRate,
  onImportWearableDays,
  onClose,
}) => {
  const [status, setStatus] = useState<WearablesStatusResponse | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [syncingProvider, setSyncingProvider] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [shortcutJson, setShortcutJson] = useState('');
  const [setupInfoProvider, setSetupInfoProvider] = useState<'fitbit' | 'strava' | null>(null);

  const loadStatus = async () => {
    setLoadingStatus(true);
    try {
      const s = await fetchWearableStatus();
      setStatus(s);
    } catch {
      // ignore if offline
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    loadStatus();

    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) return;
      if (event.data?.type === 'WEARABLE_OAUTH_SUCCESS') {
        const provider = event.data.provider as 'fitbit' | 'strava';
        loadStatus();
        setFeedback({
          type: 'success',
          message: `${provider === 'fitbit' ? 'Fitbit' : 'Strava'} connected. Tap Sync Now to pull activity metrics.`,
        });
      } else if (event.data?.type === 'WEARABLE_OAUTH_ERROR') {
        setFeedback({
          type: 'error',
          message: `Connection cancelled or denied (${event.data.error || 'unknown'}).`,
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleConnectOAuth = async (provider: 'fitbit' | 'strava') => {
    setFeedback(null);
    setSetupInfoProvider(null);
    try {
      const res = await getWearableOAuthUrl(provider);
      if (res.error || !res.url) {
        setSetupInfoProvider(provider);
        setFeedback({
          type: 'info',
          message:
            res.message ||
            `${provider === 'fitbit' ? 'Fitbit' : 'Strava'} OAuth client credentials are not yet configured in environment secrets.`,
        });
        return;
      }
      const popup = window.open(res.url, 'wearable_oauth', 'width=600,height=720');
      if (!popup) {
        setFeedback({
          type: 'error',
          message: 'Popup blocked by your browser. Please allow popups for this site and try again.',
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Unable to start OAuth connection.',
      });
    }
  };

  const handleSyncFitbit = async () => {
    setSyncingProvider('fitbit');
    setFeedback(null);
    try {
      const data = await syncFitbitDay(selectedDateKey);
      onImportWearableDays(
        [
          {
            dateKey: data.dateKey,
            steps: data.steps,
            activeCalories: data.activeCalories,
            restingHeartRate: data.restingHeartRate,
            avgHeartRate: data.avgHeartRate,
          },
        ],
        'fitbit'
      );
      setFeedback({
        type: 'success',
        message: `Synced Fitbit for ${data.dateKey}: ${data.steps.toLocaleString()} steps, ${data.activeCalories} active kcal.`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Fitbit sync failed.',
      });
    } finally {
      setSyncingProvider(null);
    }
  };

  const handleSyncStrava = async () => {
    setSyncingProvider('strava');
    setFeedback(null);
    try {
      const activities = await syncStravaActivities();
      if (activities.length === 0) {
        setFeedback({ type: 'info', message: 'No recent activities found on connected Strava account.' });
      } else {
        const grouped = new Map<string, ParsedWearableDay>();
        for (const act of activities) {
          const cur = grouped.get(act.dateKey) || {
            dateKey: act.dateKey,
            steps: 0,
            activeCalories: 0,
            restingHeartRate: 0,
            avgHeartRate: 0,
          };
          cur.activeCalories += act.caloriesBurned;
          if (act.avgHeartRate > 0) cur.avgHeartRate = act.avgHeartRate;
          grouped.set(act.dateKey, cur);
        }
        const days = Array.from(grouped.values());
        onImportWearableDays(days, 'strava');
        setFeedback({
          type: 'success',
          message: `Synced ${activities.length} watch activities across ${days.length} day(s) from Strava.`,
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Strava sync failed.',
      });
    } finally {
      setSyncingProvider(null);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    kind: 'apple_health' | 'garmin'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSyncingProvider(kind);
    setFeedback(null);
    try {
      const text = await file.text();
      const parsed = kind === 'apple_health' ? parseAppleHealthContent(text) : parseGarminContent(text);
      if (parsed.length === 0) {
        setFeedback({
          type: 'error',
          message: `No step, heart rate, or calorie records were detected in ${file.name}.`,
        });
      } else {
        onImportWearableDays(parsed, kind);
        setFeedback({
          type: 'success',
          message: `Imported ${parsed.length} day(s) of activity telemetry from ${file.name}.`,
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Unable to parse wearable export file.',
      });
    } finally {
      setSyncingProvider(null);
      event.target.value = '';
    }
  };

  const handleImportShortcutJson = () => {
    if (!shortcutJson.trim()) return;
    try {
      const parsed = parseAppleHealthContent(shortcutJson);
      if (parsed.length === 0) {
        setFeedback({
          type: 'error',
          message: 'No valid date/steps/calories/heart rate fields found in pasted payload.',
        });
        return;
      }
      onImportWearableDays(parsed, 'apple_health');
      setShortcutJson('');
      setFeedback({
        type: 'success',
        message: `Imported ${parsed.length} day(s) of Apple Watch health telemetry.`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Invalid JSON or CSV format.',
      });
    }
  };

  const handleConnectBle = async () => {
    setSyncingProvider('ble');
    setFeedback(null);
    try {
      const conn = await connectBluetoothHeartRate(
        (bpm) => {
          onUpdateBleHeartRate(bpm, conn.deviceName, conn);
        },
        () => {
          onUpdateBleHeartRate(null, null, null);
        }
      );
      onUpdateBleHeartRate(liveHeartRate, conn.deviceName, conn);
      setFeedback({
        type: 'success',
        message: `Connected to ${conn.deviceName}. Streaming live heart rate.`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Bluetooth pairing cancelled or unavailable.',
      });
    } finally {
      setSyncingProvider(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Sync wearable devices"
    >
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3 sm:hidden" />

        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Sync Wearable Devices
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Connect Fitbit, Garmin, Apple Watch, or a Bluetooth heart rate monitor
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close wearable sync"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {feedback && (
            <div
              className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'
                  : feedback.type === 'error'
                  ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-800 dark:text-red-300'
                  : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300'
              }`}
            >
              {feedback.message}
            </div>
          )}

          {/* 1. Fitbit OAuth 2.0 */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Fitbit Web API (OAuth 2.0)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {status?.fitbit.connected
                      ? `Connected (${status.fitbit.accountLabel || 'Active Session'}) · Syncs steps, active kcal & resting HR`
                      : 'Automatically sync daily steps, resting heart rate, and active calories.'}
                  </p>
                </div>
              </div>

              {loadingStatus ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              ) : status?.fitbit.connected ? (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleSyncFitbit}
                    disabled={syncingProvider === 'fitbit'}
                    className="min-h-[40px] px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncingProvider === 'fitbit' ? 'animate-spin' : ''}`} />
                    Sync {selectedDateKey}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await disconnectWearable('fitbit');
                      loadStatus();
                    }}
                    className="min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleConnectOAuth('fitbit')}
                  className="min-h-[40px] px-4 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  Connect Fitbit
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {setupInfoProvider === 'fitbit' && status?.fitbit && (
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                <p className="font-semibold text-slate-900 dark:text-white">
                  Fitbit Developer Configuration Required
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  Add <code className="font-mono text-blue-600">FITBIT_CLIENT_ID</code> and{' '}
                  <code className="font-mono text-blue-600">FITBIT_CLIENT_SECRET</code> in Secrets and register this Redirect URL:
                </p>
                <p className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 p-2 rounded-lg break-all select-all text-slate-800 dark:text-slate-200">
                  {status.fitbit.callbackUrl}
                </p>
              </div>
            )}
          </div>

          {/* 2. Apple Watch / Apple Health Direct Importer */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <Watch className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Apple Watch &amp; Apple Health
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Import Apple Health <code className="font-mono">export.xml</code>, Health Auto Export <code className="font-mono">.json</code>, or <code className="font-mono">.csv</code>
                  </p>
                </div>
              </div>

              <label className="min-h-[40px] px-4 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0">
                <Upload className="w-3.5 h-3.5" />
                Import File
                <input
                  type="file"
                  accept=".xml,.json,.csv"
                  onChange={(e) => handleFileUpload(e, 'apple_health')}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Or paste iOS Shortcut / CSV daily summary (e.g., <code className="font-mono">2026-11-14,9420,480,58,112</code>)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shortcutJson}
                  onChange={(e) => setShortcutJson(e.target.value)}
                  placeholder='{"date":"2026-11-14","steps":9420,"activeCalories":480,"restingHeartRate":58}'
                  className="flex-1 min-h-[40px] px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleImportShortcutJson}
                  disabled={!shortcutJson.trim()}
                  className="min-h-[40px] px-3.5 rounded-xl bg-blue-600 text-white text-xs font-semibold disabled:opacity-40 whitespace-nowrap shrink-0"
                >
                  Import
                </button>
              </div>
            </div>
          </div>

          {/* 3. Garmin & Multi-Watch Sync (TCX/GPX + Strava OAuth) */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Watch className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Garmin Connect &amp; Strava Watch Sync
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Import Garmin <code className="font-mono">.tcx</code> / <code className="font-mono">.gpx</code> / <code className="font-mono">.csv</code> exports or link Strava OAuth.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <label className="min-h-[40px] px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  Garmin File
                  <input
                    type="file"
                    accept=".tcx,.gpx,.csv"
                    onChange={(e) => handleFileUpload(e, 'garmin')}
                    className="hidden"
                  />
                </label>

                {status?.strava.connected ? (
                  <button
                    type="button"
                    onClick={handleSyncStrava}
                    disabled={syncingProvider === 'strava'}
                    className="min-h-[40px] px-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncingProvider === 'strava' ? 'animate-spin' : ''}`} />
                    Sync Strava
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleConnectOAuth('strava')}
                    className="min-h-[40px] px-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    Connect Strava
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {setupInfoProvider === 'strava' && status?.strava && (
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                <p className="font-semibold text-slate-900 dark:text-white">
                  Strava API Configuration Required
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  Add <code className="font-mono text-blue-600">STRAVA_CLIENT_ID</code> and{' '}
                  <code className="font-mono text-blue-600">STRAVA_CLIENT_SECRET</code> in Secrets and register this Callback URL:
                </p>
                <p className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 p-2 rounded-lg break-all select-all text-slate-800 dark:text-slate-200">
                  {status.strava.callbackUrl}
                </p>
              </div>
            )}
          </div>

          {/* 4. Live Bluetooth Heart Rate Monitor (Web Bluetooth 0x180D) */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Bluetooth className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Live Bluetooth Heart Rate (BLE)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {bleDeviceName
                    ? `Streaming from ${bleDeviceName}${liveHeartRate ? ` · ${liveHeartRate} BPM` : ''}`
                    : 'Pair Garmin HR broadcast, Polar, Wahoo, or BLE fitness straps directly on Android/Desktop.'}
                </p>
              </div>
            </div>

            {bleDeviceName ? (
              <div className="flex items-center gap-2 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-sm font-mono font-bold text-rose-600 dark:text-rose-400">
                  <HeartPulse className="w-4 h-4" />
                  {liveHeartRate ?? '--'} BPM
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
            ) : (
              <button
                type="button"
                onClick={handleConnectBle}
                disabled={syncingProvider === 'ble'}
                className="min-h-[40px] px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
              >
                {syncingProvider === 'ble' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Bluetooth className="w-3.5 h-3.5" />
                )}
                Pair Sensor
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
