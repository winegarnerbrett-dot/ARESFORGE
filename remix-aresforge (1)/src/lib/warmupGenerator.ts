import { resolveExerciseGuide } from '../data/programs';
import type {
  ExperienceLevel,
  MovementPattern,
  ProgramDay,
  ProgramExercise,
  WorkoutProgram,
} from '../types/fitness';

export type WarmupDurationChoice = 5 | 8 | 10;
export type WarmupPhase = 'Raise' | 'Mobilize' | 'Activate' | 'Potentiate';

export interface WarmupDrill {
  id: string;
  phase: WarmupPhase;
  name: string;
  durationSeconds: number;
  prescription: string;
  cue: string;
  targetExercises: string[];
  exerciseId?: string;
  pattern?: MovementPattern;
}

export interface GeneratedWarmupSequence {
  targetMinutes: WarmupDurationChoice;
  totalSeconds: number;
  displayMinutes: number;
  focusSummary: string;
  patternsDetected: MovementPattern[];
  drills: WarmupDrill[];
}

interface AnalyzedExercise {
  name: string;
  muscleGroup: string;
  pattern: MovementPattern;
}

const PATTERN_LABEL: Record<MovementPattern, string> = {
  squat: 'Squat',
  hinge: 'Hinge',
  lunge: 'Unilateral Leg',
  push_horizontal: 'Horizontal Push',
  push_vertical: 'Overhead Press',
  pull_horizontal: 'Row / Upper Back',
  pull_vertical: 'Vertical Pull',
  curl_raise: 'Shoulders & Arms',
  core_plank: 'Core Bracing',
  core_hollow: 'Anterior Core',
  carry_swing: 'Carries & Sled',
  cardio_jump: 'Running & Plyo',
  mobility_flow: 'Joint Flow',
};

export function getRecommendedWarmupMinutes(
  program: WorkoutProgram,
  exercises: ProgramExercise[],
  experienceLevel: ExperienceLevel
): WarmupDurationChoice {
  const hasHeavyLower = exercises.some((ex) => {
    const p = resolveExerciseGuide(ex.name, ex.exerciseId, ex.pattern).pattern;
    return p === 'squat' || p === 'hinge';
  });
  if (program.estimatedMinutes <= 35 && !hasHeavyLower) return 5;
  if (program.estimatedMinutes >= 55 || (experienceLevel === 'Advanced' && hasHeavyLower)) {
    return 10;
  }
  return 8;
}

function uniqueNames(names: string[], max = 3): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const n of names) {
    const clean = n.trim();
    if (clean && !seen.has(clean)) {
      seen.add(clean);
      out.push(clean);
      if (out.length >= max) break;
    }
  }
  return out;
}

function scaleDurationSeconds(baseSeconds: number, factor: number, min = 35, max = 120): number {
  const raw = Math.round((baseSeconds * factor) / 5) * 5;
  return Math.max(min, Math.min(max, raw));
}

export function generateDynamicWarmup(params: {
  program: WorkoutProgram;
  activeDay: ProgramDay;
  exercises: ProgramExercise[];
  experienceLevel: ExperienceLevel;
  targetMinutes?: WarmupDurationChoice;
}): GeneratedWarmupSequence {
  const { program, activeDay, exercises, experienceLevel } = params;
  const targetMinutes =
    params.targetMinutes ?? getRecommendedWarmupMinutes(program, exercises, experienceLevel);

  const analyzed: AnalyzedExercise[] = exercises.map((ex) => {
    const guide = resolveExerciseGuide(ex.name, ex.exerciseId, ex.pattern);
    return {
      name: ex.name,
      muscleGroup: ex.muscleGroup || guide.muscleGroup,
      pattern: ex.pattern || guide.pattern,
    };
  });

  const byPattern = (patterns: MovementPattern[]): string[] =>
    uniqueNames(
      analyzed.filter((a) => patterns.includes(a.pattern)).map((a) => a.name),
      3
    );

  const patternsDetected = Array.from(new Set(analyzed.map((a) => a.pattern)));
  const allTargets = uniqueNames(analyzed.map((a) => a.name), 3);

  const hasLower = patternsDetected.some((p) =>
    ['squat', 'hinge', 'lunge', 'carry_swing', 'cardio_jump'].includes(p)
  );
  const hasSquatOrLunge = patternsDetected.some((p) => p === 'squat' || p === 'lunge');
  const hasHingeOrCarry = patternsDetected.some((p) => p === 'hinge' || p === 'carry_swing');
  const hasUpperPush = patternsDetected.some(
    (p) => p === 'push_horizontal' || p === 'push_vertical'
  );
  const hasUpperPull = patternsDetected.some(
    (p) => p === 'pull_horizontal' || p === 'pull_vertical' || p === 'curl_raise'
  );
  const hasCore = patternsDetected.some((p) => p === 'core_plank' || p === 'core_hollow');
  const hasConditioning = patternsDetected.some(
    (p) => p === 'cardio_jump' || p === 'carry_swing'
  );

  const candidates: WarmupDrill[] = [];

  // 1. RAISE PHASE (pulse + core temperature)
  if (hasConditioning) {
    candidates.push({
      id: 'wu-raise-skip',
      phase: 'Raise',
      name:
        experienceLevel === 'Beginner'
          ? 'Brisk High-Knee March & Arm Swings'
          : 'A-Skip Cadence & Jumping Jacks',
      durationSeconds: 75,
      prescription:
        experienceLevel === 'Beginner' ? '75s rhythmic march' : '75s light elastic bounce',
      cue: 'Breathe through your nose/mouth steadily and elevate heart rate to ~110–125 bpm without fatiguing legs.',
      targetExercises: uniqueNames(
        [...byPattern(['cardio_jump', 'carry_swing']), ...allTargets],
        2
      ),
      pattern: 'cardio_jump',
    });
  } else if (hasLower) {
    candidates.push({
      id: 'wu-raise-squat-march',
      phase: 'Raise',
      name: 'In-Place Brisk March to Alternating Reach',
      durationSeconds: 60,
      prescription: '60s continuous flow',
      cue: 'Drive knees smoothly to hip height and swing opposite arms to raise core muscle temperature.',
      targetExercises: allTargets.slice(0, 2),
      pattern: 'cardio_jump',
    });
  } else {
    candidates.push({
      id: 'wu-raise-jacks',
      phase: 'Raise',
      name: 'Seal Jacks & Torso Twist Warmup',
      durationSeconds: 60,
      prescription: '60s steady tempo',
      cue: 'Open chest wide as arms sweep horizontally to warm shoulder capsules and elevate blood flow.',
      targetExercises: allTargets.slice(0, 2),
      pattern: 'push_horizontal',
    });
  }

  // 2. MOBILIZE PHASE (joint capsules matched to scheduled patterns)
  if (hasSquatOrLunge) {
    const squatTargets = byPattern(['squat', 'lunge']);
    candidates.push({
      id: 'wu-mob-wgs',
      phase: 'Mobilize',
      name: 'World’s Greatest Stretch + Ankle Rocks',
      durationSeconds: 75,
      prescription: '5 / side · 2s pause',
      cue: 'Step into a deep lunge, drive front knee gently over toes, then rotate chest open toward the ceiling.',
      targetExercises: squatTargets,
      exerciseId: 'ex-worlds-greatest-stretch',
      pattern: 'mobility_flow',
    });
  }

  if (hasHingeOrCarry) {
    const hingeTargets = byPattern(['hinge', 'carry_swing']);
    candidates.push({
      id: 'wu-mob-9090',
      phase: 'Mobilize',
      name: '90/90 Hip Capsule Switches',
      durationSeconds: 60,
      prescription: '8–10 slow switches',
      cue: 'Keep torso tall while rotating both hips internally and externally so deadlifts and carries stay spine-neutral.',
      targetExercises: hingeTargets,
      exerciseId: 'ex-90-90-hip',
      pattern: 'mobility_flow',
    });
  }

  if (hasUpperPush || hasUpperPull) {
    const upperTargets = byPattern([
      'push_horizontal',
      'push_vertical',
      'pull_horizontal',
      'pull_vertical',
    ]);
    candidates.push({
      id: 'wu-mob-thoracic',
      phase: 'Mobilize',
      name: 'Open-Book Thoracic Rotation & Scapular Slides',
      durationSeconds: 60,
      prescription: '6 / side + 8 wall slides',
      cue: 'Pin knees together on the floor and exhale as shoulders open to unlock upper-back extension.',
      targetExercises: upperTargets,
      exerciseId: 'ex-thoracic-flow',
      pattern: 'mobility_flow',
    });
  }

  // Ensure at least 1 mobility drill even for mobility-only or arm-focused sessions
  if (!hasSquatOrLunge && !hasHingeOrCarry && !hasUpperPush && !hasUpperPull) {
    candidates.push({
      id: 'wu-mob-flow',
      phase: 'Mobilize',
      name: 'Cat-Cow Spine Wave & Shoulder Circles',
      durationSeconds: 60,
      prescription: '8 slow cycles',
      cue: 'Articulate one vertebra at a time while syncing deep diaphragmatic breaths.',
      targetExercises: allTargets.slice(0, 2),
      exerciseId: 'ex-thoracic-flow',
      pattern: 'mobility_flow',
    });
  }

  // 3. ACTIVATE PHASE (prime stabilizers for scheduled work)
  if (hasHingeOrCarry || hasSquatOrLunge) {
    const lowerTargets = byPattern(['hinge', 'squat', 'lunge', 'carry_swing']);
    candidates.push({
      id: 'wu-act-glute-bridge',
      phase: 'Activate',
      name: 'Single-Leg or Tempo Glute Bridge March',
      durationSeconds: 60,
      prescription: '10–12 reps · 2s squeeze',
      cue: 'Drive through heels with ribs tucked down so glutes—not lower back—own hip extension.',
      targetExercises: lowerTargets,
      exerciseId: 'ex-glute-bridge',
      pattern: 'hinge',
    });
  }

  if (hasUpperPush || hasUpperPull) {
    const pushPullTargets = byPattern([
      'push_horizontal',
      'push_vertical',
      'pull_horizontal',
      'pull_vertical',
      'curl_raise',
    ]);
    candidates.push({
      id: 'wu-act-scap',
      phase: 'Activate',
      name: 'Band Pull-Aparts or Scapular Push-Up Plus',
      durationSeconds: 60,
      prescription: '12–15 crisp reps',
      cue: 'Keep ribs down and glide shoulder blades smoothly back and around the ribcage without shrugging.',
      targetExercises: pushPullTargets,
      pattern: 'pull_horizontal',
    });
  }

  if (hasCore || hasHingeOrCarry || hasSquatOrLunge) {
    const braceTargets = uniqueNames(
      [...byPattern(['core_plank', 'core_hollow', 'hinge', 'squat']), ...allTargets],
      2
    );
    candidates.push({
      id: 'wu-act-deadbug',
      phase: 'Activate',
      name: 'Slow-Tempo Dead Bug Bracing',
      durationSeconds: 55,
      prescription: '6 / side · full exhale',
      cue: 'Press lower back gently into the floor as opposite limbs extend to lock in 360-degree trunk tension.',
      targetExercises: braceTargets,
      exerciseId: 'ex-dead-bug',
      pattern: 'core_hollow',
    });
  }

  if (hasConditioning) {
    const condTargets = byPattern(['cardio_jump', 'carry_swing']);
    candidates.push({
      id: 'wu-act-pogo',
      phase: 'Activate',
      name: 'Front/Lateral Leg Swings & Soft Pogo Hops',
      durationSeconds: 55,
      prescription: '10 swings / leg + 15s hops',
      cue: 'Stay tall on the balls of your feet to prime Achilles and calf tendon stiffness before shuttles or runs.',
      targetExercises: condTargets,
      pattern: 'cardio_jump',
    });
  }

  // 4. POTENTIATE PHASE (neural ramp-up matched to Exercise #1 & #2)
  const lead = analyzed[0];
  if (lead) {
    const leadPattern = lead.pattern;
    if (leadPattern === 'squat' || leadPattern === 'lunge') {
      candidates.push({
        id: 'wu-pot-squat',
        phase: 'Potentiate',
        name: 'Pause Bodyweight Squats → 50% Ramp Set',
        durationSeconds: 75,
        prescription:
          experienceLevel === 'Beginner'
            ? '2×5 tempo squats'
            : '5 bodyweight squats + 1×6 @ ~50%',
        cue: `Groove your exact stance and bottom depth for ${lead.name} before loading working weight.`,
        targetExercises: [lead.name],
        exerciseId: 'ex-bw-tempo-squat',
        pattern: 'squat',
      });
    } else if (leadPattern === 'hinge') {
      candidates.push({
        id: 'wu-pot-hinge',
        phase: 'Potentiate',
        name: 'Bodyweight Hinge Snap → Light Bar Primer',
        durationSeconds: 75,
        prescription:
          experienceLevel === 'Beginner'
            ? '2×6 hip hinge drills'
            : '6 fast hip hinges + 1×5 @ ~50%',
        cue: `Pull slack out and lock lats down symmetrically before attempting working sets on ${lead.name}.`,
        targetExercises: [lead.name],
        exerciseId: 'ex-rdl',
        pattern: 'hinge',
      });
    } else if (leadPattern === 'push_horizontal' || leadPattern === 'push_vertical') {
      candidates.push({
        id: 'wu-pot-push',
        phase: 'Potentiate',
        name: 'Explosive Incline/Tempo Push-Up → 50% Press',
        durationSeconds: 70,
        prescription:
          experienceLevel === 'Beginner'
            ? '2×5 slow push-ups'
            : '5 crisp push-ups + 1×6 @ ~50%',
        cue: `Set scapular retraction and drive bar speed smoothly on your opening set of ${lead.name}.`,
        targetExercises: [lead.name],
        exerciseId: 'ex-pushup',
        pattern: 'push_horizontal',
      });
    } else if (leadPattern === 'pull_horizontal' || leadPattern === 'pull_vertical') {
      candidates.push({
        id: 'wu-pot-pull',
        phase: 'Potentiate',
        name: 'Scapular Pulls → Light Primer Pull Set',
        durationSeconds: 65,
        prescription: '6 scapular pulls + 1×8 @ ~50%',
        cue: `Initiate every rep by pulling shoulders away from your ears to fire lats first on ${lead.name}.`,
        targetExercises: [lead.name],
        pattern: leadPattern,
      });
    } else {
      candidates.push({
        id: 'wu-pot-speed',
        phase: 'Potentiate',
        name: 'Fast High-Knee Bursts & Athletic Stance Drops',
        durationSeconds: 65,
        prescription: '2×15s crisp bursts · 20s rest',
        cue: `Wake up fast-twitch nervous system output cleanly for ${lead.name}.`,
        targetExercises: [lead.name],
        exerciseId: 'ex-shuttle-slams',
        pattern: 'carry_swing',
      });
    }
  }

  // Trim or scale drills so total duration hits targetMinutes (5, 8, or 10 min strictly within 300-600s)
  const targetSeconds = targetMinutes * 60;
  let selectedDrills: WarmupDrill[];

  if (targetMinutes === 5) {
    // Keep crisp 5-6 drill sequence covering Raise, top 2-3 Mobilize/Activate, and Potentiate
    const raise = candidates.find((d) => d.phase === 'Raise');
    const potentiate = candidates.find((d) => d.phase === 'Potentiate');
    const middle = candidates.filter((d) => d.phase === 'Mobilize' || d.phase === 'Activate').slice(0, 3);
    selectedDrills = [raise, ...middle, potentiate].filter((d): d is WarmupDrill => Boolean(d));
  } else if (targetMinutes === 8) {
    selectedDrills = candidates.slice(0, 7);
  } else {
    selectedDrills = [...candidates];
    // For 10-minute full ramp, include an extra CNS/ramp or aerobic primer if pool is small
    if (selectedDrills.length < 7) {
      selectedDrills.splice(1, 0, {
        id: 'wu-raise-build',
        phase: 'Raise',
        name: 'Progressive Pace Build + Inchworm Walkouts',
        durationSeconds: 75,
        prescription: '4–5 walkouts + 30s brisk feet',
        cue: 'Lengthen hamstrings dynamically while warming wrists, shoulders, and core.',
        targetExercises: allTargets.slice(0, 2),
        pattern: 'mobility_flow',
      });
    }
  }

  const rawTotal = selectedDrills.reduce((sum, d) => sum + d.durationSeconds, 0) || 300;
  const scale = targetSeconds / rawTotal;

  let scaledDrills = selectedDrills.map((d) => ({
    ...d,
    durationSeconds: scaleDurationSeconds(d.durationSeconds, scale, 35, 130),
  }));

  // Fine-tune first/last drill by 5s increments so total stays squarely within [300, 600]
  let totalSeconds = scaledDrills.reduce((sum, d) => sum + d.durationSeconds, 0);
  if (totalSeconds < 300 && scaledDrills.length > 0) {
    scaledDrills[0].durationSeconds += 300 - totalSeconds;
    totalSeconds = 300;
  } else if (totalSeconds > 600 && scaledDrills.length > 0) {
    let excess = totalSeconds - 600;
    scaledDrills = scaledDrills.map((d) => {
      if (excess <= 0) return d;
      const reducible = Math.max(0, d.durationSeconds - 30);
      const cut = Math.min(excess, reducible);
      excess -= cut;
      return { ...d, durationSeconds: d.durationSeconds - cut };
    });
    totalSeconds = scaledDrills.reduce((sum, d) => sum + d.durationSeconds, 0);
  }

  const patternLabels = patternsDetected
    .slice(0, 3)
    .map((p) => PATTERN_LABEL[p])
    .join(', ');

  const displayMinutes = Math.max(5, Math.min(10, Math.round(totalSeconds / 60)));

  return {
    targetMinutes,
    totalSeconds,
    displayMinutes,
    focusSummary: patternLabels
      ? `Built for ${activeDay.focus} (${patternLabels})`
      : `Built for ${activeDay.focus}`,
    patternsDetected,
    drills: scaledDrills,
  };
}
