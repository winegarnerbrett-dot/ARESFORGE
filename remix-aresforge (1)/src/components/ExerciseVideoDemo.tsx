import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  Pause,
  Play,
  RotateCcw,
  X,
} from 'lucide-react';
import { resolveExerciseGuide } from '../data/programs';
import type { MovementPattern } from '../types/fitness';

interface ExerciseVideoDemoModalProps {
  exerciseName: string;
  exerciseId?: string;
  pattern?: MovementPattern;
  onClose: () => void;
}

interface JointPose {
  ankle: [number, number];
  knee: [number, number];
  hip: [number, number];
  shoulder: [number, number];
  elbow: [number, number];
  wrist: [number, number];
  head: [number, number];
  backAnkle?: [number, number];
  backKnee?: [number, number];
  equipment?: 'barbell' | 'dumbbell' | 'kettlebell' | 'bench' | 'pullup_bar' | 'box' | 'mat' | 'ropes';
  equipPos?: [number, number];
  guideLineX?: number;
  floorY: number;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// Compute phase weight 0 (start) -> 1 (peak eccentric/bottom) -> 0 (lockout)
function repDepth(progress: number): { depth: number; phase: string; breath: string } {
  if (progress < 0.4) {
    const t = easeInOut(progress / 0.4);
    return { depth: t, phase: 'Eccentric · Controlled Lower', breath: 'Inhale & Brace' };
  }
  if (progress < 0.55) {
    return { depth: 1, phase: 'Bottom Position · Full Tension', breath: 'Hold Core Brace' };
  }
  if (progress < 0.9) {
    const t = easeInOut((progress - 0.55) / 0.35);
    return { depth: 1 - t, phase: 'Concentric · Powerful Drive', breath: 'Exhale Through Effort' };
  }
  return { depth: 0, phase: 'Lockout · Reset Posture', breath: 'Reset Breath' };
}

function computePose(pattern: MovementPattern, progress: number, w: number, h: number): JointPose {
  const { depth } = repDepth(progress);
  const cx = w * 0.48;
  const floorY = h * 0.84;

  switch (pattern) {
    case 'squat': {
      const hipX = lerp(cx - 8, cx - 44, depth);
      const hipY = lerp(floorY - 122, floorY - 62, depth);
      const kneeX = lerp(cx + 6, cx + 34, depth);
      const kneeY = lerp(floorY - 64, floorY - 58, depth);
      const shoulderX = lerp(cx - 4, cx + 8, depth);
      const shoulderY = lerp(hipY - 72, hipY - 56, depth);
      return {
        floorY,
        ankle: [cx, floorY],
        knee: [kneeX, kneeY],
        hip: [hipX, hipY],
        shoulder: [shoulderX, shoulderY],
        elbow: [shoulderX - 10, shoulderY + 26],
        wrist: [shoulderX - 4, shoulderY + 4],
        head: [shoulderX + 6, shoulderY - 22],
        equipment: 'barbell',
        equipPos: [shoulderX - 4, shoulderY - 2],
        guideLineX: cx + 2,
      };
    }
    case 'hinge': {
      const hipX = lerp(cx - 4, cx - 42, depth);
      const hipY = lerp(floorY - 124, floorY - 112, depth);
      const kneeX = lerp(cx + 2, cx + 6, depth);
      const kneeY = lerp(floorY - 64, floorY - 60, depth);
      const shoulderX = lerp(cx - 2, cx + 48, depth);
      const shoulderY = lerp(hipY - 72, hipY - 10, depth);
      const wristX = lerp(cx + 6, cx + 38, depth);
      const wristY = lerp(floorY - 100, floorY - 38, depth);
      return {
        floorY,
        ankle: [cx, floorY],
        knee: [kneeX, kneeY],
        hip: [hipX, hipY],
        shoulder: [shoulderX, shoulderY],
        elbow: [(shoulderX + wristX) / 2, (shoulderY + wristY) / 2],
        wrist: [wristX, wristY],
        head: [shoulderX + 18, shoulderY - 14],
        equipment: 'barbell',
        equipPos: [wristX, wristY],
        guideLineX: cx + 14,
      };
    }
    case 'lunge': {
      const drop = depth * 52;
      const hipX = cx - 6;
      const hipY = floorY - 120 + drop;
      const frontKneeX = cx + 38;
      const frontKneeY = floorY - 62 + drop * 0.15;
      const backKneeX = cx - 42;
      const backKneeY = floorY - 60 + drop * 0.85;
      return {
        floorY,
        ankle: [cx + 36, floorY],
        knee: [frontKneeX, frontKneeY],
        hip: [hipX, hipY],
        backAnkle: [cx - 68, floorY - 8],
        backKnee: [backKneeX, backKneeY],
        shoulder: [hipX + 6, hipY - 70],
        elbow: [hipX + 4, hipY - 38],
        wrist: [hipX + 4, hipY - 12],
        head: [hipX + 8, hipY - 92],
        equipment: 'dumbbell',
        equipPos: [hipX + 4, hipY - 10],
        guideLineX: cx + 36,
      };
    }
    case 'push_horizontal': {
      const benchY = floorY - 54;
      const shoulder: [number, number] = [cx - 28, benchY - 10];
      const wristY = lerp(shoulder[1] - 78, shoulder[1] - 16, depth);
      const elbowX = lerp(shoulder[0] - 2, shoulder[0] - 18, depth);
      const elbowY = lerp(shoulder[1] - 38, shoulder[1] + 6, depth);
      return {
        floorY,
        ankle: [cx + 76, floorY],
        knee: [cx + 74, benchY + 6],
        hip: [cx + 32, benchY - 8],
        shoulder,
        elbow: [elbowX, elbowY],
        wrist: [shoulder[0] + 4, wristY],
        head: [shoulder[0] - 26, benchY - 14],
        equipment: 'bench',
        equipPos: [shoulder[0] + 4, wristY],
        guideLineX: shoulder[0] + 4,
      };
    }
    case 'push_vertical': {
      const shoulder: [number, number] = [cx, floorY - 190];
      const wristY = lerp(shoulder[1] - 68, shoulder[1] - 6, depth);
      const elbowX = lerp(shoulder[0] + 2, shoulder[0] + 18, depth);
      const elbowY = lerp(shoulder[1] - 34, shoulder[1] + 22, depth);
      return {
        floorY,
        ankle: [cx, floorY],
        knee: [cx + 2, floorY - 64],
        hip: [cx - 2, floorY - 122],
        shoulder,
        elbow: [elbowX, elbowY],
        wrist: [shoulder[0] + 4, wristY],
        head: [cx - 6, shoulder[1] - 22],
        equipment: 'barbell',
        equipPos: [shoulder[0] + 4, wristY],
        guideLineX: shoulder[0] + 4,
      };
    }
    case 'pull_horizontal': {
      const hip: [number, number] = [cx - 32, floorY - 116];
      const shoulder: [number, number] = [cx + 34, floorY - 146];
      const wristY = lerp(shoulder[1] + 64, hip[1] + 8, depth);
      const wristX = lerp(shoulder[0] + 4, hip[0] + 32, depth);
      return {
        floorY,
        ankle: [cx - 8, floorY],
        knee: [cx + 4, floorY - 60],
        hip,
        shoulder,
        elbow: [lerp(shoulder[0] - 2, shoulder[0] - 28, depth), lerp(shoulder[1] + 32, shoulder[1] - 12, depth)],
        wrist: [wristX, wristY],
        head: [shoulder[0] + 20, shoulder[1] - 12],
        equipment: 'barbell',
        equipPos: [wristX, wristY],
      };
    }
    case 'pull_vertical': {
      const barY = h * 0.16;
      const raise = (1 - depth) * 58;
      const shoulderY = barY + 78 - raise;
      const hipY = shoulderY + 66;
      return {
        floorY,
        ankle: [cx - 10, hipY + 96],
        knee: [cx + 4, hipY + 52],
        hip: [cx, hipY],
        shoulder: [cx, shoulderY],
        elbow: [lerp(cx + 12, cx + 28, 1 - depth), lerp(barY + 42, shoulderY + 18, 1 - depth)],
        wrist: [cx + 8, barY],
        head: [cx - 4, shoulderY - 22],
        equipment: 'pullup_bar',
        equipPos: [cx, barY],
      };
    }
    case 'curl_raise': {
      const hip: [number, number] = [cx - 2, floorY - 120];
      const shoulder: [number, number] = [cx, floorY - 188];
      const angle = lerp(Math.PI * 0.45, -Math.PI * 0.15, 1 - depth);
      const armLen = 58;
      const wristX = shoulder[0] + Math.cos(angle) * armLen;
      const wristY = shoulder[1] + Math.sin(angle) * armLen;
      return {
        floorY,
        ankle: [cx, floorY],
        knee: [cx + 2, floorY - 62],
        hip,
        shoulder,
        elbow: [shoulder[0] + 10, shoulder[1] + 28],
        wrist: [wristX, wristY],
        head: [cx + 2, shoulder[1] - 22],
        equipment: 'dumbbell',
        equipPos: [wristX, wristY],
      };
    }
    case 'carry_swing': {
      const hipX = lerp(cx + 4, cx - 36, depth);
      const hipY = lerp(floorY - 122, floorY - 108, depth);
      const shoulderX = lerp(cx + 2, cx + 38, depth);
      const shoulderY = lerp(hipY - 72, hipY - 28, depth);
      const bellX = lerp(cx + 62, cx - 10, depth);
      const bellY = lerp(shoulderY + 4, floorY - 46, depth);
      return {
        floorY,
        ankle: [cx, floorY],
        knee: [cx + 8, floorY - 62],
        hip: [hipX, hipY],
        shoulder: [shoulderX, shoulderY],
        elbow: [(shoulderX + bellX) / 2, (shoulderY + bellY) / 2],
        wrist: [bellX, bellY],
        head: [shoulderX + 12, shoulderY - 18],
        equipment: 'kettlebell',
        equipPos: [bellX, bellY],
      };
    }
    case 'cardio_jump': {
      const crouch = depth;
      const jumpLift = Math.sin(progress * Math.PI * 2) > 0.5 ? 28 : 0;
      const hipY = floorY - 118 + crouch * 46 - jumpLift;
      const shoulderY = hipY - 68 + crouch * 14;
      const wristY = shoulderY - crouch * 26 - jumpLift * 0.8;
      return {
        floorY,
        ankle: [cx, floorY - jumpLift],
        knee: [cx + 16 * crouch, floorY - 60 + crouch * 18 - jumpLift],
        hip: [cx - 14 * crouch, hipY],
        shoulder: [cx + 12 * crouch, shoulderY],
        elbow: [cx + 24, shoulderY + 12],
        wrist: [cx + 30, wristY],
        head: [cx + 10 * crouch, shoulderY - 22],
        equipment: 'box',
      };
    }
    case 'core_plank': {
      const pulse = Math.sin(progress * Math.PI * 2) * 2;
      return {
        floorY,
        ankle: [cx - 88, floorY - 8],
        knee: [cx - 38, floorY - 24],
        hip: [cx + 12, floorY - 40 + pulse],
        shoulder: [cx + 68, floorY - 42],
        elbow: [cx + 72, floorY - 6],
        wrist: [cx + 96, floorY - 6],
        head: [cx + 92, floorY - 52],
        equipment: 'mat',
      };
    }
    case 'core_hollow': {
      const ext = depth;
      return {
        floorY,
        ankle: [lerp(cx - 24, cx - 92, ext), lerp(floorY - 64, floorY - 18, ext)],
        knee: [lerp(cx - 12, cx - 50, ext), lerp(floorY - 64, floorY - 16, ext)],
        hip: [cx + 6, floorY - 10],
        shoulder: [cx + 58, floorY - 12],
        elbow: [lerp(cx + 60, cx + 92, ext), lerp(floorY - 48, floorY - 18, ext)],
        wrist: [lerp(cx + 60, cx + 112, ext), lerp(floorY - 74, floorY - 18, ext)],
        head: [cx + 78, floorY - 20],
        equipment: 'mat',
      };
    }
    case 'mobility_flow':
    default: {
      const open = depth;
      return {
        floorY,
        ankle: [cx - 64, floorY - 6],
        knee: [cx - 26, floorY - 36],
        hip: [cx - 8, floorY - 12],
        shoulder: [cx + 42, floorY - 18],
        elbow: [cx + 42 + open * 24, floorY - 44 - open * 22],
        wrist: [cx + 42 + open * 52, floorY - 64 - open * 24],
        head: [cx + 62, floorY - 24],
        equipment: 'mat',
      };
    }
  }
}

export const ExerciseVideoDemoModal: React.FC<ExerciseVideoDemoModalProps> = ({
  exerciseName,
  exerciseId,
  pattern,
  onClose,
}) => {
  const guide = resolveExerciseGuide(exerciseName, exerciseId, pattern);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<0.5 | 1>(1);
  const [progress, setProgress] = useState(0);
  const [showGuides, setShowGuides] = useState(true);

  const progressRef = useRef(0);
  const isPlayingRef = useRef(true);
  const speedRef = useRef<0.5 | 1>(1);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();
    const cycleMs = 3200; // 3.2s realistic rep cadence

    const renderFrame = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;

      if (isPlayingRef.current) {
        progressRef.current = (progressRef.current + (dt * speedRef.current) / cycleMs) % 1;
        setProgress(progressRef.current);
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const dpr = window.devicePixelRatio || 1;
          const width = 460;
          const height = 270;
          if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
            canvas.width = width * dpr;
            canvas.height = height * dpr;
          }
          ctx.save();
          ctx.scale(dpr, dpr);

          // Studio dark backdrop
          ctx.fillStyle = '#0F172A';
          ctx.fillRect(0, 0, width, height);

          // Subtle studio grid
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
          ctx.lineWidth = 1;
          for (let x = 24; x < width; x += 32) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
          }
          for (let y = 24; y < height; y += 32) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
          }

          const pose = computePose(guide.pattern, progressRef.current, width, height);

          // Floor line
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(32, pose.floorY);
          ctx.lineTo(width - 32, pose.floorY);
          ctx.stroke();

          // Optional Alignment & Bar Path Guides
          if (showGuides) {
            if (pose.guideLineX) {
              ctx.save();
              ctx.setLineDash([5, 5]);
              ctx.strokeStyle = 'rgba(16, 185, 129, 0.55)';
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.moveTo(pose.guideLineX, 24);
              ctx.lineTo(pose.guideLineX, pose.floorY);
              ctx.stroke();
              ctx.restore();
            }

            // Neutral Spine Highlight
            ctx.save();
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
            ctx.lineWidth = 10;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(pose.hip[0], pose.hip[1]);
            ctx.lineTo(pose.shoulder[0], pose.shoulder[1]);
            ctx.stroke();
            ctx.restore();
          }

          // Equipment behind body (bench, pullup bar, box, mat)
          if (pose.equipment === 'bench') {
            ctx.fillStyle = '#334155';
            ctx.fillRect(width * 0.48 - 70, pose.floorY - 54, 118, 10);
            ctx.fillRect(width * 0.48 - 54, pose.floorY - 44, 8, 44);
            ctx.fillRect(width * 0.48 + 26, pose.floorY - 44, 8, 44);
          } else if (pose.equipment === 'pullup_bar') {
            ctx.strokeStyle = '#94A3B8';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(width * 0.48 - 70, pose.equipPos?.[1] || 44);
            ctx.lineTo(width * 0.48 + 70, pose.equipPos?.[1] || 44);
            ctx.stroke();
          } else if (pose.equipment === 'mat') {
            ctx.fillStyle = '#1E293B';
            ctx.fillRect(width * 0.48 - 110, pose.floorY - 6, 230, 6);
          } else if (pose.equipment === 'box') {
            ctx.fillStyle = '#1E293B';
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 2;
            ctx.fillRect(width * 0.48 + 46, pose.floorY - 48, 56, 48);
            ctx.strokeRect(width * 0.48 + 46, pose.floorY - 48, 56, 48);
          }

          // Back leg for lunge
          if (pose.backAnkle && pose.backKnee) {
            ctx.strokeStyle = '#64748B';
            ctx.lineWidth = 8;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(pose.hip[0], pose.hip[1]);
            ctx.lineTo(pose.backKnee[0], pose.backKnee[1]);
            ctx.lineTo(pose.backAnkle[0], pose.backAnkle[1]);
            ctx.stroke();
          }

          // Main Kinematic Skeleton
          const drawLimb = (p1: [number, number], p2: [number, number], color: string, widthPx = 8) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = widthPx;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(p1[0], p1[1]);
            ctx.lineTo(p2[0], p2[1]);
            ctx.stroke();
          };

          drawLimb(pose.ankle, pose.knee, '#CBD5E1', 8);
          drawLimb(pose.knee, pose.hip, '#E2E8F0', 9);
          drawLimb(pose.hip, pose.shoulder, '#FFFFFF', 10);
          drawLimb(pose.shoulder, pose.elbow, '#93C5FD', 7);
          drawLimb(pose.elbow, pose.wrist, '#60A5FA', 7);

          // Head
          ctx.fillStyle = '#F8FAFC';
          ctx.beginPath();
          ctx.arc(pose.head[0], pose.head[1], 11, 0, Math.PI * 2);
          ctx.fill();

          // Joints
          const joints: Array<[number, number]> = [
            pose.ankle,
            pose.knee,
            pose.hip,
            pose.shoulder,
            pose.elbow,
            pose.wrist,
          ];
          for (const [jx, jy] of joints) {
            ctx.fillStyle = '#2563EB';
            ctx.beginPath();
            ctx.arc(jx, jy, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }

          // Foreground Equipment (Barbell, Dumbbell, Kettlebell)
          if ((pose.equipment === 'barbell' || pose.equipment === 'bench') && pose.equipPos) {
            ctx.fillStyle = '#2563EB';
            ctx.beginPath();
            ctx.arc(pose.equipPos[0], pose.equipPos[1], 16, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#93C5FD';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#0F172A';
            ctx.beginPath();
            ctx.arc(pose.equipPos[0], pose.equipPos[1], 4, 0, Math.PI * 2);
            ctx.fill();
          } else if (pose.equipment === 'dumbbell' && pose.equipPos) {
            ctx.fillStyle = '#38BDF8';
            ctx.fillRect(pose.equipPos[0] - 11, pose.equipPos[1] - 6, 22, 12);
          } else if (pose.equipment === 'kettlebell' && pose.equipPos) {
            ctx.fillStyle = '#38BDF8';
            ctx.beginPath();
            ctx.arc(pose.equipPos[0], pose.equipPos[1] + 6, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#E2E8F0';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(pose.equipPos[0], pose.equipPos[1] - 2, 5, Math.PI, 0);
            ctx.stroke();
          }

          ctx.restore();
        }
      }

      rafId = requestAnimationFrame(renderFrame);
    };

    rafId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(rafId);
  }, [guide.pattern, showGuides]);

  const { phase, breath } = repDepth(progress);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${guide.name} form video demonstration`}
    >
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3 sm:hidden" />

        <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
              Form &amp; Technique Video
            </p>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight">
              {guide.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {guide.muscleGroup} · {guide.equipment} · Tempo {guide.tempo}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close demonstration"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Video Canvas Player */}
          <div className="overflow-hidden rounded-2xl bg-slate-900 border border-slate-800">
            <div className="relative aspect-[460/270] w-full">
              <canvas
                ref={canvasRef}
                className="w-full h-full block"
              />
              {/* Phase & Breath Overlay */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                <div className="bg-slate-950/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-800">
                  <p className="text-[11px] font-medium text-slate-400">Movement Phase</p>
                  <p className="text-xs font-semibold text-white">{phase}</p>
                </div>
                <div className="bg-slate-950/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-800 text-right">
                  <p className="text-[11px] font-medium text-slate-400">Breathing</p>
                  <p className="text-xs font-semibold text-emerald-400">{breath}</p>
                </div>
              </div>
            </div>

            {/* Video Transport Bar */}
            <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 space-y-2.5">
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(progress * 100)}
                onChange={(e) => {
                  const val = Number(e.target.value) / 100;
                  setIsPlaying(false);
                  progressRef.current = val;
                  setProgress(val);
                }}
                aria-label="Scrub demonstration timeline"
                className="w-full accent-blue-500 cursor-pointer h-2"
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPlaying((p) => !p)}
                    className="min-h-[40px] px-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    {isPlaying ? 'Pause' : 'Play'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      progressRef.current = 0;
                      setProgress(0);
                      setIsPlaying(true);
                    }}
                    aria-label="Restart demonstration"
                    className="min-h-[40px] min-w-[40px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSpeed((s) => (s === 1 ? 0.5 : 1))}
                    className={`min-h-[40px] px-3 rounded-lg text-xs font-mono font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      speed === 0.5
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    {speed === 0.5 ? '0.5x Slow-Mo' : '1.0x Speed'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGuides((g) => !g)}
                    className={`min-h-[40px] px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                      showGuides
                        ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Alignment
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Form Cues & Safety Mistakes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                Proper Technique Cues
              </div>
              <ul className="space-y-2">
                {guide.cues.map((cue, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed flex gap-2">
                    <span className="font-mono text-xs text-slate-400 shrink-0 mt-0.5">0{idx + 1}.</span>
                    <span>{cue}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                Common Form Mistakes
              </div>
              <ul className="space-y-2">
                {guide.mistakes.map((mistake, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    • {mistake}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
