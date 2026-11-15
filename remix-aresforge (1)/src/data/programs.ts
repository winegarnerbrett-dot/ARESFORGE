import strengthImg from '../assets/images/program_strength_barbell_1794709683990.jpg';
import hypertrophyImg from '../assets/images/program_hypertrophy_dumbbells_1794709684684.jpg';
import hiitImg from '../assets/images/program_hiit_conditioning_1794709683842.jpg';
import mobilityImg from '../assets/images/program_mobility_core_1794709684502.jpg';
import aftImg from '../assets/images/program_aft_tactical_1794710498508.jpg';
import hybridImg from '../assets/images/program_hybrid_athlete_1794714420413.jpg';
import leoImg from '../assets/images/program_leo_tactical_1794714420410.jpg';
import athenaStrengthImg from '../assets/images/program_athena_strength_1794759549459.jpg';
import athenaSculptImg from '../assets/images/program_athena_sculpt_1794759548800.jpg';
import type {
  ExerciseLibraryItem,
  ExperienceLevel,
  FoodCatalogProduct,
  MovementPattern,
  ProgramDay,
  ProgramExercise,
  RotationDays,
  WorkoutDurationOption,
  WorkoutProgram,
} from '../types/fitness';

export const ROTATION_DAY_OPTIONS: RotationDays[] = [3, 4, 5, 6, 7];

export const WORKOUT_DURATION_OPTIONS: Array<{
  minutes: WorkoutDurationOption;
  label: string;
}> = [
  { minutes: 30, label: '30 min' },
  { minutes: 45, label: '45 min' },
  { minutes: 60, label: '1 hr' },
];

export const EXPERIENCE_LEVEL_GUIDE: Record<ExperienceLevel, string> = {
  Beginner: '2–3 sets · Foundational movements · Technique & 72h recovery focus',
  Intermediate: '3–4 sets · Balanced compound & hypertrophy overload (RPE 8)',
  Advanced: '4–5 sets · Heavy compound progressions & peak AFT benchmarks (RPE 9)',
};

export const EXERCISE_LIBRARY: ExerciseLibraryItem[] = [
  {
    id: 'ex-back-squat',
    name: 'Barbell Back Squat',
    muscleGroup: 'Legs',
    equipment: 'Barbell & Rack',
    pattern: 'squat',
    defaultSets: 4,
    defaultReps: '6–8',
    defaultRestSeconds: 120,
    tempo: '3-1-1-0',
    cues: [
      'Brace your core 360 degrees before descending and keep your chest proud.',
      'Track knees directly over your middle toes while sitting hips back and down.',
      'Keep the barbell centered over mid-foot throughout the entire rep.',
      'Drive through your whole foot evenly to stand up without caving knees inward.',
    ],
    mistakes: [
      'Letting heels lift off the floor or knees collapse inward (valgus).',
      'Rounding the lower back at the bottom of the squat.',
    ],
  },
  {
    id: 'ex-goblet-squat',
    name: 'Dumbbell Goblet Squat',
    muscleGroup: 'Legs',
    equipment: 'Dumbbell / Kettlebell',
    pattern: 'squat',
    defaultSets: 3,
    defaultReps: '10–12',
    defaultRestSeconds: 75,
    tempo: '2-1-1-0',
    cues: [
      'Hold the weight tight against your upper chest with elbows tucked down.',
      'Drop hips between your knees until thighs are at least parallel to the floor.',
      'Pause briefly at the bottom while maintaining an upright torso.',
    ],
    mistakes: [
      'Allowing the dumbbell to drift away from your chest.',
      'Bouncing rapidly out of the bottom without control.',
    ],
  },
  {
    id: 'ex-rdl',
    name: 'Romanian Deadlift',
    muscleGroup: 'Legs',
    equipment: 'Barbell or Dumbbells',
    pattern: 'hinge',
    defaultSets: 3,
    defaultReps: '8–10',
    defaultRestSeconds: 90,
    tempo: '3-1-1-0',
    cues: [
      'Unlock knees slightly and keep that exact knee angle locked throughout.',
      'Push your hips straight back as if closing a car door behind you.',
      'Slide the bar or dumbbells close along your thighs until you feel a deep hamstring stretch.',
      'Squeeze glutes to drive hips forward and stand tall without hyperextending.',
    ],
    mistakes: [
      'Rounding the upper or lower back to reach lower toward the floor.',
      'Turning the hinge into a squat by bending knees too much.',
    ],
  },
  {
    id: 'ex-deadlift',
    name: 'Conventional Barbell Deadlift',
    muscleGroup: 'Back',
    equipment: 'Barbell',
    pattern: 'hinge',
    defaultSets: 3,
    defaultReps: '5',
    defaultRestSeconds: 150,
    tempo: '2-0-1-1',
    cues: [
      'Position the bar over mid-foot with shins lightly touching the bar.',
      'Pull slack out of the bar by engaging lats before lifting off the floor.',
      'Push the floor away with your legs first, then drive hips through at knee height.',
    ],
    mistakes: [
      'Jerking the bar off the floor with bent arms or a rounded lumbar spine.',
      'Leaning excessively backward at lockout.',
    ],
  },
  {
    id: 'ex-bulgarian-split',
    name: 'Bulgarian Split Squat',
    muscleGroup: 'Legs',
    equipment: 'Dumbbells & Bench',
    pattern: 'lunge',
    defaultSets: 3,
    defaultReps: '10 / leg',
    defaultRestSeconds: 75,
    tempo: '2-1-1-0',
    cues: [
      'Rest your rear laces lightly on the bench; most weight stays on the front foot.',
      'Lower straight down with a slight forward torso lean for glute engagement.',
      'Drive through your front heel and mid-foot to return to standing.',
    ],
    mistakes: [
      'Standing too close to the bench so the front heel lifts.',
      'Pushing excessively off the back foot.',
    ],
  },
  {
    id: 'ex-walking-lunge',
    name: 'Dumbbell Reverse Lunge',
    muscleGroup: 'Legs',
    equipment: 'Dumbbells',
    pattern: 'lunge',
    defaultSets: 3,
    defaultReps: '10 / leg',
    defaultRestSeconds: 60,
    tempo: '2-0-1-0',
    cues: [
      'Step backward softly onto the ball of your rear foot while keeping torso tall.',
      'Lower until both knees form roughly 90-degree angles.',
      'Press firmly through your front foot to return cleanly to start.',
    ],
    mistakes: [
      'Walking on a tightrope (feet too narrow side-to-side).',
      'Slamming the back knee onto the floor.',
    ],
  },
  {
    id: 'ex-bench-press',
    name: 'Barbell Bench Press',
    muscleGroup: 'Chest',
    equipment: 'Barbell & Flat Bench',
    pattern: 'push_horizontal',
    defaultSets: 4,
    defaultReps: '6–8',
    defaultRestSeconds: 120,
    tempo: '2-1-1-0',
    cues: [
      'Retract and depress shoulder blades into the bench before unracking.',
      'Lower the bar under control to your lower sternum with elbows at ~45 degrees.',
      'Keep feet planted firmly on the floor and press smoothly up and slightly back.',
    ],
    mistakes: [
      'Flaring elbows 90 degrees straight out from the shoulders.',
      'Bouncing the bar off the chest or lifting hips off the bench.',
    ],
  },
  {
    id: 'ex-incline-db-press',
    name: 'Incline Dumbbell Press',
    muscleGroup: 'Chest',
    equipment: 'Dumbbells & Incline Bench',
    pattern: 'push_horizontal',
    defaultSets: 4,
    defaultReps: '8–10',
    defaultRestSeconds: 90,
    tempo: '2-1-1-0',
    cues: [
      'Set the bench to 30 degrees to target upper chest without overloading front delts.',
      'Tuck elbows slightly inside shoulder line as you lower dumbbells near upper chest.',
      'Press up along a smooth arc without clanking dumbbells together at the top.',
    ],
    mistakes: [
      'Setting the incline too steep (45–60 degrees) turning it into a shoulder press.',
      'Letting wrists bend backward under heavy load.',
    ],
  },
  {
    id: 'ex-pushup',
    name: 'Tempo Push-Up',
    muscleGroup: 'Chest',
    equipment: 'Bodyweight',
    pattern: 'push_horizontal',
    defaultSets: 3,
    defaultReps: '12–15',
    defaultRestSeconds: 60,
    tempo: '3-1-1-0',
    cues: [
      'Form a straight rigid line from head to heels by squeezing glutes and abs.',
      'Angle elbows back ~45 degrees like an arrow, not a wide T.',
      'Lower chest until just above the floor, pause, then push the floor away.',
    ],
    mistakes: [
      'Sagging hips toward the ground or flaring elbows out wide.',
      'Cutting range of motion short at the bottom.',
    ],
  },
  {
    id: 'ex-ohp',
    name: 'Standing Overhead Press',
    muscleGroup: 'Shoulders',
    equipment: 'Barbell or Dumbbells',
    pattern: 'push_vertical',
    defaultSets: 3,
    defaultReps: '6–8',
    defaultRestSeconds: 90,
    tempo: '2-0-1-0',
    cues: [
      'Squeeze glutes and brace ribs down so your lower back stays neutral.',
      'Tuck your chin slightly back as the bar clears your face, then push head through at top.',
      'Finish with biceps aligned near your ears and wrists stacked directly over elbows.',
    ],
    mistakes: [
      'Over-arching the lumbar spine to compensate for tight shoulders.',
      'Pressing the weight forward instead of straight overhead.',
    ],
  },
  {
    id: 'ex-db-shoulder-press',
    name: 'Seated Dumbbell Shoulder Press',
    muscleGroup: 'Shoulders',
    equipment: 'Dumbbells & Bench',
    pattern: 'push_vertical',
    defaultSets: 3,
    defaultReps: '10–12',
    defaultRestSeconds: 75,
    tempo: '2-1-1-0',
    cues: [
      'Position elbows slightly forward (scapular plane) rather than pinned straight out.',
      'Lower dumbbells until handles reach ear height with forearms vertical.',
      'Press smoothly overhead without shrugging traps into your neck.',
    ],
    mistakes: [
      'Flaring ribs forward off the backrest during heavy reps.',
      'Stopping halfway down instead of full shoulder range.',
    ],
  },
  {
    id: 'ex-barbell-row',
    name: 'Bent-Over Barbell Row',
    muscleGroup: 'Back',
    equipment: 'Barbell',
    pattern: 'pull_horizontal',
    defaultSets: 4,
    defaultReps: '8–10',
    defaultRestSeconds: 90,
    tempo: '1-1-2-0',
    cues: [
      'Hinge torso to roughly 30–45 degrees with a flat, braced spine.',
      'Pull elbows back toward your hips rather than straight up to your chest.',
      'Pause briefly with shoulder blades squeezed together before lowering under control.',
    ],
    mistakes: [
      'Standing upright and using momentum/body English to heave the bar.',
      'Rounding the upper back between reps.',
    ],
  },
  {
    id: 'ex-db-row',
    name: 'Single-Arm Dumbbell Row',
    muscleGroup: 'Back',
    equipment: 'Dumbbell & Bench',
    pattern: 'pull_horizontal',
    defaultSets: 3,
    defaultReps: '10 / side',
    defaultRestSeconds: 60,
    tempo: '1-1-2-0',
    cues: [
      'Keep your supporting shoulder active and spine level like a tabletop.',
      'Sweep the dumbbell in an arc toward your hip pocket to engage the lats.',
      'Control the descent fully to feel a stretch at the bottom without twisting.',
    ],
    mistakes: [
      'Rotating the torso excessively at the top of each pull.',
      'Shrugging the shoulder up toward the ear.',
    ],
  },
  {
    id: 'ex-lat-pulldown',
    name: 'Wide-Grip Lat Pulldown',
    muscleGroup: 'Back',
    equipment: 'Cable Machine',
    pattern: 'pull_vertical',
    defaultSets: 3,
    defaultReps: '10–12',
    defaultRestSeconds: 75,
    tempo: '1-1-2-0',
    cues: [
      'Sit tall with a slight 10-degree lean back and chest lifted toward the ceiling.',
      'Initiate by pulling shoulder blades down, then drive elbows toward your ribs.',
      'Let the bar rise all the way up for a full lat stretch between reps.',
    ],
    mistakes: [
      'Leaning back 45 degrees and turning it into a horizontal row.',
      'Pulling the bar behind the neck.',
    ],
  },
  {
    id: 'ex-pullup',
    name: 'Assisted or Bodyweight Pull-Up',
    muscleGroup: 'Back',
    equipment: 'Pull-Up Bar',
    pattern: 'pull_vertical',
    defaultSets: 3,
    defaultReps: '6–10',
    defaultRestSeconds: 90,
    tempo: '1-1-2-0',
    cues: [
      'Start from an active hang by pulling shoulders away from your ears.',
      'Drive elbows down toward your sides until chin clears the bar cleanly.',
      'Lower with full control over 2 seconds without swinging your legs.',
    ],
    mistakes: [
      'Kipping or swinging knees up to generate momentum.',
      'Stopping before arms fully extend at the bottom.',
    ],
  },
  {
    id: 'ex-lateral-raise',
    name: 'Dumbbell Lateral Raise',
    muscleGroup: 'Shoulders',
    equipment: 'Dumbbells',
    pattern: 'curl_raise',
    defaultSets: 3,
    defaultReps: '12–15',
    defaultRestSeconds: 60,
    tempo: '1-1-2-0',
    cues: [
      'Keep a soft micro-bend in elbows and raise arms slightly forward of your torso.',
      'Lead with the side of your elbows up to shoulder height, not higher.',
      'Lower slowly over 2 seconds so tension stays on the medial deltoid.',
    ],
    mistakes: [
      'Swinging the torso or shrugging upper traps above ear level.',
      'Using momentum with weights that are too heavy.',
    ],
  },
  {
    id: 'ex-bicep-curl',
    name: 'Dumbbell Hammer / Supinated Curl',
    muscleGroup: 'Arms',
    equipment: 'Dumbbells',
    pattern: 'curl_raise',
    defaultSets: 3,
    defaultReps: '10–12',
    defaultRestSeconds: 60,
    tempo: '1-1-2-0',
    cues: [
      'Pin upper arms comfortably along your sides without swinging elbows forward.',
      'Curl smoothly with wrists neutral and squeeze biceps at the top.',
      'Lower all the way to full elbow extension under control.',
    ],
    mistakes: [
      'Leaning back and swinging hips to start the curl.',
      'Cutting off the bottom third of the range of motion.',
    ],
  },
  {
    id: 'ex-kb-swing',
    name: 'Russian Kettlebell Swing',
    muscleGroup: 'Conditioning',
    equipment: 'Kettlebell',
    pattern: 'carry_swing',
    defaultSets: 4,
    defaultReps: '15–20',
    defaultRestSeconds: 60,
    tempo: 'Explosive',
    cues: [
      'Hinge at the hips (not a squat) and hike the kettlebell high between upper thighs.',
      'Snap hips forward powerfully by squeezing glutes and bracing abs at chest height.',
      'Arms act like ropes—never lift the kettlebell with your shoulders.',
    ],
    mistakes: [
      'Squatting down instead of hinging hips backward.',
      'Letting the kettlebell drop below knee level and rounding the lower back.',
    ],
  },
  {
    id: 'ex-battle-ropes',
    name: 'Alternating Battle Rope Waves',
    muscleGroup: 'Conditioning',
    equipment: 'Battle Ropes',
    pattern: 'carry_swing',
    defaultSets: 4,
    defaultReps: '30s',
    defaultRestSeconds: 45,
    tempo: 'Continuous',
    cues: [
      'Drop into an athletic quarter-squat stance with spine flat and core braced.',
      'Whip arms rhythmically from the shoulders to send continuous waves to the anchor.',
      'Maintain steady nasal-to-mouth breathing throughout the 30-second interval.',
    ],
    mistakes: [
      'Standing upright with locked knees or rounding forward as fatigue sets in.',
      'Holding your breath during intense bursts.',
    ],
  },
  {
    id: 'ex-burpee',
    name: 'Controlled Step-Back / Jump Burpee',
    muscleGroup: 'Conditioning',
    equipment: 'Bodyweight',
    pattern: 'cardio_jump',
    defaultSets: 4,
    defaultReps: '10–12',
    defaultRestSeconds: 45,
    tempo: 'Steady',
    cues: [
      'Place hands shoulder-width on the floor and step or hop into a crisp high plank.',
      'Keep your core tight so hips do not sag toward the ground in the plank.',
      'Land softly with bent knees if jumping at the top.',
    ],
    mistakes: [
      'Dropping hips into a banana-back shape during the plank transition.',
      'Landing stiff-legged on the vertical hop.',
    ],
  },
  {
    id: 'ex-box-jump',
    name: 'Plyometric Box Jump / Step-Up',
    muscleGroup: 'Conditioning',
    equipment: 'Plyo Box',
    pattern: 'cardio_jump',
    defaultSets: 3,
    defaultReps: '8–10',
    defaultRestSeconds: 60,
    tempo: 'Explosive',
    cues: [
      'Load hips back, swing arms dynamically, and explode onto the center of the box.',
      'Land softly in an athletic quarter-squat with knees tracking toes.',
      'Stand fully upright on top, then step down one foot at a time safely.',
    ],
    mistakes: [
      'Jumping backward off the box (always step down to protect Achilles tendons).',
      'Landing with stiff knees or noisy heavy feet.',
    ],
  },
  {
    id: 'ex-plank',
    name: 'Forearm RKC Plank',
    muscleGroup: 'Core',
    equipment: 'Mat',
    pattern: 'core_plank',
    defaultSets: 3,
    defaultReps: '45s',
    defaultRestSeconds: 45,
    tempo: 'Isometric',
    cues: [
      'Stack elbows directly beneath shoulders and press forearms firmly into the mat.',
      'Tuck tailbone slightly under, squeeze glutes, and pull ribs down toward hips.',
      'Keep gaze neutral toward the floor between your thumbs.',
    ],
    mistakes: [
      'Allowing hips to sag toward the floor or piking hips too high.',
      'Holding tension in the neck by looking straight ahead.',
    ],
  },
  {
    id: 'ex-dead-bug',
    name: 'Slow-Tempo Dead Bug',
    muscleGroup: 'Core',
    equipment: 'Mat',
    pattern: 'core_hollow',
    defaultSets: 3,
    defaultReps: '10 / side',
    defaultRestSeconds: 45,
    tempo: '3-1-1-0',
    cues: [
      'Press your lower back gently into the floor before moving any limbs.',
      'Exhale slowly as you extend opposite arm and leg just above the floor.',
      'Only lower your leg as far as you can without your lower back arching.',
    ],
    mistakes: [
      'Letting a gap form under your lower back when the leg extends.',
      'Rushing through reps without coordinating breath.',
    ],
  },
  {
    id: 'ex-thoracic-flow',
    name: 'Open-Book Thoracic Rotation',
    muscleGroup: 'Mobility',
    equipment: 'Mat & Foam Roller',
    pattern: 'mobility_flow',
    defaultSets: 2,
    defaultReps: '8 / side',
    defaultRestSeconds: 30,
    tempo: 'Slow & Smooth',
    cues: [
      'Lie on your side with top knee pinned firmly onto a foam roller or yoga block.',
      'Sweep your top arm smoothly across your chest to open toward the opposite floor.',
      'Exhale deeply at end range for 2 seconds to encourage mid-back mobility.',
    ],
    mistakes: [
      'Letting the top knee lift off the floor/roller (which shifts twist to lower back).',
      'Forcing the shoulder down painfully instead of breathing into the stretch.',
    ],
  },
  {
    id: 'ex-90-90-hip',
    name: '90/90 Hip Switch Flow',
    muscleGroup: 'Mobility',
    equipment: 'Mat',
    pattern: 'mobility_flow',
    defaultSets: 2,
    defaultReps: '10 switches',
    defaultRestSeconds: 30,
    tempo: 'Controlled',
    cues: [
      'Sit tall with both knees bent at 90-degree angles, feet flexed.',
      'Pivot both knees smoothly to the opposite side while keeping heels planted.',
      'Use light fingertips behind you if needed to keep your spine upright.',
    ],
    mistakes: [
      'Slouching the spine backward to force hip rotation.',
      'Moving too fast without pausing in each end range.',
    ],
  },
  {
    id: 'ex-aft-mdl',
    name: 'Hex / Trap Bar 3RM Deadlift (MDL)',
    muscleGroup: 'Legs',
    equipment: '60 lb Hex Trap Bar',
    pattern: 'hinge',
    defaultSets: 4,
    defaultReps: '3',
    defaultRestSeconds: 150,
    tempo: '2-0-1-1',
    cues: [
      'Step inside the hex bar with feet hip-width apart and grip the center of the handles.',
      'Drop hips, flatten your spine, pull slack out of the bar, and lock lats down.',
      'Drive feet evenly through the floor to stand tall with hips and knees locked; lower under control without dropping the bar.',
    ],
    mistakes: [
      'Rounding the lower back during the initial pull or bouncing plates off the ground between the 3 continuous reps.',
      'Hitching or hyperextending backward at the top.',
    ],
  },
  {
    id: 'ex-aft-hrp',
    name: 'Hand-Release Push-Up (HRP)',
    muscleGroup: 'Chest',
    equipment: 'Bodyweight',
    pattern: 'push_horizontal',
    defaultSets: 4,
    defaultReps: '25–35',
    defaultRestSeconds: 60,
    tempo: 'Steady 2-Min Pace',
    cues: [
      'Maintain a rigid straight line from head to heels with feet together or up to 12 inches apart.',
      'Lower chest and thighs to the ground together as one unit, then extend arms out laterally into a full T-position.',
      'Pull hands briskly back under your shoulders and press up together without sagging hips.',
    ],
    mistakes: [
      'Snaking or peeling the chest up before the hips leave the floor (causes a no-rep).',
      'Failing to fully extend arms out into the T-position before pressing.',
    ],
  },
  {
    id: 'ex-aft-sdc',
    name: 'Sprint-Drag-Carry Shuttle (SDC)',
    muscleGroup: 'Conditioning',
    equipment: '90 lb Sled & 2×40 lb Kettlebells',
    pattern: 'carry_swing',
    defaultSets: 3,
    defaultReps: '250m Shuttle',
    defaultRestSeconds: 120,
    tempo: 'Max Effort',
    cues: [
      'Stay low with short, rapid steps on the 50m backward sled drag while leaning away from the strap.',
      'Keep hips square and knees bent during the 50m lateral shuffle—never cross your feet.',
      'Pack shoulders down and brace your core during the 2×40 lb kettlebell carry before finishing with an all-out 50m sprint.',
    ],
    mistakes: [
      'Standing upright during the sled drag (kills leg drive and slows transition).',
      'Crossing feet on the lateral shuffle or dropping kettlebells before crossing the 25m line.',
    ],
  },
  {
    id: 'ex-aft-plank',
    name: 'AFT Forearm Plank (PLK)',
    muscleGroup: 'Core',
    equipment: 'Mat',
    pattern: 'core_plank',
    defaultSets: 3,
    defaultReps: '90–150s',
    defaultRestSeconds: 60,
    tempo: 'Isometric Hold',
    cues: [
      'Place elbows directly beneath shoulders with forearms flat and hands either clasped or flat.',
      'Keep head, shoulders, hips, knees, and ankles aligned in a straight line throughout.',
      'Breathe rhythmically through steady bracing rather than holding your breath.',
    ],
    mistakes: [
      'Pike hips above shoulder line or letting the lower back sag (triggers termination warning).',
      'Lifting a forearm or foot off the ground during the hold.',
    ],
  },
  {
    id: 'ex-aft-2mr',
    name: 'Two-Mile Run Pace Intervals (2MR)',
    muscleGroup: 'Conditioning',
    equipment: 'Track or Road',
    pattern: 'cardio_jump',
    defaultSets: 4,
    defaultReps: '800m @ Goal Pace',
    defaultRestSeconds: 90,
    tempo: 'Negative Split',
    cues: [
      'Run tall with a slight forward lean from the ankles and relaxed shoulders.',
      'Aim for an efficient 170–180 spm cadence to minimize braking impact over 2 miles.',
      'Lock onto your target 800m split time on rep 1 so you finish the final half-mile strong.',
    ],
    mistakes: [
      'Going out too fast in the first 400m after the Plank and fading in mile two.',
      'Overstriding with heavy heel strikes when fatigued.',
    ],
  },
  // Equipment-diverse "like exercise" alternatives across all movement patterns
  {
    id: 'ex-db-front-squat',
    name: 'Dumbbell Front Squat',
    muscleGroup: 'Legs',
    equipment: 'Dumbbells',
    pattern: 'squat',
    defaultSets: 4,
    defaultReps: '8–10',
    defaultRestSeconds: 90,
    tempo: '3-1-1-0',
    cues: [
      'Rest dumbbells securely on the front of your shoulders with elbows pointed forward.',
      'Keep your torso upright as you sit hips back and down between your knees.',
      'Drive evenly through mid-foot and heel to stand tall without leaning forward.',
    ],
    mistakes: [
      'Letting elbows drop so dumbbells pull your chest forward.',
      'Lifting heels off the floor at bottom depth.',
    ],
  },
  {
    id: 'ex-bw-tempo-squat',
    name: 'Tempo Bodyweight Squat',
    muscleGroup: 'Legs',
    equipment: 'No Equipment (Bodyweight)',
    pattern: 'squat',
    defaultSets: 3,
    defaultReps: '15–20',
    defaultRestSeconds: 60,
    tempo: '3-2-1-0',
    cues: [
      'Lower slowly for a full 3 seconds, keeping chest proud and knees tracking toes.',
      'Pause cleanly for 2 seconds at parallel without relaxing tension.',
      'Drive smoothly back up and squeeze glutes at lockout.',
    ],
    mistakes: [
      'Rushing the lowering phase or bouncing at the bottom.',
      'Letting knees cave inward as fatigue builds.',
    ],
  },
  {
    id: 'ex-leg-press',
    name: 'Machine Leg Press',
    muscleGroup: 'Legs',
    equipment: 'Leg Press Machine',
    pattern: 'squat',
    defaultSets: 4,
    defaultReps: '10–12',
    defaultRestSeconds: 90,
    tempo: '3-1-1-0',
    cues: [
      'Place feet shoulder-width in the middle of the sled with entire foot planted.',
      'Lower until knees reach at least 90 degrees without peeling hips off the pad.',
      'Press through mid-foot and heels stopping just short of knee hyperextension.',
    ],
    mistakes: [
      'Rolling the lower back/pelvis off the seat pad at bottom depth.',
      'Locking knees forcefully between reps.',
    ],
  },
  {
    id: 'ex-db-suitcase-dl',
    name: 'Dumbbell Trap-Style Deadlift',
    muscleGroup: 'Legs',
    equipment: 'Dumbbells',
    pattern: 'hinge',
    defaultSets: 4,
    defaultReps: '8–10',
    defaultRestSeconds: 90,
    tempo: '2-1-1-0',
    cues: [
      'Hold dumbbells cleanly at your sides like hex-bar handles with shoulders packed down.',
      'Hinge hips back while keeping shins near vertical and spine flat.',
      'Push the floor away with your legs and lock hips through powerfully at the top.',
    ],
    mistakes: [
      'Rounding the upper or lower back to tap weights to the floor.',
      'Shrugging traps upward instead of locking lats down.',
    ],
  },
  {
    id: 'ex-single-leg-rdl',
    name: 'Single-Leg Romanian Deadlift',
    muscleGroup: 'Legs',
    equipment: 'Dumbbell or Bodyweight',
    pattern: 'hinge',
    defaultSets: 3,
    defaultReps: '10 / leg',
    defaultRestSeconds: 60,
    tempo: '3-1-1-0',
    cues: [
      'Keep your standing knee softly unlocked and hips square to the floor.',
      'Reach the free leg straight back like a seesaw as your torso hinges forward.',
      'Pull through the standing hamstring and glute to return upright.',
    ],
    mistakes: [
      'Opening the rear hip outward toward the wall.',
      'Rounding the back instead of keeping a rigid plank from head to heel.',
    ],
  },
  {
    id: 'ex-glute-bridge',
    name: 'Weighted or Single-Leg Glute Bridge',
    muscleGroup: 'Legs',
    equipment: 'No Equipment / Dumbbell',
    pattern: 'hinge',
    defaultSets: 3,
    defaultReps: '12–15',
    defaultRestSeconds: 60,
    tempo: '2-1-1-1',
    cues: [
      'Set heels a few inches from glutes and tuck ribs gently down toward pelvis.',
      'Drive through heels to extend hips until thighs and torso form a straight line.',
      'Hold a 1-second peak glute squeeze at the top without arching lower back.',
    ],
    mistakes: [
      'Over-arching the lumbar spine instead of locking hips with glutes.',
      'Pushing through toes rather than heels.',
    ],
  },
  {
    id: 'ex-bw-split-squat',
    name: 'Bodyweight Split Squat',
    muscleGroup: 'Legs',
    equipment: 'No Equipment (Bodyweight)',
    pattern: 'lunge',
    defaultSets: 3,
    defaultReps: '12 / leg',
    defaultRestSeconds: 60,
    tempo: '3-1-1-0',
    cues: [
      'Take a shoulder-width staggered stance and keep front foot flat throughout.',
      'Lower the rear knee smoothly toward the floor under a 3-second count.',
      'Drive through your front mid-foot and heel to stand tall.',
    ],
    mistakes: [
      'Lining feet up on a narrow tightrope instead of hip-width.',
      'Letting the front heel peel off the floor.',
    ],
  },
  {
    id: 'ex-step-up',
    name: 'Alternating Step-Up',
    muscleGroup: 'Legs',
    equipment: 'Bench / Sturdy Step',
    pattern: 'lunge',
    defaultSets: 3,
    defaultReps: '10 / leg',
    defaultRestSeconds: 60,
    tempo: '2-1-2-0',
    cues: [
      'Plant your entire lead foot firmly on top of the bench or step.',
      'Pull up strictly through the top leg without pushing off the trailing toe.',
      'Control the step-down slowly over 2 seconds on every rep.',
    ],
    mistakes: [
      'Bouncing off the back ankle to initiate the rep.',
      'Dropping down rapidly onto the floor.',
    ],
  },
  {
    id: 'ex-db-floor-press',
    name: 'Dumbbell Floor Press',
    muscleGroup: 'Chest',
    equipment: 'Dumbbells (No Bench)',
    pattern: 'push_horizontal',
    defaultSets: 4,
    defaultReps: '8–10',
    defaultRestSeconds: 90,
    tempo: '2-1-1-0',
    cues: [
      'Lie flat on the floor with knees bent, feet planted, and upper back pinned down.',
      'Lower elbows at ~45 degrees until triceps touch the floor softly, pause cleanly.',
      'Press dumbbells smoothly up over mid-chest without losing shoulder blade position.',
    ],
    mistakes: [
      'Bouncing elbows hard off the floor between reps.',
      'Flaring elbows wide to 90 degrees.',
    ],
  },
  {
    id: 'ex-band-chest-press',
    name: 'Resistance Band Chest Press',
    muscleGroup: 'Chest',
    equipment: 'Resistance Band',
    pattern: 'push_horizontal',
    defaultSets: 3,
    defaultReps: '12–15',
    defaultRestSeconds: 60,
    tempo: '2-1-2-0',
    cues: [
      'Loop band cleanly across mid-upper back or anchor behind you at chest height.',
      'Step into a staggered athletic stance with ribs braced down.',
      'Press forward until arms extend straight ahead, squeeze chest, and return slowly.',
    ],
    mistakes: [
      'Letting shoulders roll forward past your chest at lockout.',
      'Allowing the band to snap arms backward.',
    ],
  },
  {
    id: 'ex-pike-pushup',
    name: 'Pike Shoulder Push-Up',
    muscleGroup: 'Shoulders',
    equipment: 'No Equipment (Bodyweight)',
    pattern: 'push_vertical',
    defaultSets: 3,
    defaultReps: '8–12',
    defaultRestSeconds: 75,
    tempo: '2-1-1-0',
    cues: [
      'Form an inverted-V pike with hips high and hands shoulder-width apart.',
      'Lower the crown of your head forward ahead of your hands forming a tripod.',
      'Press powerfully through the palms back into the pike position.',
    ],
    mistakes: [
      'Dropping head straight between hands instead of slightly forward.',
      'Flaring elbows outward instead of keeping forearms vertical.',
    ],
  },
  {
    id: 'ex-band-overhead-press',
    name: 'Resistance Band Overhead Press',
    muscleGroup: 'Shoulders',
    equipment: 'Resistance Band',
    pattern: 'push_vertical',
    defaultSets: 3,
    defaultReps: '10–14',
    defaultRestSeconds: 60,
    tempo: '2-1-1-0',
    cues: [
      'Stand securely on the center of the band with feet hip-width apart.',
      'Start handles at shoulder height with forearms vertical and glutes squeezed.',
      'Press straight overhead until biceps frame ears without arching your lower back.',
    ],
    mistakes: [
      'Leaning lower back into extension at full lockout.',
      'Letting wrists bend backward under band tension.',
    ],
  },
  {
    id: 'ex-chest-supported-db-row',
    name: 'Two-Arm Bent-Over Dumbbell Row',
    muscleGroup: 'Back',
    equipment: 'Dumbbells',
    pattern: 'pull_horizontal',
    defaultSets: 4,
    defaultReps: '10–12',
    defaultRestSeconds: 75,
    tempo: '1-1-2-0',
    cues: [
      'Hinge hips back ~45 degrees with flat spine and soft knee bend.',
      'Row both dumbbells smoothly toward your hip pockets while squeezing lats.',
      'Lower under a controlled 2-second count without rounding shoulders.',
    ],
    mistakes: [
      'Standing upright and jerking weights up with momentum.',
      'Pulling toward the neck instead of hips.',
    ],
  },
  {
    id: 'ex-band-seated-row',
    name: 'Resistance Band Seated Row',
    muscleGroup: 'Back',
    equipment: 'Resistance Band',
    pattern: 'pull_horizontal',
    defaultSets: 4,
    defaultReps: '12–15',
    defaultRestSeconds: 60,
    tempo: '1-1-2-0',
    cues: [
      'Sit tall with legs extended and loop the band securely around your arches.',
      'Pull shoulder blades back and down as you row handles toward lower ribs.',
      'Pause 1 second at peak contraction, then control the return.',
    ],
    mistakes: [
      'Hunching shoulders upward toward ears.',
      'Swinging torso backward to yank the band.',
    ],
  },
  {
    id: 'ex-inverted-row',
    name: 'Inverted Bodyweight Row',
    muscleGroup: 'Back',
    equipment: 'Bodyweight (Low Bar / Sturdy Table)',
    pattern: 'pull_horizontal',
    defaultSets: 3,
    defaultReps: '10–14',
    defaultRestSeconds: 75,
    tempo: '1-1-2-0',
    cues: [
      'Keep your body rigid in a straight line from ankles to shoulders.',
      'Pull chest cleanly to the bar/edge while driving elbows back past ribs.',
      'Lower with full control until arms extend completely.',
    ],
    mistakes: [
      'Dropping hips or craning neck forward to shorten range of motion.',
      'Flaring elbows straight out at 90 degrees.',
    ],
  },
  {
    id: 'ex-band-lat-pulldown',
    name: 'Kneeling Resistance Band Pulldown',
    muscleGroup: 'Back',
    equipment: 'Resistance Band',
    pattern: 'pull_vertical',
    defaultSets: 3,
    defaultReps: '12–15',
    defaultRestSeconds: 60,
    tempo: '1-1-2-0',
    cues: [
      'Anchor band high overhead and kneel tall with ribs braced down.',
      'Pull elbows down toward your sides while keeping chest proud.',
      'Control the arms smoothly overhead to feel a full lat stretch.',
    ],
    mistakes: [
      'Leaning excessively forward or rounding the upper back.',
      'Pulling with forearms instead of driving elbows down.',
    ],
  },
  {
    id: 'ex-db-pullover',
    name: 'Dumbbell Lat Pullover',
    muscleGroup: 'Back',
    equipment: 'Single Dumbbell (Floor or Bench)',
    pattern: 'pull_vertical',
    defaultSets: 3,
    defaultReps: '10–12',
    defaultRestSeconds: 75,
    tempo: '3-1-1-0',
    cues: [
      'Hold one dumbbell with both palms flat underneath the top plate.',
      'Keep a soft elbow bend and brace abs down so lower back stays neutral.',
      'Arc the dumbbell overhead for a deep lat stretch, then pull cleanly back over chest.',
    ],
    mistakes: [
      'Flaring ribcage up to fake extra overhead range.',
      'Turning the movement into a tricep extension by bending elbows deeply.',
    ],
  },
  {
    id: 'ex-band-lateral-raise',
    name: 'Resistance Band Lateral Raise',
    muscleGroup: 'Shoulders',
    equipment: 'Resistance Band',
    pattern: 'curl_raise',
    defaultSets: 3,
    defaultReps: '12–15',
    defaultRestSeconds: 45,
    tempo: '1-1-2-0',
    cues: [
      'Stand evenly on the band and raise arms smoothly just forward of your torso.',
      'Stop right at shoulder height with soft elbows and relaxed traps.',
      'Resist the band tension slowly on the way back down.',
    ],
    mistakes: [
      'Shrugging shoulders up toward ears.',
      'Swinging hips to initiate the lift.',
    ],
  },
  {
    id: 'ex-band-bicep-curl',
    name: 'Resistance Band Bicep Curl',
    muscleGroup: 'Arms',
    equipment: 'Resistance Band',
    pattern: 'curl_raise',
    defaultSets: 3,
    defaultReps: '12–15',
    defaultRestSeconds: 45,
    tempo: '1-1-2-0',
    cues: [
      'Stand tall on the band with elbows pinned comfortably alongside your ribs.',
      'Curl handles smoothly toward shoulders and squeeze biceps for 1 second.',
      'Lower all the way down under tension without letting elbows drift back.',
    ],
    mistakes: [
      'Letting elbows swing forward to finish the rep.',
      'Dropping arms rapidly with gravity.',
    ],
  },
  {
    id: 'ex-tricep-dip',
    name: 'Bench / Chair Tricep Dip',
    muscleGroup: 'Arms',
    equipment: 'No Equipment (Chair / Bench)',
    pattern: 'curl_raise',
    defaultSets: 3,
    defaultReps: '10–15',
    defaultRestSeconds: 60,
    tempo: '2-1-1-0',
    cues: [
      'Grip the edge of a sturdy chair or bench with shoulders rolled back and down.',
      'Lower hips straight down along the bench edge until elbows hit ~90 degrees.',
      'Press through palms to lock elbows out smoothly.',
    ],
    mistakes: [
      'Letting shoulders roll forward toward ears at the bottom.',
      'Hips drifting too far away from the bench.',
    ],
  },
  {
    id: 'ex-db-farmer-carry',
    name: 'Heavy Dumbbell Farmer Carry Shuttle',
    muscleGroup: 'Conditioning',
    equipment: 'Dumbbells',
    pattern: 'carry_swing',
    defaultSets: 3,
    defaultReps: '4×25m Shuttle',
    defaultRestSeconds: 90,
    tempo: 'Brisk Stride',
    cues: [
      'Pick up heavy dumbbells with a flat deadlift hinge and stand tall with shoulders packed.',
      'Walk briskly with short, controlled strides without letting weights swing into thighs.',
      'Maintain braced abs and steady breathing throughout every 25m turn.',
    ],
    mistakes: [
      'Tilting sideways or letting shoulders slump forward.',
      'Holding your breath while carrying.',
    ],
  },
  {
    id: 'ex-db-power-swing',
    name: 'Single-Dumbbell Hip Swing',
    muscleGroup: 'Conditioning',
    equipment: 'Single Dumbbell',
    pattern: 'carry_swing',
    defaultSets: 4,
    defaultReps: '15–20',
    defaultRestSeconds: 60,
    tempo: 'Explosive',
    cues: [
      'Interlock fingers securely around the top head of one dumbbell or hold vertically by the top plates.',
      'Hinge hips back cleanly and snap glutes forward to float the weight to chest height.',
      'Keep arms relaxed like ropes while your hips drive 100% of the power.',
    ],
    mistakes: [
      'Lifting with shoulders or squatting downward.',
      'Dropping hands below knees with a rounded back.',
    ],
  },
  {
    id: 'ex-shuttle-slams',
    name: 'Fast High-Knee & Shuttle Drill',
    muscleGroup: 'Conditioning',
    equipment: 'No Equipment (Bodyweight)',
    pattern: 'carry_swing',
    defaultSets: 4,
    defaultReps: '30s All-Out',
    defaultRestSeconds: 45,
    tempo: 'High Cadence',
    cues: [
      'Stay tall on the balls of your feet and pump bent arms briskly from shoulders.',
      'Drive knees rapidly to hip height with steady rhythmic breathing.',
      'Maintain crisp posture without leaning backward as intensity climbs.',
    ],
    mistakes: [
      'Slapping heels heavily onto the floor.',
      'Letting arms stop moving when legs tire.',
    ],
  },
  {
    id: 'ex-broad-jump',
    name: 'Broad Jump / Squat Jump',
    muscleGroup: 'Conditioning',
    equipment: 'No Equipment (Bodyweight)',
    pattern: 'cardio_jump',
    defaultSets: 3,
    defaultReps: '8–10',
    defaultRestSeconds: 60,
    tempo: 'Explosive',
    cues: [
      'Load hips back smoothly with arms swung behind you, then explode forward or upward.',
      'Absorb every landing softly into an athletic quarter-squat with knees aligned over toes.',
      'Reset balance for a beat between explosive reps.',
    ],
    mistakes: [
      'Landing with locked knees or letting knees buckle inward.',
      'Rushing consecutive reps without stabilizing.',
    ],
  },
  {
    id: 'ex-mountain-climber',
    name: 'Sprint Mountain Climber Intervals',
    muscleGroup: 'Conditioning',
    equipment: 'No Equipment (Bodyweight)',
    pattern: 'cardio_jump',
    defaultSets: 4,
    defaultReps: '30s / 15s',
    defaultRestSeconds: 45,
    tempo: 'Fast & Crisp',
    cues: [
      'Lock hands directly beneath shoulders in a rigid high plank.',
      'Drive alternating knees briskly toward your chest while keeping hips low and level.',
      'Exhale rhythmically without bouncing hips up and down.',
    ],
    mistakes: [
      'Piking hips high toward the ceiling as speed increases.',
      'Shifting shoulders backward behind wrists.',
    ],
  },
  {
    id: 'ex-side-plank',
    name: 'Forearm Side Plank Hold',
    muscleGroup: 'Core',
    equipment: 'No Equipment (Mat)',
    pattern: 'core_plank',
    defaultSets: 3,
    defaultReps: '30–45s / side',
    defaultRestSeconds: 30,
    tempo: 'Isometric',
    cues: [
      'Stack elbow cleanly underneath shoulder and lift hips into a straight diagonal line.',
      'Squeeze glutes and brace obliques so hips do not rotate forward or sag.',
      'Keep chin tucked softly in line with spine.',
    ],
    mistakes: [
      'Collapsing into the supporting shoulder joint.',
      'Letting top hip roll backward.',
    ],
  },
  {
    id: 'ex-hollow-hold',
    name: 'Hollow Body Core Hold',
    muscleGroup: 'Core',
    equipment: 'No Equipment (Mat)',
    pattern: 'core_hollow',
    defaultSets: 3,
    defaultReps: '30–40s',
    defaultRestSeconds: 45,
    tempo: 'Isometric',
    cues: [
      'Press lower back firmly into the floor before raising legs or shoulders.',
      'Extend legs and arms only as low as your lower back stays glued down.',
      'Breathe steadily behind a tight abdominal brace.',
    ],
    mistakes: [
      'Allowing an arch to open under the lower back.',
      'Tucking chin hard into chest.',
    ],
  },
  {
    id: 'ex-worlds-greatest-stretch',
    name: 'World’s Greatest Stretch Flow',
    muscleGroup: 'Mobility',
    equipment: 'No Equipment (Mat)',
    pattern: 'mobility_flow',
    defaultSets: 2,
    defaultReps: '6 / side',
    defaultRestSeconds: 30,
    tempo: 'Slow & Smooth',
    cues: [
      'Step into a deep runner’s lunge with rear knee lifted and back glute active.',
      'Drop inside elbow toward your front ankle, then rotate and reach fingers toward the ceiling.',
      'Rock hips back briefly to lengthen the front hamstring before switching sides.',
    ],
    mistakes: [
      'Rushing through rotations without pausing to exhale.',
      'Letting the front knee collapse inward during the lunge.',
    ],
  },
  {
    id: 'ex-sled-push',
    name: 'Weighted Sled Push / Drive',
    muscleGroup: 'Conditioning',
    equipment: 'Prowler Sled or Turf',
    pattern: 'carry_swing',
    defaultSets: 4,
    defaultReps: '4×30m',
    defaultRestSeconds: 75,
    tempo: 'Hard Drive',
    cues: [
      'Lean torso ~45 degrees into the handles with arms locked or bent tight to ribs.',
      'Drive aggressively through the balls of your feet with full hip and knee extension.',
      'Keep your spine neutral and eyes down toward the turf directly ahead.',
    ],
    mistakes: [
      'Popping upright too early and losing horizontal force against the sled.',
      'Taking tiny chopping steps while letting the lower back arch.',
    ],
  },
  {
    id: 'ex-sandbag-carry',
    name: 'Bear-Hug Sandbag / Duty Drag Carry',
    muscleGroup: 'Conditioning',
    equipment: 'Sandbag or Heavy Med Ball',
    pattern: 'carry_swing',
    defaultSets: 4,
    defaultReps: '4×30m',
    defaultRestSeconds: 75,
    tempo: 'Braced Stride',
    cues: [
      'Hinge down cleanly to scoop the bag tight against your lower chest and wrap forearms securely.',
      'Pull shoulder blades back and brace 360 degrees around your midline before stepping.',
      'Walk with controlled, deliberate strides without leaning backward into your lumbar spine.',
    ],
    mistakes: [
      'Letting the load slide down toward the belt line and rounding the shoulders.',
      'Holding your breath instead of breathing sharply behind a braced core.',
    ],
  },
  {
    id: 'ex-tempo-run',
    name: 'Threshold Run / Erg Intervals',
    muscleGroup: 'Conditioning',
    equipment: 'Track, Road, or Erg',
    pattern: 'cardio_jump',
    defaultSets: 5,
    defaultReps: '400m @ 85%',
    defaultRestSeconds: 75,
    tempo: 'Consistent Split',
    cues: [
      'Run tall with a slight forward lean from the ankles and brisk 175+ spm cadence.',
      'Drive elbows straight back without crossing arms across your chest.',
      'Hold smooth, controlled breathing through the final 100m of every repeat.',
    ],
    mistakes: [
      'Sprinting the first rep at 100% and fading badly on reps 3–5.',
      'Tightening traps and shrugging shoulders as heart rate climbs.',
    ],
  },
  {
    id: 'ex-zone2-run',
    name: 'Zone 2 Aerobic Base Run / Ruck',
    muscleGroup: 'Conditioning',
    equipment: 'Road, Trail, or Treadmill',
    pattern: 'cardio_jump',
    defaultSets: 1,
    defaultReps: '25–35 min',
    defaultRestSeconds: 60,
    tempo: 'Conversational Zone 2',
    cues: [
      'Keep effort at a steady conversational pace (roughly 65–75% max heart rate).',
      'Land softly beneath your center of mass with quiet, quick turnover.',
      'Maintain upright ribcage-over-pelvis posture throughout the session.',
    ],
    mistakes: [
      'Drifting into high Zone 4 intensity that steals recovery from heavy lower lifts.',
      'Overstriding on tired legs with heavy heel strikes.',
    ],
  },
  {
    id: 'ex-pallof-press',
    name: 'Anti-Rotation Pallof Core Press',
    muscleGroup: 'Core',
    equipment: 'Cable or Resistance Band',
    pattern: 'core_plank',
    defaultSets: 3,
    defaultReps: '10 / side',
    defaultRestSeconds: 45,
    tempo: '2-2-2-0',
    cues: [
      'Stand sideways to the anchor in an athletic quarter-squat with feet shoulder-width apart.',
      'Press the handle straight out from your sternum while resisting rotational pull.',
      'Hold extended for 2 full seconds with ribs stacked over hips before returning smoothly.',
    ],
    mistakes: [
      'Letting hips or shoulders twist toward the anchor point.',
      'Shrugging shoulders up while pressing forward.',
    ],
  },
  {
    id: 'ex-barbell-hip-thrust',
    name: 'Barbell Hip Thrust',
    muscleGroup: 'Legs',
    equipment: 'Barbell & Bench',
    pattern: 'hinge',
    defaultSets: 4,
    defaultReps: '8–10',
    defaultRestSeconds: 90,
    tempo: '2-1-1-1',
    cues: [
      'Position lower shoulder blades securely across the bench edge with shins vertical at top lockout.',
      'Keep chin tucked softly forward and ribs pinned down toward your pelvis throughout.',
      'Drive evenly through both heels to lock hips flat and squeeze glutes for 1 full second.',
    ],
    mistakes: [
      'Hyperextending the lower back at the top instead of tilting the pelvis posteriorly.',
      'Placing feet too close or too far so quads or hamstrings dominate over glutes.',
    ],
  },
  {
    id: 'ex-sumo-rdl',
    name: 'Dumbbell Sumo Squat',
    muscleGroup: 'Legs',
    equipment: 'Dumbbell / Kettlebell',
    pattern: 'squat',
    defaultSets: 3,
    defaultReps: '10–12',
    defaultRestSeconds: 75,
    tempo: '3-1-1-0',
    cues: [
      'Take a wide stance with toes angled out ~30–40 degrees and dumbbell held vertically between hips.',
      'Sit hips down and back while pressing knees outward in line with your middle toes.',
      'Drive through heels and inner arches to stand tall with strong glute and adductor tension.',
    ],
    mistakes: [
      'Letting knees cave inward toward the centerline during ascent.',
      'Rounding the upper back forward as the dumbbell lowers.',
    ],
  },
  {
    id: 'ex-banded-abduction',
    name: 'Banded Lateral Walk & Clamshell',
    muscleGroup: 'Legs',
    equipment: 'Resistance Band',
    pattern: 'lunge',
    defaultSets: 3,
    defaultReps: '15 / side',
    defaultRestSeconds: 45,
    tempo: 'Controlled',
    cues: [
      'Place a mini-band just above knees or ankles and drop into an athletic quarter-squat.',
      'Step laterally with toes pointing straight ahead, keeping steady tension on the band.',
      'Control the trailing leg smoothly inward without letting knees collapse together.',
    ],
    mistakes: [
      'Swinging the torso side-to-side or hiking the hip up to move the leg.',
      'Letting feet snap together so band tension drops to zero.',
    ],
  },
  {
    id: 'ex-face-pull',
    name: 'Cable or Band Face Pull',
    muscleGroup: 'Back',
    equipment: 'Cable or Resistance Band',
    pattern: 'pull_horizontal',
    defaultSets: 3,
    defaultReps: '12–15',
    defaultRestSeconds: 60,
    tempo: '1-2-2-0',
    cues: [
      'Set anchor at upper-chest height and grip with thumbs pointing backward.',
      'Pull handles toward your forehead while rotating forearms back into a double-biceps finish.',
      'Hold peak rear-delt and mid-trap squeeze for 2 seconds without flaring ribs.',
    ],
    mistakes: [
      'Shrugging upper traps toward ears or leaning backward with momentum.',
      'Letting elbows drop below wrist height at the finish.',
    ],
  },
  {
    id: 'ex-bird-dog',
    name: 'Slow-Tempo Bird Dog & Pelvic Brace',
    muscleGroup: 'Core',
    equipment: 'No Equipment (Mat)',
    pattern: 'core_plank',
    defaultSets: 3,
    defaultReps: '10 / side',
    defaultRestSeconds: 45,
    tempo: '2-2-2-0',
    cues: [
      'Start on hands and knees with wrists under shoulders, knees under hips, and spine level.',
      'Exhale softly to engage deep core, then reach opposite arm and leg straight out without twisting hips.',
      'Hold 2 seconds with glute squeezed and heel pushing backward before switching cleanly.',
    ],
    mistakes: [
      'Kicking the rear leg too high and arching the lower back.',
      'Shifting weight sharply sideways onto the grounded hip.',
    ],
  },
];

export const AFT_FIVE_EVENTS = [
  {
    order: '01',
    code: 'MDL',
    name: '3-Rep Max Deadlift',
    exerciseId: 'ex-aft-mdl',
    standard: '3 continuous reps · Hex bar · 0–100 pts',
  },
  {
    order: '02',
    code: 'HRP',
    name: 'Hand-Release Push-Up',
    exerciseId: 'ex-aft-hrp',
    standard: '2-min max reps · Full T-extension · 0–100 pts',
  },
  {
    order: '03',
    code: 'SDC',
    name: 'Sprint-Drag-Carry',
    exerciseId: 'ex-aft-sdc',
    standard: '5×50m shuttles · 90 lb sled · 2×40 lb KBs',
  },
  {
    order: '04',
    code: 'PLK',
    name: 'Plank',
    exerciseId: 'ex-aft-plank',
    standard: 'Max forearm hold · Straight alignment · 0–100 pts',
  },
  {
    order: '05',
    code: '2MR',
    name: 'Two-Mile Run',
    exerciseId: 'ex-aft-2mr',
    standard: '2-mile timed run · Aerobic finish · 0–100 pts',
  },
] as const;

export const HYBRID_PILLARS = [
  {
    order: '01',
    code: 'SQT',
    name: 'Compound Squat & Hinge',
    exerciseId: 'ex-back-squat',
    standard: 'Heavy barbell strength · 72h recovery spacing',
  },
  {
    order: '02',
    code: 'Z2',
    name: 'Zone 2 Aerobic Base',
    exerciseId: 'ex-zone2-run',
    standard: '25–35 min conversational run/ruck · Mitochondrial engine',
  },
  {
    order: '03',
    code: 'THR',
    name: 'Threshold Intervals',
    exerciseId: 'ex-tempo-run',
    standard: '400m @ 85% repeats · Lactate clearance & pacing',
  },
  {
    order: '04',
    code: 'SLD',
    name: 'Sled & Loaded Carries',
    exerciseId: 'ex-sled-push',
    standard: '4×30m drive + farmer shuttles · Work capacity',
  },
  {
    order: '05',
    code: 'UPP',
    name: 'Upper Push/Pull Armor',
    exerciseId: 'ex-bench-press',
    standard: 'Bench, row, OHP & pull-ups · Balanced hypertrophy',
  },
] as const;

export const LEO_PILLARS = [
  {
    order: '01',
    code: 'DRG',
    name: 'Victim Drag & Trap Pull',
    exerciseId: 'ex-aft-mdl',
    standard: 'Hex bar pull + sandbag drag · Lower-back safety',
  },
  {
    order: '02',
    code: 'SLD',
    name: 'Pursuit Sled & Carry',
    exerciseId: 'ex-sled-push',
    standard: '4×30m sled drive + 4×25m gear carry shuttles',
  },
  {
    order: '03',
    code: 'CTL',
    name: 'Subject-Control Push/Pull',
    exerciseId: 'ex-pullup',
    standard: 'Grappling pull-ups, rows & pressing stamina',
  },
  {
    order: '04',
    code: 'RUN',
    name: 'Foot Pursuit Intervals',
    exerciseId: 'ex-tempo-run',
    standard: '400m anaerobic sprints + burpee transitions',
  },
  {
    order: '05',
    code: 'BLT',
    name: 'Duty-Belt Core & Hip Armor',
    exerciseId: 'ex-pallof-press',
    standard: 'Anti-rotation bracing & thoracic/hip decompression',
  },
] as const;

export const ATHENA_PILLARS = [
  {
    order: '01',
    code: 'GLT',
    name: 'Hip Thrust & Glute Power',
    exerciseId: 'ex-barbell-hip-thrust',
    standard: 'Barbell hip thrusts & RDLs · Pelvic control & posterior strength',
  },
  {
    order: '02',
    code: 'UNI',
    name: 'Unilateral & Knee Track',
    exerciseId: 'ex-bulgarian-split',
    standard: 'Bulgarian splits, step-ups & banded glute-medius stability',
  },
  {
    order: '03',
    code: 'UPP',
    name: 'Posture Pull & Delts',
    exerciseId: 'ex-face-pull',
    standard: 'Face pulls, lat pulldowns & sculpted shoulder balance',
  },
  {
    order: '04',
    code: 'COR',
    name: 'Deep Core & Pelvic Floor',
    exerciseId: 'ex-dead-bug',
    standard: '360° diaphragmatic bracing, anti-rotation & low-back support',
  },
  {
    order: '05',
    code: 'FLW',
    name: 'Engine & Hip Mobility',
    exerciseId: 'ex-90-90-hip',
    standard: 'KB swings, sled drives & 90/90 hip capsule decompression',
  },
] as const;

export const AFT_PROGRAMS: WorkoutProgram[] = [
  {
    id: 'prog-aft-score-builder',
    isCustom: false,
    title: 'AFT 5-Event Score Builder',
    category: 'Strength',
    difficulty: 'Intermediate',
    estimatedMinutes: 55,
    daysPerWeek: 4,
    description:
      '4-day AFT rotation pairing event mastery with hypertrophy and 48–72h muscle-group recovery—alternating heavy lower/posterior pulling, upper push stamina, shuttle & core work, and aerobic pacing.',
    imageUrl: aftImg,
    exercises: [
      { id: 'aft-d1-1', exerciseId: 'ex-aft-mdl', name: 'Hex / Trap Bar 3RM Deadlift (MDL)', muscleGroup: 'Legs', sets: 4, reps: '3–5', restSeconds: 150, pattern: 'hinge', dayIndex: 0, dayFocus: 'Trap Bar Strength & Posterior Growth' },
      { id: 'aft-d1-2', exerciseId: 'ex-rdl', name: 'Romanian Deadlift', muscleGroup: 'Legs', sets: 3, reps: '8–10', restSeconds: 90, pattern: 'hinge', dayIndex: 0, dayFocus: 'Trap Bar Strength & Posterior Growth' },
      { id: 'aft-d1-3', exerciseId: 'ex-bulgarian-split', name: 'Bulgarian Split Squat', muscleGroup: 'Legs', sets: 3, reps: '10 / leg', restSeconds: 75, pattern: 'lunge', dayIndex: 0, dayFocus: 'Trap Bar Strength & Posterior Growth' },
      { id: 'aft-d1-4', exerciseId: 'ex-aft-plank', name: 'AFT Forearm Plank (PLK)', muscleGroup: 'Core', sets: 3, reps: '90–120s', restSeconds: 60, pattern: 'core_plank', dayIndex: 0, dayFocus: 'Trap Bar Strength & Posterior Growth' },
    ],
    days: [
      {
        dayNumber: 1,
        focus: 'Trap Bar Strength & Posterior Growth',
        recoveryNote: 'Targets glutes, quads & hamstrings · Rest 48–72h before next heavy leg day',
        exercises: [
          { id: 'aft-d1-1', exerciseId: 'ex-aft-mdl', name: 'Hex / Trap Bar 3RM Deadlift (MDL)', muscleGroup: 'Legs', sets: 4, reps: '3–5', restSeconds: 150, pattern: 'hinge' },
          { id: 'aft-d1-2', exerciseId: 'ex-rdl', name: 'Romanian Deadlift', muscleGroup: 'Legs', sets: 3, reps: '8–10', restSeconds: 90, pattern: 'hinge' },
          { id: 'aft-d1-3', exerciseId: 'ex-bulgarian-split', name: 'Bulgarian Split Squat', muscleGroup: 'Legs', sets: 3, reps: '10 / leg', restSeconds: 75, pattern: 'lunge' },
          { id: 'aft-d1-4', exerciseId: 'ex-aft-plank', name: 'AFT Forearm Plank (PLK)', muscleGroup: 'Core', sets: 3, reps: '90–120s', restSeconds: 60, pattern: 'core_plank' },
        ],
      },
      {
        dayNumber: 2,
        focus: 'HRP Stamina & Upper Hypertrophy',
        recoveryNote: 'Legs & lower back recover while training chest, back & shoulders',
        exercises: [
          { id: 'aft-d2-1', exerciseId: 'ex-aft-hrp', name: 'Hand-Release Push-Up (HRP)', muscleGroup: 'Chest', sets: 4, reps: '25–35', restSeconds: 60, pattern: 'push_horizontal' },
          { id: 'aft-d2-2', exerciseId: 'ex-incline-db-press', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', sets: 4, reps: '8–10', restSeconds: 90, pattern: 'push_horizontal' },
          { id: 'aft-d2-3', exerciseId: 'ex-barbell-row', name: 'Bent-Over Barbell Row', muscleGroup: 'Back', sets: 4, reps: '8–10', restSeconds: 90, pattern: 'pull_horizontal' },
          { id: 'aft-d2-4', exerciseId: 'ex-lat-pulldown', name: 'Wide-Grip Lat Pulldown', muscleGroup: 'Back', sets: 3, reps: '10–12', restSeconds: 75, pattern: 'pull_vertical' },
          { id: 'aft-d2-5', exerciseId: 'ex-db-shoulder-press', name: 'Seated Dumbbell Shoulder Press', muscleGroup: 'Shoulders', sets: 3, reps: '10–12', restSeconds: 75, pattern: 'push_vertical' },
        ],
      },
      {
        dayNumber: 3,
        focus: 'Sprint-Drag-Carry Power & Core',
        recoveryNote: '72h after heavy MDL · Explosive anaerobic sled & kettlebell conditioning',
        exercises: [
          { id: 'aft-d3-1', exerciseId: 'ex-aft-sdc', name: 'Sprint-Drag-Carry Shuttle (SDC)', muscleGroup: 'Conditioning', sets: 3, reps: '250m Shuttle', restSeconds: 120, pattern: 'carry_swing' },
          { id: 'aft-d3-2', exerciseId: 'ex-kb-swing', name: 'Russian Kettlebell Swing', muscleGroup: 'Conditioning', sets: 4, reps: '15', restSeconds: 60, pattern: 'carry_swing' },
          { id: 'aft-d3-3', exerciseId: 'ex-walking-lunge', name: 'Dumbbell Reverse Lunge', muscleGroup: 'Legs', sets: 3, reps: '10 / leg', restSeconds: 60, pattern: 'lunge' },
          { id: 'aft-d3-4', exerciseId: 'ex-aft-plank', name: 'AFT Forearm Plank (PLK)', muscleGroup: 'Core', sets: 3, reps: '120–150s', restSeconds: 60, pattern: 'core_plank' },
          { id: 'aft-d3-5', exerciseId: 'ex-dead-bug', name: 'Slow-Tempo Dead Bug', muscleGroup: 'Core', sets: 3, reps: '10 / side', restSeconds: 45, pattern: 'core_hollow' },
        ],
      },
      {
        dayNumber: 4,
        focus: '2-Mile Run Pacing & Upper Balance',
        recoveryNote: 'Aerobic 2MR intervals + upper pulling & arm volume before rest day',
        exercises: [
          { id: 'aft-d4-1', exerciseId: 'ex-aft-2mr', name: 'Two-Mile Run Pace Intervals (2MR)', muscleGroup: 'Conditioning', sets: 4, reps: '800m @ Goal Pace', restSeconds: 90, pattern: 'cardio_jump' },
          { id: 'aft-d4-2', exerciseId: 'ex-pullup', name: 'Assisted or Bodyweight Pull-Up', muscleGroup: 'Back', sets: 3, reps: '8–10', restSeconds: 90, pattern: 'pull_vertical' },
          { id: 'aft-d4-3', exerciseId: 'ex-aft-hrp', name: 'Hand-Release Push-Up (HRP)', muscleGroup: 'Chest', sets: 3, reps: 'Max in 60s', restSeconds: 60, pattern: 'push_horizontal' },
          { id: 'aft-d4-4', exerciseId: 'ex-lateral-raise', name: 'Dumbbell Lateral Raise', muscleGroup: 'Shoulders', sets: 3, reps: '12–15', restSeconds: 60, pattern: 'curl_raise' },
          { id: 'aft-d4-5', exerciseId: 'ex-thoracic-flow', name: 'Open-Book Thoracic Rotation', muscleGroup: 'Mobility', sets: 2, reps: '8 / side', restSeconds: 30, pattern: 'mobility_flow' },
        ],
      },
    ],
  },
  {
    id: 'prog-aft-sdc-power',
    isCustom: false,
    title: 'AFT Strength & Shuttle Power',
    category: 'Conditioning',
    difficulty: 'Advanced',
    estimatedMinutes: 45,
    daysPerWeek: 3,
    description:
      '3-day high-output rotation alternating Trap Bar strength, Upper Push/Pull hypertrophy, and Shuttle conditioning so every muscle group recovers 48–72 hours between hard sessions.',
    imageUrl: aftImg,
    exercises: [
      { id: 'aftp-d1-1', exerciseId: 'ex-aft-mdl', name: 'Hex / Trap Bar 3RM Deadlift (MDL)', muscleGroup: 'Legs', sets: 5, reps: '3–5', restSeconds: 150, pattern: 'hinge', dayIndex: 0, dayFocus: 'Trap Bar & Lower Power' },
      { id: 'aftp-d1-2', exerciseId: 'ex-bulgarian-split', name: 'Bulgarian Split Squat', muscleGroup: 'Legs', sets: 3, reps: '10 / leg', restSeconds: 75, pattern: 'lunge', dayIndex: 0, dayFocus: 'Trap Bar & Lower Power' },
      { id: 'aftp-d1-3', exerciseId: 'ex-box-jump', name: 'Plyometric Box Jump / Step-Up', muscleGroup: 'Conditioning', sets: 3, reps: '8', restSeconds: 60, pattern: 'cardio_jump', dayIndex: 0, dayFocus: 'Trap Bar & Lower Power' },
      { id: 'aftp-d1-4', exerciseId: 'ex-aft-plank', name: 'AFT Forearm Plank (PLK)', muscleGroup: 'Core', sets: 3, reps: '120s', restSeconds: 60, pattern: 'core_plank', dayIndex: 0, dayFocus: 'Trap Bar & Lower Power' },
    ],
    days: [
      {
        dayNumber: 1,
        focus: 'Trap Bar & Lower Power',
        recoveryNote: 'Heavy lower-body & posterior strength · 48–72h leg recovery follows',
        exercises: [
          { id: 'aftp-d1-1', exerciseId: 'ex-aft-mdl', name: 'Hex / Trap Bar 3RM Deadlift (MDL)', muscleGroup: 'Legs', sets: 5, reps: '3–5', restSeconds: 150, pattern: 'hinge' },
          { id: 'aftp-d1-2', exerciseId: 'ex-bulgarian-split', name: 'Bulgarian Split Squat', muscleGroup: 'Legs', sets: 3, reps: '10 / leg', restSeconds: 75, pattern: 'lunge' },
          { id: 'aftp-d1-3', exerciseId: 'ex-box-jump', name: 'Plyometric Box Jump / Step-Up', muscleGroup: 'Conditioning', sets: 3, reps: '8', restSeconds: 60, pattern: 'cardio_jump' },
          { id: 'aftp-d1-4', exerciseId: 'ex-aft-plank', name: 'AFT Forearm Plank (PLK)', muscleGroup: 'Core', sets: 3, reps: '120s', restSeconds: 60, pattern: 'core_plank' },
        ],
      },
      {
        dayNumber: 2,
        focus: 'Upper Push/Pull & Grip Density',
        recoveryNote: 'Spares lower body while building HRP pressing stamina & kettlebell carry grip',
        exercises: [
          { id: 'aftp-d2-1', exerciseId: 'ex-aft-hrp', name: 'Hand-Release Push-Up (HRP)', muscleGroup: 'Chest', sets: 4, reps: 'Max in 60s', restSeconds: 60, pattern: 'push_horizontal' },
          { id: 'aftp-d2-2', exerciseId: 'ex-db-row', name: 'Single-Arm Dumbbell Row', muscleGroup: 'Back', sets: 4, reps: '10 / side', restSeconds: 60, pattern: 'pull_horizontal' },
          { id: 'aftp-d2-3', exerciseId: 'ex-ohp', name: 'Standing Overhead Press', muscleGroup: 'Shoulders', sets: 3, reps: '6–8', restSeconds: 90, pattern: 'push_vertical' },
          { id: 'aftp-d2-4', exerciseId: 'ex-bicep-curl', name: 'Dumbbell Hammer / Supinated Curl', muscleGroup: 'Arms', sets: 3, reps: '10–12', restSeconds: 60, pattern: 'curl_raise' },
        ],
      },
      {
        dayNumber: 3,
        focus: 'Shuttle Speed & 2-Mile Finish',
        recoveryNote: 'Combines SDC sled/kettlebell shuttles with controlled 2MR pace repeats',
        exercises: [
          { id: 'aftp-d3-1', exerciseId: 'ex-aft-sdc', name: 'Sprint-Drag-Carry Shuttle (SDC)', muscleGroup: 'Conditioning', sets: 4, reps: '250m Shuttle', restSeconds: 120, pattern: 'carry_swing' },
          { id: 'aftp-d3-2', exerciseId: 'ex-aft-2mr', name: 'Two-Mile Run Pace Intervals (2MR)', muscleGroup: 'Conditioning', sets: 3, reps: '800m @ Goal Pace', restSeconds: 90, pattern: 'cardio_jump' },
          { id: 'aftp-d3-3', exerciseId: 'ex-90-90-hip', name: '90/90 Hip Switch Flow', muscleGroup: 'Mobility', sets: 2, reps: '10 switches', restSeconds: 30, pattern: 'mobility_flow' },
        ],
      },
    ],
  },
];

export const PRE_EXISTING_PROGRAMS: WorkoutProgram[] = [
  {
    id: 'prog-strength-foundations',
    isCustom: false,
    title: 'Strength Foundations',
    category: 'Strength',
    difficulty: 'Beginner',
    estimatedMinutes: 45,
    daysPerWeek: 4,
    description:
      '4-day Upper/Lower strength & hypertrophy rotation alternating Squat, Push, Hinge, and Pull emphasis so primary muscle groups get 72 hours of recovery between heavy lifts.',
    imageUrl: strengthImg,
    exercises: [
      { id: 'sf-d1-1', exerciseId: 'ex-back-squat', name: 'Barbell Back Squat', muscleGroup: 'Legs', sets: 4, reps: '6–8', restSeconds: 120, pattern: 'squat', dayIndex: 0, dayFocus: 'Lower Quad & Squat Strength' },
      { id: 'sf-d1-2', exerciseId: 'ex-rdl', name: 'Romanian Deadlift', muscleGroup: 'Legs', sets: 3, reps: '8–10', restSeconds: 90, pattern: 'hinge', dayIndex: 0, dayFocus: 'Lower Quad & Squat Strength' },
      { id: 'sf-d1-3', exerciseId: 'ex-walking-lunge', name: 'Dumbbell Reverse Lunge', muscleGroup: 'Legs', sets: 3, reps: '10 / leg', restSeconds: 60, pattern: 'lunge', dayIndex: 0, dayFocus: 'Lower Quad & Squat Strength' },
      { id: 'sf-d1-4', exerciseId: 'ex-plank', name: 'Forearm RKC Plank', muscleGroup: 'Core', sets: 3, reps: '45s', restSeconds: 45, pattern: 'core_plank', dayIndex: 0, dayFocus: 'Lower Quad & Squat Strength' },
    ],
    days: [
      {
        dayNumber: 1,
        focus: 'Lower Quad & Squat Strength',
        recoveryNote: 'Quads & glutes primary · 72h recovery before Day 3 posterior hinge',
        exercises: [
          { id: 'sf-d1-1', exerciseId: 'ex-back-squat', name: 'Barbell Back Squat', muscleGroup: 'Legs', sets: 4, reps: '6–8', restSeconds: 120, pattern: 'squat' },
          { id: 'sf-d1-2', exerciseId: 'ex-rdl', name: 'Romanian Deadlift', muscleGroup: 'Legs', sets: 3, reps: '8–10', restSeconds: 90, pattern: 'hinge' },
          { id: 'sf-d1-3', exerciseId: 'ex-walking-lunge', name: 'Dumbbell Reverse Lunge', muscleGroup: 'Legs', sets: 3, reps: '10 / leg', restSeconds: 60, pattern: 'lunge' },
          { id: 'sf-d1-4', exerciseId: 'ex-plank', name: 'Forearm RKC Plank', muscleGroup: 'Core', sets: 3, reps: '45s', restSeconds: 45, pattern: 'core_plank' },
        ],
      },
      {
        dayNumber: 2,
        focus: 'Upper Horizontal Push & Pull',
        recoveryNote: 'Lower body rests · Focus on chest, mid-back & shoulder stability',
        exercises: [
          { id: 'sf-d2-1', exerciseId: 'ex-bench-press', name: 'Barbell Bench Press', muscleGroup: 'Chest', sets: 4, reps: '6–8', restSeconds: 120, pattern: 'push_horizontal' },
          { id: 'sf-d2-2', exerciseId: 'ex-barbell-row', name: 'Bent-Over Barbell Row', muscleGroup: 'Back', sets: 4, reps: '8–10', restSeconds: 90, pattern: 'pull_horizontal' },
          { id: 'sf-d2-3', exerciseId: 'ex-db-shoulder-press', name: 'Seated Dumbbell Shoulder Press', muscleGroup: 'Shoulders', sets: 3, reps: '10–12', restSeconds: 75, pattern: 'push_vertical' },
          { id: 'sf-d2-4', exerciseId: 'ex-bicep-curl', name: 'Dumbbell Hammer / Supinated Curl', muscleGroup: 'Arms', sets: 3, reps: '10–12', restSeconds: 60, pattern: 'curl_raise' },
        ],
      },
      {
        dayNumber: 3,
        focus: 'Posterior Hinge & Unilateral Legs',
        recoveryNote: 'Hamstrings, glutes & spinal erectors · 72h recovery for chest/shoulders',
        exercises: [
          { id: 'sf-d3-1', exerciseId: 'ex-deadlift', name: 'Conventional Barbell Deadlift', muscleGroup: 'Back', sets: 3, reps: '5', restSeconds: 150, pattern: 'hinge' },
          { id: 'sf-d3-2', exerciseId: 'ex-goblet-squat', name: 'Dumbbell Goblet Squat', muscleGroup: 'Legs', sets: 3, reps: '10–12', restSeconds: 75, pattern: 'squat' },
          { id: 'sf-d3-3', exerciseId: 'ex-bulgarian-split', name: 'Bulgarian Split Squat', muscleGroup: 'Legs', sets: 3, reps: '10 / leg', restSeconds: 75, pattern: 'lunge' },
          { id: 'sf-d3-4', exerciseId: 'ex-dead-bug', name: 'Slow-Tempo Dead Bug', muscleGroup: 'Core', sets: 3, reps: '10 / side', restSeconds: 45, pattern: 'core_hollow' },
        ],
      },
      {
        dayNumber: 4,
        focus: 'Upper Vertical Press & Lat Width',
        recoveryNote: 'Overhead strength & vertical pulling while legs fully recover',
        exercises: [
          { id: 'sf-d4-1', exerciseId: 'ex-ohp', name: 'Standing Overhead Press', muscleGroup: 'Shoulders', sets: 4, reps: '6–8', restSeconds: 90, pattern: 'push_vertical' },
          { id: 'sf-d4-2', exerciseId: 'ex-lat-pulldown', name: 'Wide-Grip Lat Pulldown', muscleGroup: 'Back', sets: 4, reps: '10–12', restSeconds: 75, pattern: 'pull_vertical' },
          { id: 'sf-d4-3', exerciseId: 'ex-incline-db-press', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', sets: 3, reps: '8–10', restSeconds: 90, pattern: 'push_horizontal' },
          { id: 'sf-d4-4', exerciseId: 'ex-lateral-raise', name: 'Dumbbell Lateral Raise', muscleGroup: 'Shoulders', sets: 3, reps: '12–15', restSeconds: 60, pattern: 'curl_raise' },
        ],
      },
    ],
  },
  {
    id: 'prog-hypertrophy-split',
    isCustom: false,
    title: 'Hypertrophy Upper/Lower Split',
    category: 'Hypertrophy',
    difficulty: 'Intermediate',
    estimatedMinutes: 55,
    daysPerWeek: 4,
    description:
      'High-volume 4-day muscle-growth rotation splitting Upper Push/Width, Lower Quad/Glute, Upper Back/Arms, and Lower Posterior/Core so every muscle recovers 72 hours between direct sessions.',
    imageUrl: hypertrophyImg,
    exercises: [
      { id: 'hy-d1-1', exerciseId: 'ex-incline-db-press', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', sets: 4, reps: '8–10', restSeconds: 90, pattern: 'push_horizontal', dayIndex: 0, dayFocus: 'Upper A: Chest, Shoulders & Lat Width' },
      { id: 'hy-d1-2', exerciseId: 'ex-lat-pulldown', name: 'Wide-Grip Lat Pulldown', muscleGroup: 'Back', sets: 4, reps: '10–12', restSeconds: 75, pattern: 'pull_vertical', dayIndex: 0, dayFocus: 'Upper A: Chest, Shoulders & Lat Width' },
      { id: 'hy-d1-3', exerciseId: 'ex-db-shoulder-press', name: 'Seated Dumbbell Shoulder Press', muscleGroup: 'Shoulders', sets: 3, reps: '10–12', restSeconds: 75, pattern: 'push_vertical', dayIndex: 0, dayFocus: 'Upper A: Chest, Shoulders & Lat Width' },
      { id: 'hy-d1-4', exerciseId: 'ex-lateral-raise', name: 'Dumbbell Lateral Raise', muscleGroup: 'Shoulders', sets: 4, reps: '12–15', restSeconds: 60, pattern: 'curl_raise', dayIndex: 0, dayFocus: 'Upper A: Chest, Shoulders & Lat Width' },
      { id: 'hy-d1-5', exerciseId: 'ex-pushup', name: 'Tempo Push-Up', muscleGroup: 'Chest', sets: 3, reps: '12–15', restSeconds: 60, pattern: 'push_horizontal', dayIndex: 0, dayFocus: 'Upper A: Chest, Shoulders & Lat Width' },
    ],
    days: [
      {
        dayNumber: 1,
        focus: 'Upper A: Chest, Shoulders & Lat Width',
        recoveryNote: 'High-tension upper volume · 72h recovery before Day 3 Upper B',
        exercises: [
          { id: 'hy-d1-1', exerciseId: 'ex-incline-db-press', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', sets: 4, reps: '8–10', restSeconds: 90, pattern: 'push_horizontal' },
          { id: 'hy-d1-2', exerciseId: 'ex-lat-pulldown', name: 'Wide-Grip Lat Pulldown', muscleGroup: 'Back', sets: 4, reps: '10–12', restSeconds: 75, pattern: 'pull_vertical' },
          { id: 'hy-d1-3', exerciseId: 'ex-db-shoulder-press', name: 'Seated Dumbbell Shoulder Press', muscleGroup: 'Shoulders', sets: 3, reps: '10–12', restSeconds: 75, pattern: 'push_vertical' },
          { id: 'hy-d1-4', exerciseId: 'ex-lateral-raise', name: 'Dumbbell Lateral Raise', muscleGroup: 'Shoulders', sets: 4, reps: '12–15', restSeconds: 60, pattern: 'curl_raise' },
          { id: 'hy-d1-5', exerciseId: 'ex-pushup', name: 'Tempo Push-Up', muscleGroup: 'Chest', sets: 3, reps: '12–15', restSeconds: 60, pattern: 'push_horizontal' },
        ],
      },
      {
        dayNumber: 2,
        focus: 'Lower A: Quads & Unilateral Glutes',
        recoveryNote: 'Upper body grows & recovers · Deep knee-flexion quad hypertrophy',
        exercises: [
          { id: 'hy-d2-1', exerciseId: 'ex-back-squat', name: 'Barbell Back Squat', muscleGroup: 'Legs', sets: 4, reps: '8–10', restSeconds: 120, pattern: 'squat' },
          { id: 'hy-d2-2', exerciseId: 'ex-bulgarian-split', name: 'Bulgarian Split Squat', muscleGroup: 'Legs', sets: 3, reps: '10 / leg', restSeconds: 75, pattern: 'lunge' },
          { id: 'hy-d2-3', exerciseId: 'ex-goblet-squat', name: 'Dumbbell Goblet Squat', muscleGroup: 'Legs', sets: 3, reps: '12–15', restSeconds: 60, pattern: 'squat' },
          { id: 'hy-d2-4', exerciseId: 'ex-plank', name: 'Forearm RKC Plank', muscleGroup: 'Core', sets: 3, reps: '45–60s', restSeconds: 45, pattern: 'core_plank' },
        ],
      },
      {
        dayNumber: 3,
        focus: 'Upper B: Back Thickness, Delts & Arms',
        recoveryNote: '72h after Upper A · Emphasizes mid-back rows, pull-ups & biceps',
        exercises: [
          { id: 'hy-d3-1', exerciseId: 'ex-barbell-row', name: 'Bent-Over Barbell Row', muscleGroup: 'Back', sets: 4, reps: '8–10', restSeconds: 90, pattern: 'pull_horizontal' },
          { id: 'hy-d3-2', exerciseId: 'ex-pullup', name: 'Assisted or Bodyweight Pull-Up', muscleGroup: 'Back', sets: 3, reps: '8–10', restSeconds: 90, pattern: 'pull_vertical' },
          { id: 'hy-d3-3', exerciseId: 'ex-bench-press', name: 'Barbell Bench Press', muscleGroup: 'Chest', sets: 3, reps: '8–10', restSeconds: 90, pattern: 'push_horizontal' },
          { id: 'hy-d3-4', exerciseId: 'ex-db-row', name: 'Single-Arm Dumbbell Row', muscleGroup: 'Back', sets: 3, reps: '10–12 / side', restSeconds: 60, pattern: 'pull_horizontal' },
          { id: 'hy-d3-5', exerciseId: 'ex-bicep-curl', name: 'Dumbbell Hammer / Supinated Curl', muscleGroup: 'Arms', sets: 4, reps: '10–12', restSeconds: 60, pattern: 'curl_raise' },
        ],
      },
      {
        dayNumber: 4,
        focus: 'Lower B: Hamstrings, Hinge & Core',
        recoveryNote: '72h after Lower A · Posterior-chain lengthening + deep core control',
        exercises: [
          { id: 'hy-d4-1', exerciseId: 'ex-rdl', name: 'Romanian Deadlift', muscleGroup: 'Legs', sets: 4, reps: '8–10', restSeconds: 90, pattern: 'hinge' },
          { id: 'hy-d4-2', exerciseId: 'ex-walking-lunge', name: 'Dumbbell Reverse Lunge', muscleGroup: 'Legs', sets: 3, reps: '10 / leg', restSeconds: 60, pattern: 'lunge' },
          { id: 'hy-d4-3', exerciseId: 'ex-kb-swing', name: 'Russian Kettlebell Swing', muscleGroup: 'Conditioning', sets: 3, reps: '15–20', restSeconds: 60, pattern: 'carry_swing' },
          { id: 'hy-d4-4', exerciseId: 'ex-dead-bug', name: 'Slow-Tempo Dead Bug', muscleGroup: 'Core', sets: 3, reps: '10 / side', restSeconds: 45, pattern: 'core_hollow' },
        ],
      },
    ],
  },
  {
    id: 'prog-metabolic-hiit',
    isCustom: false,
    title: 'Metabolic HIIT & Conditioning',
    category: 'Conditioning',
    difficulty: 'Intermediate',
    estimatedMinutes: 30,
    daysPerWeek: 3,
    description:
      '3-day athletic conditioning rotation alternating Posterior Power, Upper/Core Density, and Lower Plyo intervals to drive VO2 max without overtraining fatigued joints.',
    imageUrl: hiitImg,
    exercises: [
      { id: 'hc-d1-1', exerciseId: 'ex-kb-swing', name: 'Russian Kettlebell Swing', muscleGroup: 'Conditioning', sets: 4, reps: '15–20', restSeconds: 60, pattern: 'carry_swing', dayIndex: 0, dayFocus: 'Posterior Hinge & Rope Power' },
      { id: 'hc-d1-2', exerciseId: 'ex-battle-ropes', name: 'Alternating Battle Rope Waves', muscleGroup: 'Conditioning', sets: 4, reps: '30s', restSeconds: 45, pattern: 'carry_swing', dayIndex: 0, dayFocus: 'Posterior Hinge & Rope Power' },
      { id: 'hc-d1-3', exerciseId: 'ex-goblet-squat', name: 'Dumbbell Goblet Squat', muscleGroup: 'Legs', sets: 3, reps: '12', restSeconds: 60, pattern: 'squat', dayIndex: 0, dayFocus: 'Posterior Hinge & Rope Power' },
      { id: 'hc-d1-4', exerciseId: 'ex-plank', name: 'Forearm RKC Plank', muscleGroup: 'Core', sets: 3, reps: '45s', restSeconds: 45, pattern: 'core_plank', dayIndex: 0, dayFocus: 'Posterior Hinge & Rope Power' },
    ],
    days: [
      {
        dayNumber: 1,
        focus: 'Posterior Hinge & Rope Power',
        recoveryNote: 'Hip-snap power & aerobic threshold · 48h before lower plyometrics',
        exercises: [
          { id: 'hc-d1-1', exerciseId: 'ex-kb-swing', name: 'Russian Kettlebell Swing', muscleGroup: 'Conditioning', sets: 4, reps: '15–20', restSeconds: 60, pattern: 'carry_swing' },
          { id: 'hc-d1-2', exerciseId: 'ex-battle-ropes', name: 'Alternating Battle Rope Waves', muscleGroup: 'Conditioning', sets: 4, reps: '30s', restSeconds: 45, pattern: 'carry_swing' },
          { id: 'hc-d1-3', exerciseId: 'ex-goblet-squat', name: 'Dumbbell Goblet Squat', muscleGroup: 'Legs', sets: 3, reps: '12', restSeconds: 60, pattern: 'squat' },
          { id: 'hc-d1-4', exerciseId: 'ex-plank', name: 'Forearm RKC Plank', muscleGroup: 'Core', sets: 3, reps: '45s', restSeconds: 45, pattern: 'core_plank' },
        ],
      },
      {
        dayNumber: 2,
        focus: 'Upper Density & Core Engine',
        recoveryNote: 'Spares hamstrings & knees while driving upper-body work capacity',
        exercises: [
          { id: 'hc-d2-1', exerciseId: 'ex-pushup', name: 'Tempo Push-Up', muscleGroup: 'Chest', sets: 4, reps: '12–15', restSeconds: 45, pattern: 'push_horizontal' },
          { id: 'hc-d2-2', exerciseId: 'ex-db-row', name: 'Single-Arm Dumbbell Row', muscleGroup: 'Back', sets: 4, reps: '10 / side', restSeconds: 45, pattern: 'pull_horizontal' },
          { id: 'hc-d2-3', exerciseId: 'ex-battle-ropes', name: 'Alternating Battle Rope Waves', muscleGroup: 'Conditioning', sets: 4, reps: '30s', restSeconds: 45, pattern: 'carry_swing' },
          { id: 'hc-d2-4', exerciseId: 'ex-dead-bug', name: 'Slow-Tempo Dead Bug', muscleGroup: 'Core', sets: 3, reps: '10 / side', restSeconds: 30, pattern: 'core_hollow' },
        ],
      },
      {
        dayNumber: 3,
        focus: 'Explosive Lower & Plyo Finish',
        recoveryNote: '48–72h after Day 1 legs · Peak lower-body power & sprint conditioning',
        exercises: [
          { id: 'hc-d3-1', exerciseId: 'ex-box-jump', name: 'Plyometric Box Jump / Step-Up', muscleGroup: 'Conditioning', sets: 4, reps: '8–10', restSeconds: 60, pattern: 'cardio_jump' },
          { id: 'hc-d3-2', exerciseId: 'ex-walking-lunge', name: 'Dumbbell Reverse Lunge', muscleGroup: 'Legs', sets: 3, reps: '10 / leg', restSeconds: 60, pattern: 'lunge' },
          { id: 'hc-d3-3', exerciseId: 'ex-burpee', name: 'Controlled Step-Back / Jump Burpee', muscleGroup: 'Conditioning', sets: 4, reps: '10–12', restSeconds: 45, pattern: 'cardio_jump' },
          { id: 'hc-d3-4', exerciseId: 'ex-90-90-hip', name: '90/90 Hip Switch Flow', muscleGroup: 'Mobility', sets: 2, reps: '10 switches', restSeconds: 30, pattern: 'mobility_flow' },
        ],
      },
    ],
  },
  {
    id: 'prog-mobility-restore',
    isCustom: false,
    title: 'Mobility & Core Restore',
    category: 'Mobility',
    difficulty: 'Beginner',
    estimatedMinutes: 25,
    daysPerWeek: 3,
    description:
      '3-day active-recovery rotation targeting thoracic posture, hip capsule mobility, and deep core stabilization to accelerate recovery between heavy hypertrophy and strength sessions.',
    imageUrl: mobilityImg,
    exercises: [
      { id: 'mr-d1-1', exerciseId: 'ex-thoracic-flow', name: 'Open-Book Thoracic Rotation', muscleGroup: 'Mobility', sets: 3, reps: '8 / side', restSeconds: 30, pattern: 'mobility_flow', dayIndex: 0, dayFocus: 'Thoracic Spine & Anterior Core' },
      { id: 'mr-d1-2', exerciseId: 'ex-dead-bug', name: 'Slow-Tempo Dead Bug', muscleGroup: 'Core', sets: 3, reps: '10 / side', restSeconds: 45, pattern: 'core_hollow', dayIndex: 0, dayFocus: 'Thoracic Spine & Anterior Core' },
      { id: 'mr-d1-3', exerciseId: 'ex-plank', name: 'Forearm RKC Plank', muscleGroup: 'Core', sets: 3, reps: '45s', restSeconds: 45, pattern: 'core_plank', dayIndex: 0, dayFocus: 'Thoracic Spine & Anterior Core' },
    ],
    days: [
      {
        dayNumber: 1,
        focus: 'Thoracic Spine & Anterior Core',
        recoveryNote: 'Decompresses upper back & builds deep spinal bracing without joint fatigue',
        exercises: [
          { id: 'mr-d1-1', exerciseId: 'ex-thoracic-flow', name: 'Open-Book Thoracic Rotation', muscleGroup: 'Mobility', sets: 3, reps: '8 / side', restSeconds: 30, pattern: 'mobility_flow' },
          { id: 'mr-d1-2', exerciseId: 'ex-dead-bug', name: 'Slow-Tempo Dead Bug', muscleGroup: 'Core', sets: 3, reps: '10 / side', restSeconds: 45, pattern: 'core_hollow' },
          { id: 'mr-d1-3', exerciseId: 'ex-plank', name: 'Forearm RKC Plank', muscleGroup: 'Core', sets: 3, reps: '45s', restSeconds: 45, pattern: 'core_plank' },
        ],
      },
      {
        dayNumber: 2,
        focus: 'Hip Capsule & Lower Stability',
        recoveryNote: 'Opens tight hip flexors & rotators after heavy squats and deadlifts',
        exercises: [
          { id: 'mr-d2-1', exerciseId: 'ex-90-90-hip', name: '90/90 Hip Switch Flow', muscleGroup: 'Mobility', sets: 3, reps: '10 switches', restSeconds: 30, pattern: 'mobility_flow' },
          { id: 'mr-d2-2', exerciseId: 'ex-goblet-squat', name: 'Dumbbell Goblet Squat', muscleGroup: 'Legs', sets: 2, reps: '8 slow', restSeconds: 60, pattern: 'squat' },
          { id: 'mr-d2-3', exerciseId: 'ex-walking-lunge', name: 'Dumbbell Reverse Lunge', muscleGroup: 'Legs', sets: 2, reps: '10 / leg', restSeconds: 45, pattern: 'lunge' },
        ],
      },
      {
        dayNumber: 3,
        focus: 'Full-Body Flow & Bracing',
        recoveryNote: 'Balances posture, shoulder mobility & core endurance for the next cycle',
        exercises: [
          { id: 'mr-d3-1', exerciseId: 'ex-thoracic-flow', name: 'Open-Book Thoracic Rotation', muscleGroup: 'Mobility', sets: 2, reps: '8 / side', restSeconds: 30, pattern: 'mobility_flow' },
          { id: 'mr-d3-2', exerciseId: 'ex-90-90-hip', name: '90/90 Hip Switch Flow', muscleGroup: 'Mobility', sets: 2, reps: '10 switches', restSeconds: 30, pattern: 'mobility_flow' },
          { id: 'mr-d3-3', exerciseId: 'ex-dead-bug', name: 'Slow-Tempo Dead Bug', muscleGroup: 'Core', sets: 3, reps: '10 / side', restSeconds: 45, pattern: 'core_hollow' },
          { id: 'mr-d3-4', exerciseId: 'ex-pushup', name: 'Tempo Push-Up', muscleGroup: 'Chest', sets: 2, reps: '10 controlled', restSeconds: 45, pattern: 'push_horizontal' },
        ],
      },
    ],
  },
  {
    id: 'prog-hybrid-athlete',
    isCustom: false,
    title: 'Hybrid Athlete Strength & Engine',
    category: 'Conditioning',
    difficulty: 'Intermediate',
    estimatedMinutes: 55,
    daysPerWeek: 4,
    description:
      '4-day hybrid strength + endurance split pairing heavy compound lifts, upper-body hypertrophy, threshold running intervals, and loaded carries with 48–72h muscle-group recovery spacing.',
    imageUrl: hybridImg,
    exercises: [
      { id: 'hyb-d1-1', exerciseId: 'ex-back-squat', name: 'Barbell Back Squat', muscleGroup: 'Legs', sets: 4, reps: '6–8', restSeconds: 120, pattern: 'squat', dayIndex: 0, dayFocus: 'Lower Squat Strength & Zone 2 Base' },
      { id: 'hyb-d1-2', exerciseId: 'ex-rdl', name: 'Romanian Deadlift', muscleGroup: 'Legs', sets: 3, reps: '8–10', restSeconds: 90, pattern: 'hinge', dayIndex: 0, dayFocus: 'Lower Squat Strength & Zone 2 Base' },
      { id: 'hyb-d1-3', exerciseId: 'ex-walking-lunge', name: 'Dumbbell Reverse Lunge', muscleGroup: 'Legs', sets: 3, reps: '10 / leg', restSeconds: 60, pattern: 'lunge', dayIndex: 0, dayFocus: 'Lower Squat Strength & Zone 2 Base' },
      { id: 'hyb-d1-4', exerciseId: 'ex-zone2-run', name: 'Zone 2 Aerobic Base Run / Ruck', muscleGroup: 'Conditioning', sets: 1, reps: '25–30 min', restSeconds: 60, pattern: 'cardio_jump', dayIndex: 0, dayFocus: 'Lower Squat Strength & Zone 2 Base' },
    ],
    days: [
      {
        dayNumber: 1,
        focus: 'Lower Squat Strength & Zone 2 Base',
        recoveryNote: 'Heavy lower strength paired with low-impact aerobic base · 72h before Day 4 deadlifts',
        exercises: [
          { id: 'hyb-d1-1', exerciseId: 'ex-back-squat', name: 'Barbell Back Squat', muscleGroup: 'Legs', sets: 4, reps: '6–8', restSeconds: 120, pattern: 'squat' },
          { id: 'hyb-d1-2', exerciseId: 'ex-rdl', name: 'Romanian Deadlift', muscleGroup: 'Legs', sets: 3, reps: '8–10', restSeconds: 90, pattern: 'hinge' },
          { id: 'hyb-d1-3', exerciseId: 'ex-walking-lunge', name: 'Dumbbell Reverse Lunge', muscleGroup: 'Legs', sets: 3, reps: '10 / leg', restSeconds: 60, pattern: 'lunge' },
          { id: 'hyb-d1-4', exerciseId: 'ex-zone2-run', name: 'Zone 2 Aerobic Base Run / Ruck', muscleGroup: 'Conditioning', sets: 1, reps: '25–30 min', restSeconds: 60, pattern: 'cardio_jump' },
          { id: 'hyb-d1-5', exerciseId: 'ex-plank', name: 'Forearm RKC Plank', muscleGroup: 'Core', sets: 3, reps: '45–60s', restSeconds: 45, pattern: 'core_plank' },
        ],
      },
      {
        dayNumber: 2,
        focus: 'Upper Push/Pull Strength & Rotational Core',
        recoveryNote: 'Legs flush and recover from squats while building chest, back & shoulder strength',
        exercises: [
          { id: 'hyb-d2-1', exerciseId: 'ex-bench-press', name: 'Barbell Bench Press', muscleGroup: 'Chest', sets: 4, reps: '6–8', restSeconds: 120, pattern: 'push_horizontal' },
          { id: 'hyb-d2-2', exerciseId: 'ex-barbell-row', name: 'Bent-Over Barbell Row', muscleGroup: 'Back', sets: 4, reps: '8–10', restSeconds: 90, pattern: 'pull_horizontal' },
          { id: 'hyb-d2-3', exerciseId: 'ex-ohp', name: 'Standing Overhead Press', muscleGroup: 'Shoulders', sets: 3, reps: '6–8', restSeconds: 90, pattern: 'push_vertical' },
          { id: 'hyb-d2-4', exerciseId: 'ex-pullup', name: 'Assisted or Bodyweight Pull-Up', muscleGroup: 'Back', sets: 3, reps: '8–10', restSeconds: 90, pattern: 'pull_vertical' },
          { id: 'hyb-d2-5', exerciseId: 'ex-pallof-press', name: 'Anti-Rotation Pallof Core Press', muscleGroup: 'Core', sets: 3, reps: '10 / side', restSeconds: 45, pattern: 'core_plank' },
        ],
      },
      {
        dayNumber: 3,
        focus: 'Threshold Running & Sled/Carry Engine',
        recoveryNote: '48h after Day 1 legs · Builds VO2 threshold, sled drive & loaded carry work capacity',
        exercises: [
          { id: 'hyb-d3-1', exerciseId: 'ex-tempo-run', name: 'Threshold Run / Erg Intervals', muscleGroup: 'Conditioning', sets: 5, reps: '400m @ 85%', restSeconds: 75, pattern: 'cardio_jump' },
          { id: 'hyb-d3-2', exerciseId: 'ex-sled-push', name: 'Weighted Sled Push / Drive', muscleGroup: 'Conditioning', sets: 4, reps: '4×30m', restSeconds: 75, pattern: 'carry_swing' },
          { id: 'hyb-d3-3', exerciseId: 'ex-db-farmer-carry', name: 'Heavy Dumbbell Farmer Carry Shuttle', muscleGroup: 'Conditioning', sets: 3, reps: '4×25m Shuttle', restSeconds: 90, pattern: 'carry_swing' },
          { id: 'hyb-d3-4', exerciseId: 'ex-kb-swing', name: 'Russian Kettlebell Swing', muscleGroup: 'Conditioning', sets: 3, reps: '15–20', restSeconds: 60, pattern: 'carry_swing' },
          { id: 'hyb-d3-5', exerciseId: 'ex-dead-bug', name: 'Slow-Tempo Dead Bug', muscleGroup: 'Core', sets: 3, reps: '10 / side', restSeconds: 45, pattern: 'core_hollow' },
        ],
      },
      {
        dayNumber: 4,
        focus: 'Posterior Hinge, Upper Volume & Mobility',
        recoveryNote: '72h after Day 1 squats & 48h after Day 2 upper · Balanced hypertrophy & hip recovery',
        exercises: [
          { id: 'hyb-d4-1', exerciseId: 'ex-deadlift', name: 'Conventional Barbell Deadlift', muscleGroup: 'Back', sets: 3, reps: '5', restSeconds: 150, pattern: 'hinge' },
          { id: 'hyb-d4-2', exerciseId: 'ex-incline-db-press', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', sets: 3, reps: '8–10', restSeconds: 90, pattern: 'push_horizontal' },
          { id: 'hyb-d4-3', exerciseId: 'ex-lat-pulldown', name: 'Wide-Grip Lat Pulldown', muscleGroup: 'Back', sets: 3, reps: '10–12', restSeconds: 75, pattern: 'pull_vertical' },
          { id: 'hyb-d4-4', exerciseId: 'ex-bulgarian-split', name: 'Bulgarian Split Squat', muscleGroup: 'Legs', sets: 3, reps: '10 / leg', restSeconds: 75, pattern: 'lunge' },
          { id: 'hyb-d4-5', exerciseId: 'ex-worlds-greatest-stretch', name: 'World’s Greatest Stretch Flow', muscleGroup: 'Mobility', sets: 2, reps: '6 / side', restSeconds: 30, pattern: 'mobility_flow' },
        ],
      },
    ],
  },
  {
    id: 'prog-leo-duty-ready',
    isCustom: false,
    title: 'Law Enforcement Duty Readiness',
    category: 'Strength',
    difficulty: 'Intermediate',
    estimatedMinutes: 45,
    daysPerWeek: 4,
    description:
      '4-day tactical fitness rotation engineered for patrol & academy readiness—building subject-control push/pull strength, victim-drag sled power, pursuit sprint stamina, and duty-belt core durability.',
    imageUrl: leoImg,
    exercises: [
      { id: 'leo-d1-1', exerciseId: 'ex-aft-mdl', name: 'Hex / Trap Bar 3RM Deadlift (MDL)', muscleGroup: 'Legs', sets: 4, reps: '5', restSeconds: 120, pattern: 'hinge', dayIndex: 0, dayFocus: 'Drag Power, Trap Pull & Knee Armor' },
      { id: 'leo-d1-2', exerciseId: 'ex-sled-push', name: 'Weighted Sled Push / Drive', muscleGroup: 'Conditioning', sets: 4, reps: '4×30m', restSeconds: 75, pattern: 'carry_swing', dayIndex: 0, dayFocus: 'Drag Power, Trap Pull & Knee Armor' },
      { id: 'leo-d1-3', exerciseId: 'ex-bulgarian-split', name: 'Bulgarian Split Squat', muscleGroup: 'Legs', sets: 3, reps: '10 / leg', restSeconds: 75, pattern: 'lunge', dayIndex: 0, dayFocus: 'Drag Power, Trap Pull & Knee Armor' },
      { id: 'leo-d1-4', exerciseId: 'ex-plank', name: 'Forearm RKC Plank', muscleGroup: 'Core', sets: 3, reps: '60s', restSeconds: 45, pattern: 'core_plank', dayIndex: 0, dayFocus: 'Drag Power, Trap Pull & Knee Armor' },
    ],
    days: [
      {
        dayNumber: 1,
        focus: 'Drag Power, Trap Pull & Knee Armor',
        recoveryNote: 'Builds victim-drag hip drive & unilateral leg stability · 48–72h before pursuit intervals',
        exercises: [
          { id: 'leo-d1-1', exerciseId: 'ex-aft-mdl', name: 'Hex / Trap Bar 3RM Deadlift (MDL)', muscleGroup: 'Legs', sets: 4, reps: '5', restSeconds: 120, pattern: 'hinge' },
          { id: 'leo-d1-2', exerciseId: 'ex-sled-push', name: 'Weighted Sled Push / Drive', muscleGroup: 'Conditioning', sets: 4, reps: '4×30m', restSeconds: 75, pattern: 'carry_swing' },
          { id: 'leo-d1-3', exerciseId: 'ex-bulgarian-split', name: 'Bulgarian Split Squat', muscleGroup: 'Legs', sets: 3, reps: '10 / leg', restSeconds: 75, pattern: 'lunge' },
          { id: 'leo-d1-4', exerciseId: 'ex-plank', name: 'Forearm RKC Plank', muscleGroup: 'Core', sets: 3, reps: '60s', restSeconds: 45, pattern: 'core_plank' },
          { id: 'leo-d1-5', exerciseId: 'ex-dead-bug', name: 'Slow-Tempo Dead Bug', muscleGroup: 'Core', sets: 3, reps: '10 / side', restSeconds: 45, pattern: 'core_hollow' },
        ],
      },
      {
        dayNumber: 2,
        focus: 'Subject-Control Push/Pull & Academy PT',
        recoveryNote: 'Lower back recovers · Develops grappling upper-body strength & obstacle pull-ups',
        exercises: [
          { id: 'leo-d2-1', exerciseId: 'ex-bench-press', name: 'Barbell Bench Press', muscleGroup: 'Chest', sets: 4, reps: '6–8', restSeconds: 120, pattern: 'push_horizontal' },
          { id: 'leo-d2-2', exerciseId: 'ex-pullup', name: 'Assisted or Bodyweight Pull-Up', muscleGroup: 'Back', sets: 4, reps: '6–10', restSeconds: 90, pattern: 'pull_vertical' },
          { id: 'leo-d2-3', exerciseId: 'ex-db-row', name: 'Single-Arm Dumbbell Row', muscleGroup: 'Back', sets: 3, reps: '10 / side', restSeconds: 60, pattern: 'pull_horizontal' },
          { id: 'leo-d2-4', exerciseId: 'ex-pushup', name: 'Tempo Push-Up', muscleGroup: 'Chest', sets: 3, reps: '15–20', restSeconds: 60, pattern: 'push_horizontal' },
          { id: 'leo-d2-5', exerciseId: 'ex-pallof-press', name: 'Anti-Rotation Pallof Core Press', muscleGroup: 'Core', sets: 3, reps: '10 / side', restSeconds: 45, pattern: 'core_plank' },
        ],
      },
      {
        dayNumber: 3,
        focus: 'Pursuit Sprints, Gear Carry & Conditioning',
        recoveryNote: '48h after Day 1 legs · Simulates foot pursuit, barrier transitions & loaded carry stamina',
        exercises: [
          { id: 'leo-d3-1', exerciseId: 'ex-sandbag-carry', name: 'Bear-Hug Sandbag / Duty Drag Carry', muscleGroup: 'Conditioning', sets: 4, reps: '4×30m', restSeconds: 75, pattern: 'carry_swing' },
          { id: 'leo-d3-2', exerciseId: 'ex-tempo-run', name: 'Threshold Run / Erg Intervals', muscleGroup: 'Conditioning', sets: 4, reps: '400m @ 85%', restSeconds: 75, pattern: 'cardio_jump' },
          { id: 'leo-d3-3', exerciseId: 'ex-db-farmer-carry', name: 'Heavy Dumbbell Farmer Carry Shuttle', muscleGroup: 'Conditioning', sets: 3, reps: '4×25m Shuttle', restSeconds: 90, pattern: 'carry_swing' },
          { id: 'leo-d3-4', exerciseId: 'ex-burpee', name: 'Controlled Step-Back / Jump Burpee', muscleGroup: 'Conditioning', sets: 3, reps: '10–12', restSeconds: 45, pattern: 'cardio_jump' },
          { id: 'leo-d3-5', exerciseId: 'ex-side-plank', name: 'Forearm Side Plank Hold', muscleGroup: 'Core', sets: 3, reps: '30–45s / side', restSeconds: 30, pattern: 'core_plank' },
        ],
      },
      {
        dayNumber: 4,
        focus: 'Duty-Belt Spine Armor & Upper Endurance',
        recoveryNote: 'Shift-sustainable upper hypertrophy, posterior snap & hip decompression',
        exercises: [
          { id: 'leo-d4-1', exerciseId: 'ex-ohp', name: 'Standing Overhead Press', muscleGroup: 'Shoulders', sets: 4, reps: '6–8', restSeconds: 90, pattern: 'push_vertical' },
          { id: 'leo-d4-2', exerciseId: 'ex-lat-pulldown', name: 'Wide-Grip Lat Pulldown', muscleGroup: 'Back', sets: 3, reps: '10–12', restSeconds: 75, pattern: 'pull_vertical' },
          { id: 'leo-d4-3', exerciseId: 'ex-incline-db-press', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', sets: 3, reps: '8–10', restSeconds: 90, pattern: 'push_horizontal' },
          { id: 'leo-d4-4', exerciseId: 'ex-kb-swing', name: 'Russian Kettlebell Swing', muscleGroup: 'Conditioning', sets: 3, reps: '15–20', restSeconds: 60, pattern: 'carry_swing' },
          { id: 'leo-d4-5', exerciseId: 'ex-worlds-greatest-stretch', name: 'World’s Greatest Stretch Flow', muscleGroup: 'Mobility', sets: 2, reps: '6 / side', restSeconds: 30, pattern: 'mobility_flow' },
        ],
      },
    ],
  },
  {
    id: 'prog-athena-glute-strength',
    isCustom: false,
    title: "Athena's Forge: Glute, Lower & Core Strength",
    category: 'Strength',
    difficulty: 'Intermediate',
    estimatedMinutes: 50,
    daysPerWeek: 4,
    description:
      "4-day women's strength & physique rotation built around barbell hip thrusts, posterior-chain hinges, unilateral knee-tracking work, upper-back posture pulls, and pelvic-floor core bracing with 48–72h recovery spacing.",
    imageUrl: athenaStrengthImg,
    exercises: [
      { id: 'ath-s-d1-1', exerciseId: 'ex-barbell-hip-thrust', name: 'Barbell Hip Thrust', muscleGroup: 'Legs', sets: 4, reps: '8–10', restSeconds: 90, pattern: 'hinge', dayIndex: 0, dayFocus: 'Hip Thrust Power & Glute Shelf' },
      { id: 'ath-s-d1-2', exerciseId: 'ex-rdl', name: 'Romanian Deadlift', muscleGroup: 'Legs', sets: 3, reps: '8–10', restSeconds: 90, pattern: 'hinge', dayIndex: 0, dayFocus: 'Hip Thrust Power & Glute Shelf' },
      { id: 'ath-s-d1-3', exerciseId: 'ex-bulgarian-split', name: 'Bulgarian Split Squat', muscleGroup: 'Legs', sets: 3, reps: '10 / leg', restSeconds: 75, pattern: 'lunge', dayIndex: 0, dayFocus: 'Hip Thrust Power & Glute Shelf' },
      { id: 'ath-s-d1-4', exerciseId: 'ex-banded-abduction', name: 'Banded Lateral Walk & Clamshell', muscleGroup: 'Legs', sets: 3, reps: '15 / side', restSeconds: 45, pattern: 'lunge', dayIndex: 0, dayFocus: 'Hip Thrust Power & Glute Shelf' },
    ],
    days: [
      {
        dayNumber: 1,
        focus: 'Hip Thrust Power & Glute Shelf',
        recoveryNote: 'Targets glute max, hamstrings & medius · 48–72h before Day 3 squats',
        exercises: [
          { id: 'ath-s-d1-1', exerciseId: 'ex-barbell-hip-thrust', name: 'Barbell Hip Thrust', muscleGroup: 'Legs', sets: 4, reps: '8–10', restSeconds: 90, pattern: 'hinge' },
          { id: 'ath-s-d1-2', exerciseId: 'ex-rdl', name: 'Romanian Deadlift', muscleGroup: 'Legs', sets: 3, reps: '8–10', restSeconds: 90, pattern: 'hinge' },
          { id: 'ath-s-d1-3', exerciseId: 'ex-bulgarian-split', name: 'Bulgarian Split Squat', muscleGroup: 'Legs', sets: 3, reps: '10 / leg', restSeconds: 75, pattern: 'lunge' },
          { id: 'ath-s-d1-4', exerciseId: 'ex-banded-abduction', name: 'Banded Lateral Walk & Clamshell', muscleGroup: 'Legs', sets: 3, reps: '15 / side', restSeconds: 45, pattern: 'lunge' },
          { id: 'ath-s-d1-5', exerciseId: 'ex-dead-bug', name: 'Slow-Tempo Dead Bug', muscleGroup: 'Core', sets: 3, reps: '10 / side', restSeconds: 45, pattern: 'core_hollow' },
        ],
      },
      {
        dayNumber: 2,
        focus: 'Posture Back, Sculpted Delts & Push',
        recoveryNote: 'Lower body recovers · Builds upper-back definition, shoulder caps & anti-rotation core',
        exercises: [
          { id: 'ath-s-d2-1', exerciseId: 'ex-lat-pulldown', name: 'Wide-Grip Lat Pulldown', muscleGroup: 'Back', sets: 4, reps: '10–12', restSeconds: 75, pattern: 'pull_vertical' },
          { id: 'ath-s-d2-2', exerciseId: 'ex-incline-db-press', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', sets: 3, reps: '8–10', restSeconds: 90, pattern: 'push_horizontal' },
          { id: 'ath-s-d2-3', exerciseId: 'ex-face-pull', name: 'Cable or Band Face Pull', muscleGroup: 'Back', sets: 3, reps: '12–15', restSeconds: 60, pattern: 'pull_horizontal' },
          { id: 'ath-s-d2-4', exerciseId: 'ex-lateral-raise', name: 'Dumbbell Lateral Raise', muscleGroup: 'Shoulders', sets: 4, reps: '12–15', restSeconds: 60, pattern: 'curl_raise' },
          { id: 'ath-s-d2-5', exerciseId: 'ex-pallof-press', name: 'Anti-Rotation Pallof Core Press', muscleGroup: 'Core', sets: 3, reps: '10 / side', restSeconds: 45, pattern: 'core_plank' },
        ],
      },
      {
        dayNumber: 3,
        focus: 'Sumo Squat, Unilateral & Pelvic Core',
        recoveryNote: '48–72h after Day 1 hip thrusts · Knee-friendly quad, adductor & single-leg strength',
        exercises: [
          { id: 'ath-s-d3-1', exerciseId: 'ex-back-squat', name: 'Barbell Back Squat', muscleGroup: 'Legs', sets: 4, reps: '6–8', restSeconds: 120, pattern: 'squat' },
          { id: 'ath-s-d3-2', exerciseId: 'ex-sumo-rdl', name: 'Dumbbell Sumo Squat', muscleGroup: 'Legs', sets: 3, reps: '10–12', restSeconds: 75, pattern: 'squat' },
          { id: 'ath-s-d3-3', exerciseId: 'ex-walking-lunge', name: 'Dumbbell Reverse Lunge', muscleGroup: 'Legs', sets: 3, reps: '10 / leg', restSeconds: 60, pattern: 'lunge' },
          { id: 'ath-s-d3-4', exerciseId: 'ex-glute-bridge', name: 'Weighted or Single-Leg Glute Bridge', muscleGroup: 'Legs', sets: 3, reps: '12–15', restSeconds: 60, pattern: 'hinge' },
          { id: 'ath-s-d3-5', exerciseId: 'ex-bird-dog', name: 'Slow-Tempo Bird Dog & Pelvic Brace', muscleGroup: 'Core', sets: 3, reps: '10 / side', restSeconds: 45, pattern: 'core_plank' },
        ],
      },
      {
        dayNumber: 4,
        focus: 'Upper Pull, Overhead Tone & Hip Flow',
        recoveryNote: '48h after Day 2 upper · Balanced arms, overhead poise & hip-capsule decompression',
        exercises: [
          { id: 'ath-s-d4-1', exerciseId: 'ex-db-row', name: 'Single-Arm Dumbbell Row', muscleGroup: 'Back', sets: 4, reps: '10 / side', restSeconds: 60, pattern: 'pull_horizontal' },
          { id: 'ath-s-d4-2', exerciseId: 'ex-db-shoulder-press', name: 'Seated Dumbbell Shoulder Press', muscleGroup: 'Shoulders', sets: 3, reps: '10–12', restSeconds: 75, pattern: 'push_vertical' },
          { id: 'ath-s-d4-3', exerciseId: 'ex-pullup', name: 'Assisted or Bodyweight Pull-Up', muscleGroup: 'Back', sets: 3, reps: '6–10', restSeconds: 90, pattern: 'pull_vertical' },
          { id: 'ath-s-d4-4', exerciseId: 'ex-bicep-curl', name: 'Dumbbell Hammer / Supinated Curl', muscleGroup: 'Arms', sets: 3, reps: '10–12', restSeconds: 60, pattern: 'curl_raise' },
          { id: 'ath-s-d4-5', exerciseId: 'ex-90-90-hip', name: '90/90 Hip Switch Flow', muscleGroup: 'Mobility', sets: 2, reps: '10 switches', restSeconds: 30, pattern: 'mobility_flow' },
        ],
      },
    ],
  },
  {
    id: 'prog-athena-athletic-sculpt',
    isCustom: false,
    title: "Athena's Forge: Athletic Sculpt & Engine",
    category: 'Hypertrophy',
    difficulty: 'Beginner',
    estimatedMinutes: 45,
    daysPerWeek: 4,
    description:
      "4-day women's dumbbell & athletic sculpting split pairing glute bridges, step-ups, toned upper-body posture circuits, low-impact kettlebell & sled conditioning, and thoracic/hip mobility.",
    imageUrl: athenaSculptImg,
    exercises: [
      { id: 'ath-c-d1-1', exerciseId: 'ex-glute-bridge', name: 'Weighted or Single-Leg Glute Bridge', muscleGroup: 'Legs', sets: 4, reps: '12–15', restSeconds: 60, pattern: 'hinge', dayIndex: 0, dayFocus: 'Lower Sculpt, Step-Ups & Glute Burn' },
      { id: 'ath-c-d1-2', exerciseId: 'ex-goblet-squat', name: 'Dumbbell Goblet Squat', muscleGroup: 'Legs', sets: 3, reps: '10–12', restSeconds: 75, pattern: 'squat', dayIndex: 0, dayFocus: 'Lower Sculpt, Step-Ups & Glute Burn' },
      { id: 'ath-c-d1-3', exerciseId: 'ex-step-up', name: 'Alternating Step-Up', muscleGroup: 'Legs', sets: 3, reps: '10 / leg', restSeconds: 60, pattern: 'lunge', dayIndex: 0, dayFocus: 'Lower Sculpt, Step-Ups & Glute Burn' },
      { id: 'ath-c-d1-4', exerciseId: 'ex-banded-abduction', name: 'Banded Lateral Walk & Clamshell', muscleGroup: 'Legs', sets: 3, reps: '15 / side', restSeconds: 45, pattern: 'lunge', dayIndex: 0, dayFocus: 'Lower Sculpt, Step-Ups & Glute Burn' },
    ],
    days: [
      {
        dayNumber: 1,
        focus: 'Lower Sculpt, Step-Ups & Glute Burn',
        recoveryNote: 'Knee-friendly glute & quad shaping · 48h before Day 3 athletic engine',
        exercises: [
          { id: 'ath-c-d1-1', exerciseId: 'ex-glute-bridge', name: 'Weighted or Single-Leg Glute Bridge', muscleGroup: 'Legs', sets: 4, reps: '12–15', restSeconds: 60, pattern: 'hinge' },
          { id: 'ath-c-d1-2', exerciseId: 'ex-goblet-squat', name: 'Dumbbell Goblet Squat', muscleGroup: 'Legs', sets: 3, reps: '10–12', restSeconds: 75, pattern: 'squat' },
          { id: 'ath-c-d1-3', exerciseId: 'ex-step-up', name: 'Alternating Step-Up', muscleGroup: 'Legs', sets: 3, reps: '10 / leg', restSeconds: 60, pattern: 'lunge' },
          { id: 'ath-c-d1-4', exerciseId: 'ex-banded-abduction', name: 'Banded Lateral Walk & Clamshell', muscleGroup: 'Legs', sets: 3, reps: '15 / side', restSeconds: 45, pattern: 'lunge' },
          { id: 'ath-c-d1-5', exerciseId: 'ex-plank', name: 'Forearm RKC Plank', muscleGroup: 'Core', sets: 3, reps: '45s', restSeconds: 45, pattern: 'core_plank' },
        ],
      },
      {
        dayNumber: 2,
        focus: 'Upper Tone: Back, Delts & Arms',
        recoveryNote: 'Legs rest while sculpting upper back, shoulders, triceps & posture',
        exercises: [
          { id: 'ath-c-d2-1', exerciseId: 'ex-db-row', name: 'Single-Arm Dumbbell Row', muscleGroup: 'Back', sets: 3, reps: '10 / side', restSeconds: 60, pattern: 'pull_horizontal' },
          { id: 'ath-c-d2-2', exerciseId: 'ex-db-shoulder-press', name: 'Seated Dumbbell Shoulder Press', muscleGroup: 'Shoulders', sets: 3, reps: '10–12', restSeconds: 75, pattern: 'push_vertical' },
          { id: 'ath-c-d2-3', exerciseId: 'ex-face-pull', name: 'Cable or Band Face Pull', muscleGroup: 'Back', sets: 3, reps: '12–15', restSeconds: 60, pattern: 'pull_horizontal' },
          { id: 'ath-c-d2-4', exerciseId: 'ex-lateral-raise', name: 'Dumbbell Lateral Raise', muscleGroup: 'Shoulders', sets: 3, reps: '12–15', restSeconds: 60, pattern: 'curl_raise' },
          { id: 'ath-c-d2-5', exerciseId: 'ex-tricep-dip', name: 'Bench / Chair Tricep Dip', muscleGroup: 'Arms', sets: 3, reps: '10–15', restSeconds: 60, pattern: 'curl_raise' },
        ],
      },
      {
        dayNumber: 3,
        focus: 'Athletic Engine & Posterior Snap',
        recoveryNote: 'Low-impact metabolic power & hip drive · 48h after Day 1 lower sculpt',
        exercises: [
          { id: 'ath-c-d3-1', exerciseId: 'ex-kb-swing', name: 'Russian Kettlebell Swing', muscleGroup: 'Conditioning', sets: 4, reps: '15–20', restSeconds: 60, pattern: 'carry_swing' },
          { id: 'ath-c-d3-2', exerciseId: 'ex-walking-lunge', name: 'Dumbbell Reverse Lunge', muscleGroup: 'Legs', sets: 3, reps: '10 / leg', restSeconds: 60, pattern: 'lunge' },
          { id: 'ath-c-d3-3', exerciseId: 'ex-sled-push', name: 'Weighted Sled Push / Drive', muscleGroup: 'Conditioning', sets: 3, reps: '4×30m', restSeconds: 75, pattern: 'carry_swing' },
          { id: 'ath-c-d3-4', exerciseId: 'ex-pushup', name: 'Tempo Push-Up', muscleGroup: 'Chest', sets: 3, reps: '10–15', restSeconds: 60, pattern: 'push_horizontal' },
          { id: 'ath-c-d3-5', exerciseId: 'ex-side-plank', name: 'Forearm Side Plank Hold', muscleGroup: 'Core', sets: 3, reps: '30–45s / side', restSeconds: 30, pattern: 'core_plank' },
        ],
      },
      {
        dayNumber: 4,
        focus: 'Single-Leg Hinge, Deep Core & Mobility',
        recoveryNote: 'Posterior balance, pelvic-floor control & full-body hip/thoracic flow',
        exercises: [
          { id: 'ath-c-d4-1', exerciseId: 'ex-single-leg-rdl', name: 'Single-Leg Romanian Deadlift', muscleGroup: 'Legs', sets: 3, reps: '10 / leg', restSeconds: 60, pattern: 'hinge' },
          { id: 'ath-c-d4-2', exerciseId: 'ex-sumo-rdl', name: 'Dumbbell Sumo Squat', muscleGroup: 'Legs', sets: 3, reps: '10–12', restSeconds: 75, pattern: 'squat' },
          { id: 'ath-c-d4-3', exerciseId: 'ex-lat-pulldown', name: 'Wide-Grip Lat Pulldown', muscleGroup: 'Back', sets: 3, reps: '10–12', restSeconds: 75, pattern: 'pull_vertical' },
          { id: 'ath-c-d4-4', exerciseId: 'ex-dead-bug', name: 'Slow-Tempo Dead Bug', muscleGroup: 'Core', sets: 3, reps: '10 / side', restSeconds: 45, pattern: 'core_hollow' },
          { id: 'ath-c-d4-5', exerciseId: 'ex-worlds-greatest-stretch', name: 'World’s Greatest Stretch Flow', muscleGroup: 'Mobility', sets: 2, reps: '6 / side', restSeconds: 30, pattern: 'mobility_flow' },
        ],
      },
    ],
  },
];

export function getProgramDays(program: WorkoutProgram): ProgramDay[] {
  if (program.days && program.days.length > 0) {
    return program.days;
  }

  const grouped = new Map<number, ProgramExercise[]>();
  for (const ex of program.exercises) {
    const idx = typeof ex.dayIndex === 'number' && ex.dayIndex >= 0 ? Math.floor(ex.dayIndex) : 0;
    const list = grouped.get(idx) || [];
    list.push(ex);
    grouped.set(idx, list);
  }

  if (grouped.size === 0) {
    return [
      {
        dayNumber: 1,
        focus: 'Full Session',
        recoveryNote: '48h recovery between overlapping muscle groups',
        exercises: [],
      },
    ];
  }

  const sortedIndices = Array.from(grouped.keys()).sort((a, b) => a - b);
  return sortedIndices.map((dayIdx, position) => {
    const dayExercises = grouped.get(dayIdx) || [];
    const customFocus = dayExercises.find((e) => e.dayFocus?.trim())?.dayFocus?.trim();
    const muscles = Array.from(new Set(dayExercises.map((e) => e.muscleGroup))).slice(0, 3);
    const defaultFocus =
      sortedIndices.length > 1
        ? muscles.length > 0
          ? muscles.join(' & ')
          : `Day ${position + 1} Focus`
        : muscles.length > 0
        ? muscles.join(' & ')
        : 'Full Session';

    return {
      dayNumber: position + 1,
      focus: customFocus || defaultFocus,
      recoveryNote:
        muscles.length > 0
          ? `Targets ${muscles.join(', ').toLowerCase()} · Rest 48h before repeating`
          : 'Rest 48h before repeating the same muscle groups',
      exercises: dayExercises,
    };
  });
}

function makeExFromLib(
  idPrefix: string,
  libId: string,
  setsOverride?: number,
  repsOverride?: string,
  restOverride?: number
): ProgramExercise {
  const item = EXERCISE_LIBRARY.find((e) => e.id === libId) || EXERCISE_LIBRARY[0];
  return {
    id: `${idPrefix}-${libId}`,
    exerciseId: item.id,
    name: item.name,
    muscleGroup: item.muscleGroup,
    sets: setsOverride ?? item.defaultSets,
    reps: repsOverride ?? item.defaultReps,
    restSeconds: restOverride ?? item.defaultRestSeconds,
    pattern: item.pattern,
  };
}

function buildExtraRotationDay(
  program: WorkoutProgram,
  dayNumber: number,
  experience: ExperienceLevel
): ProgramDay {
  const isAft = program.id.startsWith('prog-aft');
  const isHybrid = program.id.startsWith('prog-hybrid');
  const isLeo = program.id.startsWith('prog-leo');
  const isAthena = program.id.startsWith('prog-athena');
  const isMobility = program.category === 'Mobility';
  const isConditioning = program.category === 'Conditioning' && !isAft && !isHybrid;

  if (isAthena) {
    if (dayNumber === 5) {
      return {
        dayNumber,
        focus: 'Upper Posture, Delts & Low-Impact Conditioning',
        recoveryNote: '48h after Day 3 lower work · Sculpts shoulders/arms with joint-friendly conditioning',
        exercises: [
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-face-pull', 3, '12–15', 60),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-lateral-raise', 3, '12–15', 60),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-bicep-curl', 3, '10–12', 60),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-tricep-dip', 3, '10–15', 60),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-battle-ropes', 4, '30s', 45),
        ],
      };
    }
    if (dayNumber === 6) {
      return {
        dayNumber,
        focus: 'Glute Medius, Posterior Power & Deep Core',
        recoveryNote: '48–72h after heavy Day 1/3 · Unilateral balance, glute shaping & pelvic stability',
        exercises: [
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-barbell-hip-thrust', 4, '8–10', 90),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-step-up', 3, '10 / leg', 60),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-banded-abduction', 3, '15 / side', 45),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-kb-swing', 3, '15', 60),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-side-plank', 3, '35s / side', 30),
        ],
      };
    }
    return {
      dayNumber,
      focus: 'Pelvic Core Restore & Hip Mobility Flow',
      recoveryNote: 'Restorative mobility & diaphragmatic core control before Day 1 restarts',
      exercises: [
        makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-90-90-hip', 3, '10 switches', 30),
        makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-thoracic-flow', 3, '8 / side', 30),
        makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-bird-dog', 3, '10 / side', 45),
        makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-dead-bug', 3, '10 / side', 45),
      ],
    };
  }

  if (isHybrid) {
    if (dayNumber === 5) {
      return {
        dayNumber,
        focus: 'Upper Hypertrophy, Grip & Aerobic Flush',
        recoveryNote: '48h after Day 3 engine · Builds arm/shoulder armor & steady aerobic output',
        exercises: [
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-db-shoulder-press', 3, '10–12', 75),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-db-row', 3, '10 / side', 60),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-lateral-raise', 3, '12–15', 60),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-bicep-curl', 3, '10–12', 60),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-zone2-run', 1, '25 min', 60),
        ],
      };
    }
    if (dayNumber === 6) {
      return {
        dayNumber,
        focus: 'Explosive Power, Plyo & Carry Density',
        recoveryNote: '48h after Day 4 deadlifts · Athletic sprint power and loaded trunk work',
        exercises: [
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-box-jump', 4, '8', 60),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-sandbag-carry', 4, '4×30m', 75),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-battle-ropes', 4, '30s', 45),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-walking-lunge', 3, '10 / leg', 60),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-side-plank', 3, '35s / side', 30),
        ],
      };
    }
    return {
      dayNumber,
      focus: 'Zone 2 Recovery, Hip Capsule & Core Restore',
      recoveryNote: 'Low-impact flush keeping joints supple before Day 1 squats restart',
      exercises: [
        makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-thoracic-flow', 3, '8 / side', 30),
        makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-90-90-hip', 3, '10 switches', 30),
        makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-zone2-run', 1, '25–30 min', 60),
        makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-dead-bug', 3, '10 / side', 45),
      ],
    };
  }

  if (isLeo) {
    if (dayNumber === 5) {
      return {
        dayNumber,
        focus: 'Patrol Endurance, Wall Climb & Grip',
        recoveryNote: 'Builds pull-up/grip staying power & sustained cardio pace without lower overload',
        exercises: [
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-pullup', 3, 'Max Strict', 90),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-zone2-run', 1, '25–30 min', 60),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-db-farmer-carry', 3, '4×25m Shuttle', 75),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-bicep-curl', 3, '10–12', 60),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-pallof-press', 3, '10 / side', 45),
        ],
      };
    }
    if (dayNumber === 6) {
      return {
        dayNumber,
        focus: 'Tactical Power, Barrier Jump & Shuttle',
        recoveryNote: '48h after heavy Day 1 & Day 4 · Explosive sprint-barrier transition work',
        exercises: [
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-box-jump', 4, '8', 60),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-sled-push', 4, '4×30m', 75),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-rdl', 3, '8–10', 90),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-mountain-climber', 4, '30s / 15s', 45),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-plank', 3, '60s', 45),
        ],
      };
    }
    return {
      dayNumber,
      focus: 'Duty-Belt Decompression & Shift Mobility',
      recoveryNote: 'Relieves vest & belt hip/lumbar tightness so readiness stays peak all week',
      exercises: [
        makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-thoracic-flow', 3, '8 / side', 30),
        makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-90-90-hip', 3, '10 switches', 30),
        makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-worlds-greatest-stretch', 2, '6 / side', 30),
        makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-dead-bug', 3, '10 / side', 45),
      ],
    };
  }

  if (isAft) {
    if (dayNumber === 4) {
      return {
        dayNumber,
        focus: '2-Mile Run Pacing & Upper Pull',
        recoveryNote: 'Aerobic 2MR intervals + upper back balance · Legs recover from heavy pulls',
        exercises: [
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-aft-2mr', 4, '800m @ Goal Pace', 90),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-pullup', 3, '8–10', 90),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-aft-hrp', 3, 'Max in 60s', 60),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-lateral-raise', 3, '12–15', 60),
        ],
      };
    }
    if (dayNumber === 5) {
      return {
        dayNumber,
        focus: 'Grip, Carry Stamina & Shoulder Armor',
        recoveryNote: 'Builds 40 lb KB carry grip & overhead stability while spinal erectors recover',
        exercises: [
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-kb-swing', 4, '15–20', 60),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-db-shoulder-press', 4, '10–12', 75),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-db-row', 3, '10 / side', 60),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-bicep-curl', 3, '12', 60),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-dead-bug', 3, '10 / side', 45),
        ],
      };
    }
    if (dayNumber === 6) {
      return {
        dayNumber,
        focus: 'AFT Event Transition & Posterior Speed',
        recoveryNote: 'High-speed shuttle & posterior conditioning · Rest 48h before Day 1 MDL',
        exercises: [
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-aft-sdc', 3, '250m Shuttle', 120),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-rdl', 3, '8–10', 90),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-box-jump', 3, '8–10', 60),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-aft-plank', 3, '120s', 60),
        ],
      };
    }
    return {
      dayNumber,
      focus: 'Aerobic Flush, Core & Joint Restore',
      recoveryNote: 'Low-impact recovery session keeping blood flow high before Day 1 resets',
      exercises: [
        makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-thoracic-flow', 3, '8 / side', 30),
        makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-90-90-hip', 3, '10 switches', 30),
        makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-dead-bug', 3, '10 / side', 45),
        makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-aft-2mr', 2, '800m Easy Zone 2', 60),
      ],
    };
  }

  if (isMobility) {
    const mobilityTemplates: ProgramDay[] = [
      {
        dayNumber,
        focus: 'Posterior Mobility & Spine Decompression',
        recoveryNote: 'Gentle hamstring & thoracic flow supporting heavy lifting days',
        exercises: [
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-thoracic-flow', 3, '8 / side', 30),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-90-90-hip', 3, '10 switches', 30),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-plank', 3, '45s', 45),
        ],
      },
      {
        dayNumber,
        focus: 'Single-Leg Balance & Deep Core',
        recoveryNote: 'Low-fatigue unilateral knee/hip alignment + core control',
        exercises: [
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-walking-lunge', 3, '10 / leg', 45),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-dead-bug', 3, '12 / side', 45),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-goblet-squat', 2, '10 slow', 60),
        ],
      },
      {
        dayNumber,
        focus: 'Shoulder Mechanics & Core Endurance',
        recoveryNote: 'Scapular control and isometric trunk stability',
        exercises: [
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-thoracic-flow', 3, '8 / side', 30),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-pushup', 2, '10 controlled', 45),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-plank', 3, '60s', 45),
        ],
      },
    ];
    return mobilityTemplates[(dayNumber - 4) % mobilityTemplates.length];
  }

  if (isConditioning) {
    const condTemplates: ProgramDay[] = [
      {
        dayNumber,
        focus: 'Aerobic Threshold & Core Stamina',
        recoveryNote: 'Low-impact metabolic work sparing heavy knee flexion for 48h',
        exercises: [
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-battle-ropes', 4, '35s', 45),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-kb-swing', 4, '15', 60),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-dead-bug', 3, '12 / side', 30),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-plank', 3, '50s', 45),
        ],
      },
      {
        dayNumber,
        focus: 'Full-Body Athletic Conditioning',
        recoveryNote: 'Alternates push/pull/hinge patterns to maximize output without localized burn-out',
        exercises: [
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-burpee', 4, '12', 45),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-db-row', 3, '12 / side', 45),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-goblet-squat', 3, '12–15', 60),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-pushup', 3, '12–15', 45),
        ],
      },
      {
        dayNumber,
        focus: 'Active Recovery Mobility & Zone 2 Core',
        recoveryNote: 'Joint decompression and deep core endurance before next 7-day cycle',
        exercises: [
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-90-90-hip', 3, '10 switches', 30),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-thoracic-flow', 3, '8 / side', 30),
          makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-plank', 3, '60s', 45),
        ],
      },
    ];
    return condTemplates[(dayNumber - 4) % condTemplates.length];
  }

  // Hypertrophy / Strength / Custom extended days (Day 4..7) with strict 48-72h muscle-group spacing
  if (dayNumber === 4) {
    return {
      dayNumber,
      focus: 'Lower Posterior, Hinge & Core',
      recoveryNote: '72h after quad work · Targets hamstrings, glutes & spinal bracing',
      exercises: [
        makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-rdl', 4, '8–10', 90),
        makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-walking-lunge', 3, '10 / leg', 60),
        makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-kb-swing', 3, '15', 60),
        makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-dead-bug', 3, '10 / side', 45),
      ],
    };
  }
  if (dayNumber === 5) {
    return {
      dayNumber,
      focus: 'Push Hypertrophy: Chest, Delts & Arms',
      recoveryNote: 'Focused upper-push & arm volume while legs & lower back fully recover',
      exercises: [
        makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-incline-db-press', 4, '8–12', 90),
        makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-ohp', 3, '8–10', 90),
        makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-lateral-raise', 4, '12–15', 60),
        makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-pushup', 3, '12–15', 60),
        makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-bicep-curl', 3, '10–12', 60),
      ],
    };
  }
  if (dayNumber === 6) {
    return {
      dayNumber,
      focus: 'Pull Density, Posterior & Unilateral Legs',
      recoveryNote: '48–72h after Push/Squat · Builds lats, upper back & single-leg hypertrophy',
      exercises: [
        makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-barbell-row', 4, '8–10', 90),
        makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-lat-pulldown', 3, '10–12', 75),
        makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-bulgarian-split', 3, '10 / leg', 75),
        makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-bicep-curl', 3, '12', 60),
        makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-plank', 3, '45–60s', 45),
      ],
    };
  }
  return {
    dayNumber,
    focus:
      experience === 'Advanced'
        ? 'Weak-Point Conditioning, Mobility & Core'
        : 'Active Recovery Mobility & Core Restore',
    recoveryNote: 'Low-joint-stress flush so muscles repair and grow before Day 1 restarts',
    exercises: [
      makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-thoracic-flow', 3, '8 / side', 30),
      makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-90-90-hip', 3, '10 switches', 30),
      makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-dead-bug', 3, '10 / side', 45),
      makeExFromLib(`ext-${program.id}-d${dayNumber}`, 'ex-plank', 3, '45–60s', 45),
    ],
  };
}

function adaptExerciseForExperience(
  ex: ProgramExercise,
  program: WorkoutProgram,
  experience: ExperienceLevel,
  targetMinutes: WorkoutDurationOption,
  isPrimaryLift: boolean
): ProgramExercise {
  const isAft = program.id.startsWith('prog-aft');
  const isMobility = program.category === 'Mobility';
  let adapted = { ...ex };

  if (experience === 'Beginner') {
    // Swap highly technical barbell/unilateral lifts for foundational variations outside specific AFT test events
    if (!isAft) {
      if (adapted.exerciseId === 'ex-deadlift') {
        const rdl = EXERCISE_LIBRARY.find((e) => e.id === 'ex-rdl');
        if (rdl) adapted = { ...adapted, exerciseId: rdl.id, name: rdl.name, pattern: rdl.pattern };
      } else if (adapted.exerciseId === 'ex-back-squat') {
        const goblet = EXERCISE_LIBRARY.find((e) => e.id === 'ex-goblet-squat');
        if (goblet) adapted = { ...adapted, exerciseId: goblet.id, name: goblet.name, pattern: goblet.pattern };
      } else if (adapted.exerciseId === 'ex-pullup') {
        const pulldown = EXERCISE_LIBRARY.find((e) => e.id === 'ex-lat-pulldown');
        if (pulldown) adapted = { ...adapted, exerciseId: pulldown.id, name: pulldown.name, pattern: pulldown.pattern };
      } else if (adapted.exerciseId === 'ex-bulgarian-split') {
        const rev = EXERCISE_LIBRARY.find((e) => e.id === 'ex-walking-lunge');
        if (rev) adapted = { ...adapted, exerciseId: rev.id, name: rev.name, pattern: rev.pattern };
      } else if (adapted.exerciseId === 'ex-barbell-hip-thrust') {
        const bridge = EXERCISE_LIBRARY.find((e) => e.id === 'ex-glute-bridge');
        if (bridge) adapted = { ...adapted, exerciseId: bridge.id, name: bridge.name, pattern: bridge.pattern };
      }
    } else {
      if (adapted.exerciseId === 'ex-aft-hrp') adapted.reps = '15–20';
      if (adapted.exerciseId === 'ex-aft-plank') adapted.reps = '60–90s';
      if (adapted.exerciseId === 'ex-aft-mdl') adapted.reps = '3–5 (Form Focus)';
    }
    adapted.sets = Math.max(2, Math.min(3, adapted.sets - 1));
    if (!/min|m\b|s\b|shuttle|pace|switch/i.test(adapted.reps) && !isAft) {
      adapted.reps = '10–12';
    }
  } else if (experience === 'Advanced') {
    if (!isAft && !isMobility) {
      if (adapted.exerciseId === 'ex-goblet-squat') {
        const squat = EXERCISE_LIBRARY.find((e) => e.id === 'ex-back-squat');
        if (squat) adapted = { ...adapted, exerciseId: squat.id, name: squat.name, pattern: squat.pattern };
      } else if (adapted.exerciseId === 'ex-pushup' && adapted.muscleGroup === 'Chest') {
        const incline = EXERCISE_LIBRARY.find((e) => e.id === 'ex-incline-db-press');
        if (incline) adapted = { ...adapted, exerciseId: incline.id, name: incline.name, pattern: incline.pattern };
      } else if (adapted.exerciseId === 'ex-glute-bridge' && program.id.startsWith('prog-athena')) {
        const thrust = EXERCISE_LIBRARY.find((e) => e.id === 'ex-barbell-hip-thrust');
        if (thrust) adapted = { ...adapted, exerciseId: thrust.id, name: thrust.name, pattern: thrust.pattern };
      }
    } else if (isAft) {
      if (adapted.exerciseId === 'ex-aft-hrp') adapted.reps = '35–50';
      if (adapted.exerciseId === 'ex-aft-plank') adapted.reps = '150–210s';
      if (adapted.exerciseId === 'ex-aft-mdl') adapted.reps = '3 (Heavy 3RM)';
    }
    adapted.sets = Math.min(6, isPrimaryLift ? adapted.sets + 1 : adapted.sets);
  }

  // Duration adjustments on sets & rest
  if (targetMinutes === 30) {
    adapted.sets = Math.max(2, adapted.sets - (experience === 'Advanced' ? 0 : 1));
    adapted.restSeconds = Math.max(30, Math.round((adapted.restSeconds * 0.75) / 5) * 5);
  } else if (targetMinutes === 60) {
    if (isPrimaryLift && experience !== 'Beginner') {
      adapted.sets = Math.min(6, adapted.sets + 1);
    }
  }

  return adapted;
}

const DURATION_COMPLEMENTARY_POOL: Record<string, string[]> = {
  Legs: ['ex-rdl', 'ex-bulgarian-split', 'ex-walking-lunge', 'ex-plank'],
  Chest: ['ex-incline-db-press', 'ex-lateral-raise', 'ex-pushup', 'ex-dead-bug'],
  Back: ['ex-db-row', 'ex-lat-pulldown', 'ex-bicep-curl', 'ex-plank'],
  Shoulders: ['ex-lateral-raise', 'ex-db-shoulder-press', 'ex-bicep-curl', 'ex-dead-bug'],
  Arms: ['ex-bicep-curl', 'ex-lateral-raise', 'ex-dead-bug'],
  Core: ['ex-dead-bug', 'ex-plank', 'ex-thoracic-flow'],
  Conditioning: ['ex-kb-swing', 'ex-battle-ropes', 'ex-burpee', 'ex-plank'],
  Mobility: ['ex-thoracic-flow', 'ex-90-90-hip', 'ex-dead-bug'],
};

export function adaptProgramForUser(
  program: WorkoutProgram,
  options: {
    rotationDays?: RotationDays;
    targetMinutes?: WorkoutDurationOption;
    experienceLevel: ExperienceLevel;
    exerciseSwaps?: Record<string, string>;
  }
): {
  rotationDays: RotationDays;
  targetMinutes: WorkoutDurationOption;
  days: ProgramDay[];
} {
  const defaultRot = Math.min(7, Math.max(3, program.daysPerWeek || 4)) as RotationDays;
  const rotationDays = options.rotationDays ?? defaultRot;
  const defaultMin: WorkoutDurationOption =
    program.estimatedMinutes <= 35 ? 30 : program.estimatedMinutes >= 55 ? 60 : 45;
  const targetMinutes: WorkoutDurationOption = options.targetMinutes ?? defaultMin;
  const exp = options.experienceLevel;
  const swaps = options.exerciseSwaps || {};

  const baseDays = getProgramDays(program);
  let rawDays: ProgramDay[];

  if (rotationDays <= baseDays.length) {
    rawDays = baseDays.slice(0, rotationDays).map((d, idx) => ({
      ...d,
      dayNumber: idx + 1,
      exercises: d.exercises.map((e) => ({ ...e })),
    }));
  } else {
    rawDays = baseDays.map((d, idx) => ({
      ...d,
      dayNumber: idx + 1,
      exercises: d.exercises.map((e) => ({ ...e })),
    }));
    for (let dNum = baseDays.length + 1; dNum <= rotationDays; dNum++) {
      rawDays.push(buildExtraRotationDay(program, dNum, exp));
    }
  }

  const desiredExCount = targetMinutes === 30 ? 3 : targetMinutes === 45 ? 4 : 5;
  const expSummary =
    exp === 'Beginner'
      ? 'Beginner form & recovery pace (RPE 7)'
      : exp === 'Advanced'
      ? 'Advanced overload intensity (RPE 9)'
      : 'Intermediate progressive overload (RPE 8)';

  const adaptedDays: ProgramDay[] = rawDays.map((day) => {
    let dayExercises = day.exercises.map((e, i) => ({
      ...e,
      id: `${e.id}-d${day.dayNumber}-${i}`,
    }));

    if (dayExercises.length > desiredExCount) {
      dayExercises = dayExercises.slice(0, desiredExCount);
    } else if (dayExercises.length < desiredExCount) {
      const primaryMuscle = dayExercises[0]?.muscleGroup || 'Legs';
      const candidates = [
        ...(DURATION_COMPLEMENTARY_POOL[primaryMuscle] || []),
        'ex-plank',
        'ex-dead-bug',
        'ex-thoracic-flow',
      ];
      for (const libId of candidates) {
        if (dayExercises.length >= desiredExCount) break;
        const alreadyHas = dayExercises.some((e) => e.exerciseId === libId);
        if (!alreadyHas) {
          dayExercises.push(makeExFromLib(`dur-${program.id}-d${day.dayNumber}`, libId));
        }
      }
    }

    const tunedExercises = dayExercises.map((rawEx, idx) => {
      const tuned = adaptExerciseForExperience(rawEx, program, exp, targetMinutes, idx < 2);
      const currentKey = tuned.exerciseId || rawEx.exerciseId || rawEx.id;
      const libMatch = EXERCISE_LIBRARY.find((e) => e.id === currentKey);
      const baseEquipment = tuned.equipment || libMatch?.equipment;

      const swapTargetId =
        swaps[currentKey] || (rawEx.exerciseId ? swaps[rawEx.exerciseId] : undefined);
      if (swapTargetId && swapTargetId !== currentKey) {
        const replacement = EXERCISE_LIBRARY.find((e) => e.id === swapTargetId);
        if (replacement) {
          const specialUnitReps =
            /shuttle|goal pace|3rm|max in/i.test(tuned.reps) || tuned.pattern !== replacement.pattern;
          return {
            ...tuned,
            exerciseId: replacement.id,
            name: replacement.name,
            muscleGroup: replacement.muscleGroup,
            equipment: replacement.equipment,
            pattern: replacement.pattern,
            reps: specialUnitReps ? replacement.defaultReps : tuned.reps,
            originalExerciseId: currentKey,
            replacedFromName: tuned.name,
          };
        }
      }

      return {
        ...tuned,
        equipment: baseEquipment,
      };
    });

    return {
      ...day,
      recoveryNote: `${expSummary} · ${day.recoveryNote}`,
      exercises: tunedExercises,
    };
  });

  return {
    rotationDays,
    targetMinutes,
    days: adaptedDays,
  };
}

export type EquipmentCategoryFilter =
  | 'All'
  | 'No Equipment'
  | 'Dumbbells'
  | 'Kettlebell'
  | 'Bands'
  | 'Gym / Barbell';

export const EQUIPMENT_FILTER_OPTIONS: EquipmentCategoryFilter[] = [
  'All',
  'No Equipment',
  'Dumbbells',
  'Kettlebell',
  'Bands',
  'Gym / Barbell',
];

export function matchesEquipmentFilter(
  equipment: string,
  filter: EquipmentCategoryFilter
): boolean {
  if (filter === 'All') return true;
  const eq = equipment.toLowerCase();
  if (filter === 'No Equipment') {
    return (
      eq.includes('bodyweight') ||
      eq.includes('no equipment') ||
      eq.includes('mat') ||
      eq.includes('chair') ||
      eq.includes('road')
    );
  }
  if (filter === 'Dumbbells') {
    return eq.includes('dumbbell');
  }
  if (filter === 'Kettlebell') {
    return eq.includes('kettlebell');
  }
  if (filter === 'Bands') {
    return eq.includes('band');
  }
  return (
    eq.includes('barbell') ||
    eq.includes('hex') ||
    eq.includes('cable') ||
    eq.includes('machine') ||
    eq.includes('pull-up') ||
    eq.includes('sled') ||
    eq.includes('rope') ||
    eq.includes('box')
  );
}

export function getLikeExerciseAlternatives(exercise: ProgramExercise): {
  currentEquipment: string;
  samePattern: ExerciseLibraryItem[];
  sameMuscle: ExerciseLibraryItem[];
} {
  const currentId = exercise.exerciseId;
  const resolved = resolveExerciseGuide(exercise.name, exercise.exerciseId, exercise.pattern);
  const pattern = exercise.pattern || resolved.pattern;
  const muscle = exercise.muscleGroup || resolved.muscleGroup;

  const samePattern = EXERCISE_LIBRARY.filter(
    (item) =>
      item.pattern === pattern &&
      item.id !== currentId &&
      item.name.toLowerCase() !== exercise.name.toLowerCase()
  );

  const samePatternIds = new Set(samePattern.map((i) => i.id));
  const sameMuscle = EXERCISE_LIBRARY.filter(
    (item) =>
      item.muscleGroup.toLowerCase() === muscle.toLowerCase() &&
      !samePatternIds.has(item.id) &&
      item.id !== currentId &&
      item.name.toLowerCase() !== exercise.name.toLowerCase()
  );

  return {
    currentEquipment: exercise.equipment || resolved.equipment,
    samePattern,
    sameMuscle,
  };
}

export function getNextProgramDayIndex(
  programId: string,
  totalDays: number,
  sessions: Array<{ programId: string; programTitle: string }>
): number {
  if (totalDays <= 0) return 0;
  const programSessions = sessions.filter((s) => s.programId === programId);
  if (programSessions.length === 0) return 0;
  const latest = programSessions[0];
  const dayMatch = latest.programTitle.match(/·\s*Day\s+(\d+)/i);
  if (dayMatch) {
    const completedDay = Number(dayMatch[1]);
    if (Number.isFinite(completedDay) && completedDay >= 1) {
      return completedDay % totalDays;
    }
  }
  return programSessions.length % totalDays;
}

export function resolveExerciseGuide(
  exerciseName: string,
  explicitExerciseId?: string,
  explicitPattern?: MovementPattern
): ExerciseLibraryItem {
  if (explicitExerciseId) {
    const byId = EXERCISE_LIBRARY.find((e) => e.id === explicitExerciseId);
    if (byId) return byId;
  }

  const lower = exerciseName.toLowerCase();
  const exactName = EXERCISE_LIBRARY.find((e) => e.name.toLowerCase() === lower);
  if (exactName) return exactName;

  let detectedPattern: MovementPattern = explicitPattern || 'squat';
  if (!explicitPattern) {
    if (lower.includes('squat') || lower.includes('thruster')) detectedPattern = 'squat';
    else if (lower.includes('deadlift') || lower.includes('rdl') || lower.includes('hinge') || lower.includes('good morning') || lower.includes('hip thrust') || lower.includes('glute bridge')) detectedPattern = 'hinge';
    else if (lower.includes('bench') || lower.includes('push-up') || lower.includes('pushup') || lower.includes('chest press') || lower.includes('dip')) detectedPattern = 'push_horizontal';
    else if (lower.includes('overhead') || lower.includes('shoulder press') || lower.includes('military') || lower.includes('arnold')) detectedPattern = 'push_vertical';
    else if (lower.includes('row') || lower.includes('face pull')) detectedPattern = 'pull_horizontal';
    else if (lower.includes('pull-up') || lower.includes('pullup') || lower.includes('chin-up') || lower.includes('pulldown')) detectedPattern = 'pull_vertical';
    else if (lower.includes('lunge') || lower.includes('split') || lower.includes('step-up') || lower.includes('clamshell') || lower.includes('abduction') || lower.includes('lateral walk')) detectedPattern = 'lunge';
    else if (lower.includes('plank') || lower.includes('pallof') || lower.includes('bird dog')) detectedPattern = 'core_plank';
    else if (lower.includes('dead bug') || lower.includes('crunch') || lower.includes('hollow')) detectedPattern = 'core_hollow';
    else if (lower.includes('swing') || lower.includes('rope') || lower.includes('carry') || lower.includes('sled') || lower.includes('drag') || lower.includes('sandbag')) detectedPattern = 'carry_swing';
    else if (lower.includes('curl') || lower.includes('raise') || lower.includes('fly')) detectedPattern = 'curl_raise';
    else if (lower.includes('burpee') || lower.includes('jump') || lower.includes('sprint') || lower.includes('run') || lower.includes('ruck')) detectedPattern = 'cardio_jump';
    else if (lower.includes('mobility') || lower.includes('stretch') || lower.includes('hip') || lower.includes('thoracic') || lower.includes('yoga')) detectedPattern = 'mobility_flow';
  }

  const template = EXERCISE_LIBRARY.find((e) => e.pattern === detectedPattern) || EXERCISE_LIBRARY[0];
  return {
    ...template,
    id: `custom-${lower.replace(/[^a-z0-9]+/g, '-')}`,
    name: exerciseName,
    pattern: detectedPattern,
  };
}

export const VERIFIED_WHOLE_FOODS: FoodCatalogProduct[] = [
  {
    id: 'wf-chicken',
    name: 'Grilled Chicken Breast (Skinless)',
    brand: 'USDA Reference',
    barcode: '',
    servingLabel: '150 g cooked',
    caloriesPerServing: 248,
    proteinPerServing: 46,
    carbsPerServing: 0,
    fatPerServing: 5.4,
    source: 'search',
  },
  {
    id: 'wf-oats',
    name: 'Rolled Oats (Dry)',
    brand: 'USDA Reference',
    barcode: '',
    servingLabel: '1/2 cup (40 g)',
    caloriesPerServing: 150,
    proteinPerServing: 5,
    carbsPerServing: 27,
    fatPerServing: 2.5,
    source: 'search',
  },
  {
    id: 'wf-greek-yogurt',
    name: 'Nonfat Plain Greek Yogurt',
    brand: 'USDA Reference',
    barcode: '',
    servingLabel: '170 g container',
    caloriesPerServing: 100,
    proteinPerServing: 18,
    carbsPerServing: 6,
    fatPerServing: 0,
    source: 'search',
  },
  {
    id: 'wf-eggs',
    name: 'Whole Eggs (Large)',
    brand: 'USDA Reference',
    barcode: '',
    servingLabel: '2 large eggs',
    caloriesPerServing: 143,
    proteinPerServing: 12.6,
    carbsPerServing: 0.7,
    fatPerServing: 9.5,
    source: 'search',
  },
  {
    id: 'wf-salmon',
    name: 'Wild Atlantic Salmon Fillet',
    brand: 'USDA Reference',
    barcode: '',
    servingLabel: '150 g cooked',
    caloriesPerServing: 309,
    proteinPerServing: 33,
    carbsPerServing: 0,
    fatPerServing: 18.5,
    source: 'search',
  },
  {
    id: 'wf-rice',
    name: 'Cooked Jasmine / White Rice',
    brand: 'USDA Reference',
    barcode: '',
    servingLabel: '1 cup (158 g)',
    caloriesPerServing: 205,
    proteinPerServing: 4.3,
    carbsPerServing: 44.5,
    fatPerServing: 0.4,
    source: 'search',
  },
  {
    id: 'wf-banana',
    name: 'Fresh Banana (Medium)',
    brand: 'USDA Reference',
    barcode: '',
    servingLabel: '1 medium (118 g)',
    caloriesPerServing: 105,
    proteinPerServing: 1.3,
    carbsPerServing: 27,
    fatPerServing: 0.4,
    source: 'search',
  },
  {
    id: 'wf-avocado',
    name: 'Hass Avocado',
    brand: 'USDA Reference',
    barcode: '',
    servingLabel: '1/2 fruit (75 g)',
    caloriesPerServing: 120,
    proteinPerServing: 1.5,
    carbsPerServing: 6.4,
    fatPerServing: 11,
    source: 'search',
  },
  {
    id: 'wf-whey',
    name: 'Whey Protein Isolate Scoop',
    brand: 'Supplement Standard',
    barcode: '',
    servingLabel: '1 scoop (30 g)',
    caloriesPerServing: 115,
    proteinPerServing: 25,
    carbsPerServing: 1.5,
    fatPerServing: 0.5,
    source: 'search',
  },
  {
    id: 'wf-almonds',
    name: 'Raw Almonds',
    brand: 'USDA Reference',
    barcode: '',
    servingLabel: '28 g (approx. 23 nuts)',
    caloriesPerServing: 164,
    proteinPerServing: 6,
    carbsPerServing: 6.1,
    fatPerServing: 14.2,
    source: 'search',
  },
];
