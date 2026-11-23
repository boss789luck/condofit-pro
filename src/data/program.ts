import { ProgramExerciseItem, ProgramPhase, WorkoutDay } from '../types/fitness';

function scaleWorkoutToDuration(day: WorkoutDay, sessionMinutes: number): WorkoutDay {
  const isBike = (id: string) => id === 'recumbent-bike-zone2';
  const liftItems = day.exercises.filter((e) => !isBike(e.exerciseId));
  const hasBike = day.exercises.some((e) => isBike(e.exerciseId));

  let maxLifts = liftItems.length;
  let setsCap = 4;
  let restFactor = 1;
  let bikeMins = 20;

  if (sessionMinutes <= 30) {
    maxLifts = 4;
    setsCap = 3;
    restFactor = 0.7;
    bikeMins = 10;
  } else if (sessionMinutes <= 45) {
    maxLifts = 5;
    setsCap = 3;
    restFactor = 0.85;
    bikeMins = 15;
  } else if (sessionMinutes <= 60) {
    maxLifts = 6;
    setsCap = 4;
    restFactor = 1;
    bikeMins = 20;
  } else {
    // 90 minutes (1.5 hr)
    maxLifts = 7;
    setsCap = 4;
    restFactor = 1.1;
    bikeMins = 30;
  }

  const scaledLifts: ProgramExerciseItem[] = liftItems.slice(0, maxLifts).map((item) => ({
    ...item,
    sets: sessionMinutes >= 90 ? Math.min(4, item.sets + 1) : Math.min(setsCap, item.sets),
    restSeconds: Math.max(45, Math.round((item.restSeconds * restFactor) / 15) * 15),
  }));

  const finalExercises: ProgramExerciseItem[] = [...scaledLifts];
  if (hasBike || sessionMinutes >= 45) {
    finalExercises.push({
      exerciseId: 'recumbent-bike-zone2',
      sets: 1,
      reps: `${bikeMins} นาที`,
      restSeconds: 0,
      noteTh: `Zone 2 ปั่นต่อเนื่อง ${bikeMins} นาที (75–85 RPM) เผาผลาญไขมัน`,
    });
  }

  const estimatedCalories = Math.round(sessionMinutes * 6.8);

  return {
    ...day,
    estimatedMinutes: sessionMinutes,
    estimatedCalories,
    exercises: finalExercises,
  };
}

function buildWorkoutsForSchedule(phaseNumber: number, daysPerWeek: number, sessionMinutes: number): WorkoutDay[] {
  const isP3 = phaseNumber === 3;
  const isP2 = phaseNumber === 2;

  let rawDays: WorkoutDay[] = [];

  if (daysPerWeek === 2) {
    rawDays = [
      {
        id: `p${phaseNumber}-2d-1`,
        dayLabel: 'วันที่ 1 (Full Body A)',
        titleTh: 'Full Body A — อก + หลังกว้าง + ขาหน้า',
        subtitleTh: 'รวมท่าหลักครบทั้งตัวสำหรับคนเวลาน้อย (2 วัน/สัปดาห์)',
        focusMuscles: ['chest', 'lats', 'quads', 'side_delts', 'abs'],
        estimatedMinutes: 60,
        estimatedCalories: 410,
        exercises: [
          { exerciseId: 'smith-squat', sets: 4, reps: '8-12', restSeconds: 90, noteTh: 'ท่าหลักเผาผลาญสูงสุด' },
          { exerciseId: 'smith-bench-press', sets: 4, reps: '8-12', restSeconds: 90 },
          { exerciseId: 'lat-pulldown', sets: 4, reps: '10-12', restSeconds: 75 },
          { exerciseId: 'db-lateral-raise', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'tricep-pushdown', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'vertical-knee-raise', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'recumbent-bike-zone2', sets: 1, reps: '20 นาที', restSeconds: 0 },
        ],
      },
      {
        id: `p${phaseNumber}-2d-2`,
        dayLabel: 'วันที่ 2 (Full Body B)',
        titleTh: 'Full Body B — อกบน + หลังหนา + ขาหลัง & ก้น',
        subtitleTh: 'เก็บครบทุกมัดที่เหลือ + กระตุ้นระบบเผาผลาญ',
        focusMuscles: ['chest', 'mid_back', 'hamstrings', 'glutes', 'biceps', 'abs'],
        estimatedMinutes: 60,
        estimatedCalories: 420,
        exercises: [
          { exerciseId: 'leg-press', sets: 4, reps: '10-15', restSeconds: 90 },
          { exerciseId: 'smith-rdl', sets: 3, reps: '10-12', restSeconds: 90 },
          { exerciseId: 'smith-incline-press', sets: 4, reps: '10-12', restSeconds: 75 },
          { exerciseId: 'seated-cable-row', sets: 4, reps: '10-12', restSeconds: 75 },
          { exerciseId: 'db-bicep-curl', sets: 3, reps: '10-12', restSeconds: 60 },
          { exerciseId: 'decline-crunch', sets: 3, reps: '15-20', restSeconds: 60 },
          { exerciseId: 'recumbent-bike-zone2', sets: 1, reps: '20 นาที', restSeconds: 0 },
        ],
      },
    ];
  } else if (daysPerWeek === 3) {
    // DEFAULT: 3 Days/Week — Balanced Upper / Lower / Full-Body Split (hits every muscle 2x/week!)
    rawDays = [
      {
        id: `p${phaseNumber}-3d-1`,
        dayLabel: 'วันที่ 1 (จันทร์ / อังคาร)',
        titleTh: 'Upper Body — อก + หลังกว้าง + ไหล่ + แขน',
        subtitleTh: 'สร้างช่วงบนให้ผึ่งผาย ครบทั้งดันและดึงในวันเดียว',
        focusMuscles: ['chest', 'lats', 'side_delts', 'triceps', 'biceps'],
        estimatedMinutes: 60,
        estimatedCalories: 390,
        exercises: [
          { exerciseId: isP3 ? 'db-incline-press' : 'smith-bench-press', sets: 4, reps: '8-12', restSeconds: 90, noteTh: 'ท่าหลักสร้างกล้ามอก' },
          { exerciseId: 'lat-pulldown', sets: 4, reps: '10-12', restSeconds: 90, noteTh: 'ดึงศอกลงข้างลำตัว สร้างปีก V-Taper' },
          { exerciseId: isP2 ? 'db-incline-press' : 'db-shoulder-press', sets: 3, reps: '10-12', restSeconds: 75 },
          { exerciseId: 'db-one-arm-row', sets: 3, reps: '10-12 / ข้าง', restSeconds: 75, noteTh: 'ใช้ดัมเบลหนักขึ้นได้เรื่อยๆ ปั้นหลังหนา' },
          { exerciseId: 'db-lateral-raise', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: isP2 ? 'db-overhead-tricep' : 'tricep-pushdown', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'recumbent-bike-zone2', sets: 1, reps: '20 นาที', restSeconds: 0 },
        ],
      },
      {
        id: `p${phaseNumber}-3d-2`,
        dayLabel: 'วันที่ 2 (พุธ / พฤหัสฯ)',
        titleTh: 'Lower Body & Core — ขา + ก้น + หน้าท้อง',
        subtitleTh: 'วันเผาผลาญแคลอรี่สูงสุดด้วยกล้ามเนื้อขามัดใหญ่และซิกแพ็ค',
        focusMuscles: ['quads', 'glutes', 'hamstrings', 'calves', 'abs'],
        estimatedMinutes: 60,
        estimatedCalories: 430,
        exercises: [
          { exerciseId: 'smith-squat', sets: 4, reps: '8-12', restSeconds: 105, noteTh: 'ตั้ง Safety Stop ทุกครั้ง' },
          { exerciseId: 'smith-rdl', sets: 3, reps: '10-12', restSeconds: 90, noteTh: 'พับสะโพกหลังตรง เน้นขาหลังและก้น' },
          { exerciseId: 'db-bulgarian-split-squat', sets: 3, reps: '10-12 / ข้าง', restSeconds: 90, noteTh: 'เบิร์นหนักมาก & ปั้นก้น/ขาสมดุลซ้าย-ขวา' },
          { exerciseId: 'smith-calf-raise', sets: 3, reps: '15-20', restSeconds: 60 },
          { exerciseId: 'vertical-knee-raise', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'decline-crunch', sets: 3, reps: '15-20', restSeconds: 60 },
          { exerciseId: 'recumbent-bike-zone2', sets: 1, reps: '20 นาที', restSeconds: 0 },
        ],
      },
      {
        id: `p${phaseNumber}-3d-3`,
        dayLabel: 'วันที่ 3 (ศุกร์ / เสาร์)',
        titleTh: 'Full Body Sculpt — กระตุ้นซ้ำทั่วร่าง + ปั่นเบิร์น',
        subtitleTh: 'ซ้ำกล้ามเนื้อหลักรอบที่ 2 ของสัปดาห์ เร่งสร้างกล้ามและรีดไขมัน',
        focusMuscles: ['chest', 'mid_back', 'quads', 'rear_delts', 'biceps', 'cardio'],
        estimatedMinutes: 60,
        estimatedCalories: 440,
        exercises: [
          { exerciseId: 'leg-press', sets: 4, reps: '10-15', restSeconds: 90 },
          { exerciseId: isP3 ? 'parallel-dips' : 'db-incline-press', sets: 3, reps: '10-12', restSeconds: 75 },
          { exerciseId: 'seated-cable-row', sets: 4, reps: '10-12', restSeconds: 75 },
          { exerciseId: 'pec-deck-fly', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'rear-delt-fly', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: isP2 ? 'db-hammer-curl' : 'db-bicep-curl', sets: 3, reps: '12', restSeconds: 60 },
          { exerciseId: 'recumbent-bike-zone2', sets: 1, reps: '25 นาที', restSeconds: 0 },
        ],
      },
    ];
  } else if (daysPerWeek === 4) {
    rawDays = [
      {
        id: `p${phaseNumber}-4d-1`,
        dayLabel: 'วันที่ 1 (Upper A)',
        titleTh: 'Upper A — อกกลาง + หลังกว้าง + ไหล่',
        subtitleTh: 'เน้นท่าหลักบน Smith Machine และ Body-Solid Multi-Gym',
        focusMuscles: ['chest', 'lats', 'side_delts', 'triceps'],
        estimatedMinutes: 60,
        estimatedCalories: 380,
        exercises: [
          { exerciseId: 'smith-bench-press', sets: 4, reps: '8-12', restSeconds: 90 },
          { exerciseId: 'lat-pulldown', sets: 4, reps: '10-12', restSeconds: 90 },
          { exerciseId: 'db-shoulder-press', sets: 3, reps: '10-12', restSeconds: 75 },
          { exerciseId: 'seated-cable-row', sets: 3, reps: '10-12', restSeconds: 75 },
          { exerciseId: 'db-lateral-raise', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'tricep-pushdown', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'recumbent-bike-zone2', sets: 1, reps: '20 นาที', restSeconds: 0 },
        ],
      },
      {
        id: `p${phaseNumber}-4d-2`,
        dayLabel: 'วันที่ 2 (Lower A)',
        titleTh: 'Lower A — ขาหน้า + ก้น + หน้าท้อง',
        subtitleTh: 'เผาผลาญแคลอรี่สูงสุดด้วยกล้ามเนื้อขามัดใหญ่',
        focusMuscles: ['quads', 'glutes', 'hamstrings', 'calves', 'abs'],
        estimatedMinutes: 60,
        estimatedCalories: 420,
        exercises: [
          { exerciseId: 'smith-squat', sets: 4, reps: '8-12', restSeconds: 120 },
          { exerciseId: 'smith-rdl', sets: 3, reps: '10-12', restSeconds: 90 },
          { exerciseId: 'leg-extension', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'smith-calf-raise', sets: 3, reps: '15-20', restSeconds: 60 },
          { exerciseId: 'vertical-knee-raise', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'recumbent-bike-zone2', sets: 1, reps: '20 นาที', restSeconds: 0 },
        ],
      },
      {
        id: `p${phaseNumber}-4d-3`,
        dayLabel: 'วันที่ 3 (Upper B)',
        titleTh: 'Upper B — อกบน + หลังหนา + แขน',
        subtitleTh: 'เก็บรายละเอียดอกบน ไหล่หลัง และแขนหน้า-หลัง',
        focusMuscles: ['chest', 'mid_back', 'rear_delts', 'biceps', 'triceps'],
        estimatedMinutes: 60,
        estimatedCalories: 370,
        exercises: [
          { exerciseId: 'smith-incline-press', sets: 4, reps: '10-12', restSeconds: 90 },
          { exerciseId: 'smith-bent-row', sets: 4, reps: '10-12', restSeconds: 90 },
          { exerciseId: 'pec-deck-fly', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'rear-delt-fly', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'db-bicep-curl', sets: 3, reps: '10-12', restSeconds: 60 },
          { exerciseId: 'parallel-dips', sets: 3, reps: '8-12', restSeconds: 75 },
          { exerciseId: 'recumbent-bike-zone2', sets: 1, reps: '20 นาที', restSeconds: 0 },
        ],
      },
      {
        id: `p${phaseNumber}-4d-4`,
        dayLabel: 'วันที่ 4 (Lower B)',
        titleTh: 'Lower B — Leg Press + ขา + แกนกลาง',
        subtitleTh: 'เน้นปริมาณงานบนเครื่อง Leg Press และปั้นซิกแพ็ค',
        focusMuscles: ['quads', 'glutes', 'hamstrings', 'abs', 'obliques'],
        estimatedMinutes: 60,
        estimatedCalories: 410,
        exercises: [
          { exerciseId: 'leg-press', sets: 4, reps: '10-15', restSeconds: 90 },
          { exerciseId: 'db-goblet-squat', sets: 3, reps: '12-15', restSeconds: 75 },
          { exerciseId: 'smith-rdl', sets: 3, reps: '10-12', restSeconds: 90 },
          { exerciseId: 'decline-crunch', sets: 3, reps: '15-20', restSeconds: 60 },
          { exerciseId: 'vertical-knee-raise', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'recumbent-bike-zone2', sets: 1, reps: '25 นาที', restSeconds: 0 },
        ],
      },
    ];
  } else {
    // 5 Days/Week — Push / Pull / Legs / Upper / Lower+Cardio
    rawDays = [
      {
        id: `p${phaseNumber}-5d-1`,
        dayLabel: 'วันที่ 1 (Push)',
        titleTh: 'Push — อก + ไหล่ + หลังแขน',
        subtitleTh: 'โฟกัสกลุ่มกล้ามเนื้อดันเต็มรูปแบบ',
        focusMuscles: ['chest', 'front_delts', 'side_delts', 'triceps'],
        estimatedMinutes: 60,
        estimatedCalories: 390,
        exercises: [
          { exerciseId: 'smith-bench-press', sets: 4, reps: '8-10', restSeconds: 90 },
          { exerciseId: 'smith-incline-press', sets: 4, reps: '10-12', restSeconds: 90 },
          { exerciseId: 'pec-deck-fly', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'smith-overhead-press', sets: 3, reps: '10-12', restSeconds: 75 },
          { exerciseId: 'db-lateral-raise', sets: 4, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'tricep-pushdown', sets: 3, reps: '12-15', restSeconds: 60 },
        ],
      },
      {
        id: `p${phaseNumber}-5d-2`,
        dayLabel: 'วันที่ 2 (Pull)',
        titleTh: 'Pull — หลังกว้าง + หลังกลาง + หน้าแขน',
        subtitleTh: 'ปั้นแผ่นหลัง V-Taper และแขนหน้าคมชัด',
        focusMuscles: ['lats', 'mid_back', 'rear_delts', 'biceps', 'forearms'],
        estimatedMinutes: 60,
        estimatedCalories: 380,
        exercises: [
          { exerciseId: 'lat-pulldown', sets: 4, reps: '8-12', restSeconds: 90 },
          { exerciseId: 'smith-bent-row', sets: 4, reps: '10-12', restSeconds: 90 },
          { exerciseId: 'seated-cable-row', sets: 3, reps: '10-12', restSeconds: 75 },
          { exerciseId: 'rear-delt-fly', sets: 3, reps: '15', restSeconds: 60 },
          { exerciseId: 'cable-bicep-curl', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'db-hammer-curl', sets: 3, reps: '10-12', restSeconds: 60 },
        ],
      },
      {
        id: `p${phaseNumber}-5d-3`,
        dayLabel: 'วันที่ 3 (Legs)',
        titleTh: 'Legs — ขาครบทุกมัด + น่อง',
        subtitleTh: 'สร้างขามัดใหญ่เร่งการเผาผลาญทั้งสัปดาห์',
        focusMuscles: ['quads', 'hamstrings', 'glutes', 'calves'],
        estimatedMinutes: 60,
        estimatedCalories: 450,
        exercises: [
          { exerciseId: 'smith-squat', sets: 4, reps: '8-12', restSeconds: 120 },
          { exerciseId: 'leg-press', sets: 4, reps: '12-15', restSeconds: 90 },
          { exerciseId: 'smith-rdl', sets: 4, reps: '10-12', restSeconds: 90 },
          { exerciseId: 'leg-extension', sets: 3, reps: '15', restSeconds: 60 },
          { exerciseId: 'smith-calf-raise', sets: 4, reps: '15-20', restSeconds: 60 },
        ],
      },
      {
        id: `p${phaseNumber}-5d-4`,
        dayLabel: 'วันที่ 4 (Upper Pump)',
        titleTh: 'Upper Pump — เก็บรายละเอียดช่วงบน',
        subtitleTh: 'ซ้ำอก หลัง ไหล่ แขน เพื่อเร่งการเติบโตของกล้ามเนื้อ',
        focusMuscles: ['chest', 'lats', 'side_delts', 'biceps', 'triceps'],
        estimatedMinutes: 60,
        estimatedCalories: 380,
        exercises: [
          { exerciseId: 'machine-chest-press', sets: 4, reps: '12', restSeconds: 75 },
          { exerciseId: 'lat-pulldown', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: 'parallel-dips', sets: 3, reps: '8-12', restSeconds: 75 },
          { exerciseId: 'db-lateral-raise', sets: 4, reps: '15', restSeconds: 45 },
          { exerciseId: 'db-bicep-curl', sets: 3, reps: '12', restSeconds: 60 },
          { exerciseId: 'recumbent-bike-zone2', sets: 1, reps: '20 นาที', restSeconds: 0 },
        ],
      },
      {
        id: `p${phaseNumber}-5d-5`,
        dayLabel: 'วันที่ 5 (Core + Cardio)',
        titleTh: 'Core & Fat-Burn — หน้าท้อง + ขาเบา + คาร์ดิโอ',
        subtitleTh: 'รีดไขมันรอบเอวและปั้นซิกแพ็คให้ชัด',
        focusMuscles: ['abs', 'obliques', 'quads', 'cardio'],
        estimatedMinutes: 60,
        estimatedCalories: 460,
        exercises: [
          { exerciseId: 'db-goblet-squat', sets: 3, reps: '15', restSeconds: 60 },
          { exerciseId: 'vertical-knee-raise', sets: 4, reps: '15', restSeconds: 60 },
          { exerciseId: 'decline-crunch', sets: 4, reps: '15-20', restSeconds: 60 },
          { exerciseId: 'recumbent-bike-zone2', sets: 1, reps: '30 นาที', restSeconds: 0 },
        ],
      },
    ];
  }

  return rawDays.map((d) => scaleWorkoutToDuration(d, sessionMinutes));
}

export function buildAdaptedProgram(daysPerWeek: number, sessionMinutes: number): ProgramPhase[] {
  const hrsLabel =
    sessionMinutes === 30
      ? '30 นาที'
      : sessionMinutes === 45
      ? '45 นาที'
      : sessionMinutes === 60
      ? '1 ชม.'
      : '1.5 ชม.';

  return [
    {
      id: 1,
      phaseNumber: 1,
      monthsLabel: 'เดือนที่ 1–2',
      weeksLabel: 'สัปดาห์ 1–8',
      titleTh: 'Phase 1: สร้างฐานกล้ามเนื้อ & จุดเตาเผาไขมัน',
      goalTh: 'ฝึกฟอร์มให้แม่นยำทุกเครื่องในคอนโด กระตุ้นการสร้างกล้ามเนื้อใหม่ พร้อมลดไขมันสัปดาห์ละ 0.4–0.5 กก.',
      targetWeightRange: '78.0 → 74.5 กก.',
      frequencyLabel: `${daysPerWeek} วัน/สัปดาห์ · ครั้งละ ${hrsLabel}`,
      calorieStrategyTh: 'ติดลบพลังงานเบาๆ ~350–400 kcal/วัน | โปรตีนสูง 150–160g/วัน',
      cardioStrategyTh: `ปั่น Recumbent Bike Zone 2 ท้ายเซสชันทุกครั้ง (${daysPerWeek} ครั้ง/สัปดาห์)`,
      workouts: buildWorkoutsForSchedule(1, daysPerWeek, sessionMinutes),
    },
    {
      id: 2,
      phaseNumber: 2,
      monthsLabel: 'เดือนที่ 3–4',
      weeksLabel: 'สัปดาห์ 9–16',
      titleTh: 'Phase 2: ปั้นกล้ามเนื้อชัด & เร่งระบบเผาผลาญ',
      goalTh: 'เพิ่มน้ำหนักยก (Progressive Overload) เพื่อขยายมัดกล้ามเนื้ออก หลัง ไหล่ และขา ขณะลดไขมันต่อเนื่อง',
      targetWeightRange: '74.5 → 71.0 กก.',
      frequencyLabel: `${daysPerWeek} วัน/สัปดาห์ · ครั้งละ ${hrsLabel}`,
      calorieStrategyTh: 'ติดลบพลังงาน ~400–450 kcal/วัน | โปรตีน 155–165g/วัน',
      cardioStrategyTh: 'ปั่น Recumbent Bike Zone 2 รอบขา 80 RPM สม่ำเสมอหลังเวท',
      workouts: buildWorkoutsForSchedule(2, daysPerWeek, sessionMinutes),
    },
    {
      id: 3,
      phaseNumber: 3,
      monthsLabel: 'เดือนที่ 5–6',
      weeksLabel: 'สัปดาห์ 17–24',
      titleTh: 'Phase 3: ลีนคมชัด & พิชิตเป้าหมาย 68 กก.',
      goalTh: 'รักษามวลกล้ามเนื้อเต็มที่ พร้อมรีดไขมันช่วงสุดท้ายให้เห็นไลน์กล้ามเนื้อหน้าท้อง อก และไหล่ชัดเจน',
      targetWeightRange: '71.0 → 68.0 กก.',
      frequencyLabel: `${daysPerWeek} วัน/สัปดาห์ · ครั้งละ ${hrsLabel}`,
      calorieStrategyTh: 'ติดลบพลังงาน ~400 kcal/วัน | โปรตีนสูงพิเศษ 160g/วัน เพื่อล็อกกล้ามเนื้อ',
      cardioStrategyTh: 'ปั่น Recumbent Bike ท้ายเซสชัน + เดินวันพัก 8,000 ก้าว',
      workouts: buildWorkoutsForSchedule(3, daysPerWeek, sessionMinutes),
    },
  ];
}
