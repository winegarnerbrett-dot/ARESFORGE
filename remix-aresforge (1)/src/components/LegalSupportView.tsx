import React from 'react';
import {
  ArrowLeft,
  Download,
  FileText,
  HelpCircle,
  Lock,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import aresForgeCrestUrl from '../assets/images/aresforge_tactical_crest_1794714160036.jpg';

export type LegalSection = 'privacy' | 'terms' | 'support';

interface LegalSupportViewProps {
  section: LegalSection;
  onChangeSection: (section: LegalSection) => void;
  onClose?: () => void;
  standalone?: boolean;
  onExportData?: () => void;
  onOpenAccountControls?: () => void;
}

const SECTION_TABS: Array<{ id: LegalSection; label: string; icon: React.FC<{ className?: string }> }> = [
  { id: 'privacy', label: 'Privacy Policy', icon: Lock },
  { id: 'terms', label: 'Terms & Safety', icon: FileText },
  { id: 'support', label: 'Support & Help', icon: HelpCircle },
];

export const LegalSupportView: React.FC<LegalSupportViewProps> = ({
  section,
  onChangeSection,
  onClose,
  standalone = false,
  onExportData,
  onOpenAccountControls,
}) => {
  return (
    <div
      className={
        standalone
          ? 'min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6'
          : 'w-full'
      }
    >
      <div className={standalone ? 'max-w-3xl mx-auto space-y-6' : 'space-y-5'}>
        {standalone && (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={aresForgeCrestUrl}
                alt="ARESFORGE logo"
                className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 bg-slate-900"
              />
              <div>
                <p className="text-base font-extrabold tracking-wider text-slate-900 dark:text-white">
                  ARESFORGE
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Privacy, Safety &amp; App Support
                </p>
              </div>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="min-h-[40px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to App
              </button>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80">
          {SECTION_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = section === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeSection(tab.id)}
                className={`flex-1 min-w-[120px] min-h-[40px] px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  active
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {section === 'privacy' && (
            <>
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  ARESFORGE Privacy Policy
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Effective Date: April 2025 · Applies to iOS, Android, and Web
                </p>
              </div>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  1. Data We Collect &amp; How It Is Used
                </h2>
                <p>
                  ARESFORGE is designed to minimize data collection. You can use all core workout
                  tracking, nutrition logging, and hydration features locally on your device without
                  creating an account.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                  <li>
                    <strong>Training &amp; Nutrition Data:</strong> Custom workout programs, completed
                    workout sets/sessions, meal entries, water intake, body weight entries, and
                    daily fitness goals are stored locally in your browser/app storage and, only if
                    you choose to sign in, synced securely to your private Firebase Firestore user
                    workspace.
                  </li>
                  <li>
                    <strong>Optional Account Sign-In:</strong> If you opt into Google Sign-In for
                    cross-device cloud sync, we store your Firebase User ID and display name/email
                    solely to authenticate and isolate your cloud fitness records.
                  </li>
                  <li>
                    <strong>Wearables &amp; Health Imports:</strong> Apple Health XML/CSV/Shortcut
                    exports, Garmin exports, Fitbit/Strava telemetry (if manually connected), and
                    Bluetooth Low Energy heart rate readings are processed directly for your personal
                    fitness dashboard.
                  </li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  2. Camera &amp; Barcode Scanner Usage
                </h2>
                <p>
                  Camera access is requested only when you tap <strong>Scan Food</strong> to read
                  packaged food barcodes (UPC/EAN/Code-128). Barcode decoding happens on-device in
                  real time. ARESFORGE never records, saves, or uploads camera photos or video. When
                  a barcode is detected, only the numeric barcode string is sent to Open Food Facts
                  to retrieve public nutrition label data.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  3. Zero Advertising or Third-Party Tracking
                </h2>
                <p>
                  ARESFORGE contains no advertising SDKs, no behavioral ad tracking, and never sells
                  or rents your health, workout, or nutrition records to third parties.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  4. Data Retention, Export &amp; Permanent Account Deletion
                </h2>
                <p>
                  You remain in full control of your data. At any time inside{' '}
                  <strong>Profile → Privacy, Data &amp; Support</strong>, you can:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                  <li>Export a complete JSON archive of your workouts, programs, nutrition, and metrics.</li>
                  <li>Clear all locally cached device data.</li>
                  <li>
                    Permanently delete your ARESFORGE account and every associated cloud record
                    (profile, custom programs, workout sessions, nutrition logs, and daily metrics).
                  </li>
                </ul>
              </section>
            </>
          )}

          {section === 'terms' && (
            <>
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Terms of Use &amp; Health/Fitness Disclaimer
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Important Safety &amp; Medical Information
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-4 text-amber-900 dark:text-amber-200 text-xs sm:text-sm space-y-1.5">
                <p className="font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  Medical &amp; Physical Readiness Disclaimer
                </p>
                <p>
                  ARESFORGE is an informational fitness, athletic conditioning, and nutrition tracking
                  tool. It is <strong>not</strong> a medical device and does not provide medical
                  diagnosis, treatment, or clinical advice. Consult a qualified physician before
                  starting any high-intensity, tactical, Army Fitness Test (AFT), or law enforcement
                  conditioning program or changing your daily calorie targets—especially if you have
                  cardiovascular, orthopedic, or metabolic conditions. Stop exercising immediately if
                  you experience dizziness, chest pain, or acute injury.
                </p>
              </div>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  1. Nutrition &amp; Calorie Estimates
                </h2>
                <p>
                  Calorie and macronutrient recommendations are calculated from general physiological
                  equations (Mifflin-St Jeor BMR and activity multipliers) and third-party open food
                  databases. Food packaging labels may change by region and manufacturer; verify
                  allergen and nutrition facts directly against physical product labels.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  2. Acceptable Use &amp; Eligibility
                </h2>
                <p>
                  ARESFORGE is intended for users aged 13 and older. By using the app, you agree to
                  use workout, wearable, and nutrition tracking tools responsibly and in accordance
                  with applicable laws.
                </p>
              </section>
            </>
          )}

          {section === 'support' && (
            <>
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  ARESFORGE Support &amp; Troubleshooting
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Guides for iPhone, iPad, Android, and Web
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 space-y-1.5">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Camera Barcode Scanner Not Opening?
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Ensure Camera permission is allowed for ARESFORGE in iOS Settings (or Safari
                    website settings). You can also enter any UPC/EAN barcode digits manually inside
                    the Scan Food modal at any time.
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 space-y-1.5">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    How Do I Sync Apple Watch or Garmin Data?
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Open <strong>Profile → Wearables</strong> to import Apple Health XML/CSV exports,
                    paste Apple Shortcut health JSON payloads, connect Bluetooth Low Energy heart rate
                    monitors, or sync connected wearable accounts.
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 space-y-1.5">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    How Do I Permanently Delete My Account &amp; Data?
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Go to <strong>Profile → Privacy, Data &amp; Support</strong> and select{' '}
                    <strong>Delete Account &amp; Data</strong> (when signed in) or{' '}
                    <strong>Clear Local Data</strong> (for offline/guest mode). Account deletion
                    immediately purges your user record, custom programs, workouts, nutrition logs,
                    and daily metrics.
                  </p>
                </div>

                {(onExportData || onOpenAccountControls) && (
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {onExportData && (
                      <button
                        type="button"
                        onClick={onExportData}
                        className="min-h-[42px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Export Data (JSON)
                      </button>
                    )}
                    {onOpenAccountControls && (
                      <button
                        type="button"
                        onClick={onOpenAccountControls}
                        className="min-h-[42px] px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Manage or Delete Account
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

interface LegalSupportModalProps {
  initialSection: LegalSection;
  onClose: () => void;
  onExportData: () => void;
}

export const LegalSupportModal: React.FC<LegalSupportModalProps> = ({
  initialSection,
  onClose,
  onExportData,
}) => {
  const [section, setSection] = React.useState<LegalSection>(initialSection);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/75 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Privacy, Terms, and Support"
    >
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <img
              src={aresForgeCrestUrl}
              alt="ARESFORGE logo"
              className="w-7 h-7 rounded-lg object-cover border border-slate-200 dark:border-slate-700 bg-slate-900"
            />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              ARESFORGE Legal &amp; Support
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close legal and support modal"
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto">
          <LegalSupportView
            section={section}
            onChangeSection={setSection}
            onExportData={onExportData}
          />
        </div>
      </div>
    </div>
  );
};
