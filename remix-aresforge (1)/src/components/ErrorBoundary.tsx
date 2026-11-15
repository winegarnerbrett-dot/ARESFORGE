import React from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error instanceof Error ? error.message : 'Unexpected display error.',
    };
  }

  componentDidCatch(error: unknown) {
    console.error('ARESFORGE UI ErrorBoundary caught error:', error);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetLocalAndReload = () => {
    try {
      const keys = [
        'aresforge_theme_preference',
        'aresforge_disclaimer_ack',
        'forma_profile',
        'forma_custom_programs',
        'forma_program_prefs',
        'forma_daily_duration_overrides',
        'forma_workout_sessions',
        'forma_nutrition_logs',
        'forma_daily_metrics',
      ];
      for (const k of keys) {
        localStorage.removeItem(k);
      }
    } catch {
      // ignore storage errors
    }
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
          <div className="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              ARESFORGE encountered an unexpected issue
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Your screen failed to render properly. You can reload the app right away without losing
              saved cloud data.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <button
              type="button"
              onClick={this.handleReload}
              className="flex-1 min-h-[44px] px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reload App
            </button>
            <button
              type="button"
              onClick={this.handleResetLocalAndReload}
              className="flex-1 min-h-[44px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Cache &amp; Reload
            </button>
          </div>
        </div>
      </div>
    );
  }
}
