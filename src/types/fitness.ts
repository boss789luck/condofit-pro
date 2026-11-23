export type MuscleId =
  | 'chest'
  | 'front_delts'
  | 'side_delts'
  | 'rear_delts'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'obliques'
  | 'traps'
  | 'lats'
  | 'mid_back'
  | 'lower_back'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'cardio';

export type EquipmentCategory =
  | 'smith_machine'
  | 'multi_gym'
  | 'vkr_dip'
  | 'dumbbells'
  | 'decline_bench'
  | 'recumbent_bike';

export type AnimationType =
  | 'smith_bench_press'
  | 'smith_incline_press'
  | 'smith_squat'
  | 'smith_rdl'
  | 'smith_overhead_press'
  | 'smith_bent_row'
  | 'smith_calf_raise'
  | 'machine_chest_press'
  | 'pec_deck_fly'
  | 'rear_delt_fly'
  | 'lat_pulldown'
  | 'seated_cable_row'
  | 'tricep_pushdown'
  | 'cable_bicep_curl'
  | 'leg_press'
  | 'leg_extension'
  | 'parallel_dips'
  | 'vertical_knee_raise'
  | 'db_lateral_raise'
  | 'db_bicep_curl'
  | 'db_hammer_curl'
  | 'db_goblet_squat'
  | 'db_shoulder_press'
  | 'db_incline_press'
  | 'db_one_arm_row'
  | 'db_bulgarian_split_squat'
  | 'db_overhead_tricep'
  | 'decline_crunch'
  | 'recumbent_bike';

export interface Exercise {
  id: string;
  nameTh: string;
  nameEn: string;
  equipment: EquipmentCategory;
  equipmentLabelTh: string;
  condoPhotoRef: string;
  primaryMuscles: MuscleId[];
  secondaryMuscles: MuscleId[];
  animationType: AnimationType;
  difficulty: 'เริ่มต้น' | 'ปานกลาง' | 'เข้มข้น';
  defaultSets: number;
  defaultReps: string;
  restSeconds: number;
  tempo: string;
  breathingTip: string;
  stepsTh: string[];
  mistakesTh: string[];
  proTipTh: string;
  isCardio?: boolean;
  caloriesPerMin?: number;
}

export interface ProgramExerciseItem {
  exerciseId: string;
  sets: number;
  reps: string;
  restSeconds: number;
  noteTh?: string;
}

export interface WorkoutDay {
  id: string;
  dayLabel: string;
  titleTh: string;
  subtitleTh: string;
  focusMuscles: MuscleId[];
  estimatedMinutes: number;
  estimatedCalories: number;
  exercises: ProgramExerciseItem[];
}

export interface ProgramPhase {
  id: number;
  phaseNumber: number;
  monthsLabel: string;
  weeksLabel: string;
  titleTh: string;
  goalTh: string;
  targetWeightRange: string;
  frequencyLabel: string;
  calorieStrategyTh: string;
  cardioStrategyTh: string;
  workouts: WorkoutDay[];
}

export interface LoggedSet {
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
  isPR?: boolean;
}

export interface LoggedExercise {
  exerciseId: string;
  sets: LoggedSet[];
}

export interface WorkoutSessionLog {
  id: string;
  dateISO: string;
  workoutDayId: string;
  workoutTitleTh: string;
  phaseNumber: number;
  durationMinutes: number;
  totalVolumeKg: number;
  estimatedCalories: number;
  exercises: LoggedExercise[];
  notes?: string;
}

export interface WeightEntry {
  id: string;
  dateISO: string;
  weightKg: number;
  note?: string;
}

export interface UserProfile {
  name: string;
  startWeightKg: number;
  currentWeightKg: number;
  targetWeightKg: number;
  heightCm: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: 'moderate' | 'active';
  startDateISO: string;
  targetMonths: number;
  activePhase: number;
  daysPerWeek: number; // 2, 3 (default), 4, 5
  sessionMinutes: number; // 30, 45, 60 (default), 90
  dailyWaterMl: number;
  waterTargetMl: number;
  waterLastDate: string;
}
