import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import { Camera, Check, Loader2, RefreshCw, Search, X } from 'lucide-react';
import { fetchProductByBarcode } from '../lib/openFoodFacts';
import { scaleNutrition } from '../lib/servingUtils';
import type { FoodCatalogProduct, MealType } from '../types/fitness';
import { ServingSizeControl } from './ServingSizeControl';

interface BarcodeScannerModalProps {
  defaultMealType: MealType;
  onAddFood: (product: FoodCatalogProduct, servings: number, mealType: MealType) => void;
  onClose: () => void;
}

const SAMPLE_BARCODES = [
  { code: '3017620422003', label: 'Nutella (3017620422003)' },
  { code: '5449000000996', label: 'Coca-Cola (5449000000996)' },
  { code: '0016000275263', label: 'Cheerios (0016000275263)' },
];

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  defaultMealType,
  onAddFood,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  const [cameraActive, setCameraActive] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [foundProduct, setFoundProduct] = useState<FoodCatalogProduct | null>(null);
  const [servings, setServings] = useState(1);
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(undefined);

  const lookupBarcode = async (code: string) => {
    const cleaned = code.trim();
    if (!cleaned) return;
    setIsLookingUp(true);
    setLookupError(null);
    setManualCode(cleaned);

    try {
      const product = await fetchProductByBarcode(cleaned);
      if (!product) {
        setLookupError(`No nutrition record found for barcode ${cleaned}. Try another code or log manually.`);
        setFoundProduct(null);
      } else {
        setFoundProduct(product);
        setServings(1);
        setCameraActive(false);
        controlsRef.current?.stop();
      }
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : 'Unable to reach Open Food Facts database.');
    } finally {
      setIsLookingUp(false);
    }
  };

  useEffect(() => {
    if (!cameraActive || foundProduct) return;

    let cancelled = false;
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
    ]);

    const reader = new BrowserMultiFormatReader(hints);

    async function startCamera() {
      setCameraError(null);
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        if (cancelled) return;
        setCameras(devices);

        // Prefer rear camera on Apple & Android devices
        let targetId = selectedDeviceId;
        if (!targetId && devices.length > 0) {
          const backCam = devices.find((d) => /back|rear|environment/i.test(d.label));
          targetId = (backCam || devices[devices.length - 1]).deviceId;
        }

        if (!videoRef.current) return;
        const controls = await reader.decodeFromVideoDevice(
          targetId,
          videoRef.current,
          (result) => {
            if (result && !cancelled) {
              const text = result.getText();
              if (text) {
                lookupBarcode(text);
              }
            }
          }
        );
        if (cancelled) {
          controls.stop();
        } else {
          controlsRef.current = controls;
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Camera access denied or unavailable.';
          setCameraError(msg);
          setCameraActive(false);
        }
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraActive, selectedDeviceId, foundProduct]);

  const cycleCamera = () => {
    if (cameras.length < 2) return;
    const idx = cameras.findIndex((c) => c.deviceId === selectedDeviceId);
    const next = cameras[(idx + 1) % cameras.length];
    controlsRef.current?.stop();
    setSelectedDeviceId(next.deviceId);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/75 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Barcode food scanner"
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3 sm:hidden" />

        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Scan Food &amp; Drink Barcode</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Powered by Open Food Facts live nutrition database
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close scanner"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Camera Viewfinder */}
          {!foundProduct && (
            <div className="relative overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 aspect-[4/3] flex items-center justify-center">
              {cameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                    autoPlay
                  />
                  {/* Scan reticle */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-36 border-2 border-blue-500/90 rounded-2xl relative shadow-[0_0_0_9999px_rgba(2,6,23,0.45)]">
                      <div className="absolute left-3 right-3 top-1/2 h-0.5 bg-red-500/80" />
                    </div>
                  </div>
                  {cameras.length > 1 && (
                    <button
                      type="button"
                      onClick={cycleCamera}
                      className="absolute top-3 right-3 min-h-[40px] px-3 rounded-xl bg-slate-900/80 text-white text-xs font-medium flex items-center gap-1.5 backdrop-blur-sm"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Switch Camera
                    </button>
                  )}
                </>
              ) : (
                <div className="p-6 text-center space-y-3">
                  <Camera className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-sm text-slate-300 font-medium">
                    {cameraError || 'Camera preview paused'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCameraError(null);
                      setCameraActive(true);
                    }}
                    className="min-h-[44px] px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                  >
                    Enable Camera Scanner
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Manual Barcode Entry */}
          {!foundProduct && (
            <div className="space-y-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  lookupBarcode(manualCode);
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  inputMode="numeric"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Enter UPC / EAN barcode number..."
                  className="flex-1 min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="submit"
                  disabled={isLookingUp || !manualCode.trim()}
                  className="min-h-[44px] px-4 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-50 whitespace-nowrap shrink-0"
                >
                  {isLookingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Lookup
                </button>
              </form>

              <div className="space-y-1.5">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Quick test with real grocery barcodes:
                </p>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_BARCODES.map((sample) => (
                    <button
                      key={sample.code}
                      type="button"
                      onClick={() => lookupBarcode(sample.code)}
                      className="min-h-[36px] px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>

              {lookupError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
                  {lookupError}
                </div>
              )}
            </div>
          )}

          {/* Scanned Product Result */}
          {foundProduct && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-4">
                {foundProduct.imageUrl ? (
                  <img
                    src={foundProduct.imageUrl}
                    alt={foundProduct.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-xl object-cover bg-white shrink-0 border border-slate-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 font-bold text-lg shrink-0">
                    {foundProduct.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {foundProduct.brand} · Barcode {foundProduct.barcode}
                  </p>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {foundProduct.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Serving: {foundProduct.servingLabel}
                  </p>
                </div>
              </div>

              {(() => {
                const scaled = scaleNutrition(foundProduct, servings);
                return (
                  <>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Calories</p>
                        <p className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                          {scaled.calories}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Protein</p>
                        <p className="text-base font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">
                          {scaled.proteinG}g
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Carbs</p>
                        <p className="text-base font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                          {scaled.carbsG}g
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Fat</p>
                        <p className="text-base font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
                          {scaled.fatG}g
                        </p>
                      </div>
                    </div>

                    <ServingSizeControl
                      servingLabel={foundProduct.servingLabel}
                      servings={servings}
                      onChangeServings={setServings}
                    />

                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                        Meal Slot
                      </label>
                      <select
                        value={mealType}
                        onChange={(e) => setMealType(e.target.value as MealType)}
                        className="w-full min-h-[44px] px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                      >
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="snack">Snack</option>
                      </select>
                    </div>

                    <div className="flex gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFoundProduct(null);
                          setCameraActive(true);
                        }}
                        className="min-h-[48px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200"
                      >
                        Scan Again
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onAddFood(foundProduct, servings, mealType);
                          onClose();
                        }}
                        className="flex-1 min-h-[48px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Add to {mealType.charAt(0).toUpperCase() + mealType.slice(1)} · {scaled.calories} kcal
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
