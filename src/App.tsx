import React, { useMemo, useState } from 'react';
import {
  Activity,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Droplets,
  Dumbbell,
  Flame,
  LayoutDashboard,
  Play,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Target,
  Trash2,
  TrendingDown,
} from 'lucide-react';
import { EQUIPMENT_LIST, MUSCLE_INFO } from './data/muscles';
import { EXERCISES, EXERCISE_MAP } from './data/exercises';
import { buildAdaptedProgram } from './data/program';
import { EquipmentCategory, Exercise, MuscleId, WorkoutDay } from './types/fitness';
import { useFitnessStore } from './hooks/useFitnessStore';
import { MuscleMap } from './components/MuscleMap';
import { ExerciseDetailModal } from './components/ExerciseDetailModal';
import { LiveWorkoutSession } from './components/LiveWorkoutSession';
import { HistoryView } from './components/HistoryView';
import { ProgressAndToolsView } from './components/ProgressAndToolsView';

type TabId = 'dashboard' | 'program' | 'library' | 'history' | 'progress';

const DAY_OPTIONS = [2, 3, 4, 5];
const DURATION_OPTIONS = [
  { minutes: 30, label: '30 นาที' },
  { minutes: 45, label: '45 นาที' },
  { minutes: 60, label: '1 ชม.' },
  { minutes: 90, label: '1.5 ชม.' },
];

export function App() {
  const {
    profile,
    sessions,
    weights,
    activeDraft,
    saveActiveDraft,
    clearActiveDraft,
    personalRecords,
    weeklyMuscleHeatmap,
    weeklyStats,
    updateProfile,
    addWater,
    addWeightEntry,
    deleteWeightEntry,
    addSession,
    deleteSession,
    exportBackupJson,
    importBackupJson,
  } = useFitnessStore();

  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<{
    workout: WorkoutDay;
    phaseNumber: number;
    resumeDraft?: boolean;
  } | null>(null);

  const handleQuickSaveDraft = () => {
    if (!activeDraft) return;
    const elapsedMin = Math.max(1, Math.round((Date.now() - activeDraft.startedAtMs) / 60000));
    const totalSets = activeDraft.loggedExercises.reduce((a, ex) => a + ex.sets.length, 0);
    const doneSets = activeDraft.loggedExercises.reduce(
      (a, ex) => a + ex.sets.filter((s) => s.completed).length,
      0
    );
    const totalVolumeKg = activeDraft.loggedExercises.reduce(
      (acc, ex) =>
        acc + ex.sets.reduce((sAcc, st) => (st.completed ? sAcc + st.weightKg * st.reps : sAcc), 0),
      0
    );
    const completionRatio = totalSets > 0 ? doneSets / totalSets : 1;
    addSession({
      id: `sess-${Date.now()}`,
      dateISO: new Date().toISOString(),
      workoutDayId: activeDraft.workout.id,
      workoutTitleTh: activeDraft.workout.titleTh,
      phaseNumber: activeDraft.phaseNumber,
      durationMinutes: elapsedMin,
      totalVolumeKg: Math.round(totalVolumeKg),
      estimatedCalories: Math.max(50, Math.round(activeDraft.workout.estimatedCalories * Math.max(0.35, completionRatio))),
      exercises: activeDraft.loggedExercises,
      notes: activeDraft.notes.trim() || undefined,
    });
    clearActiveDraft();
    setActiveTab('history');
  };

  // Library filters
  const [equipmentFilter, setEquipmentFilter] = useState<EquipmentCategory | 'all'>('all');
  const [muscleFilter, setMuscleFilter] = useState<MuscleId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const adaptedProgram = useMemo(
    () => buildAdaptedProgram(profile.daysPerWeek || 3, profile.sessionMinutes || 60),
    [profile.daysPerWeek, profile.sessionMinutes]
  );

  const currentPhase =
    adaptedProgram.find((p) => p.phaseNumber === profile.activePhase) ?? adaptedProgram[0];
  const recommendedWorkout = currentPhase.workouts[sessions.length % currentPhase.workouts.length];

  const filteredExercises = useMemo(() => {
    return EXERCISES.filter((ex) => {
      if (equipmentFilter !== 'all' && ex.equipment !== equipmentFilter) return false;
      if (
        muscleFilter !== 'all' &&
        !ex.primaryMuscles.includes(muscleFilter) &&
        !ex.secondaryMuscles.includes(muscleFilter)
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          ex.nameTh.toLowerCase().includes(q) ||
          ex.nameEn.toLowerCase().includes(q) ||
          ex.equipmentLabelTh.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [equipmentFilter, muscleFilter, searchQuery]);

  const lostKg = Number((profile.startWeightKg - profile.currentWeightKg).toFixed(1));
  const totalGoalKg = Math.max(0.1, profile.startWeightKg - profile.targetWeightKg);
  const goalPct = Math.min(100, Math.max(0, Math.round((lostKg / totalGoalKg) * 100)));

  const navItems: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'หน้าหลัก', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'program', label: 'แผน 6 เดือน', icon: <Target className="w-4 h-4" /> },
    { id: 'library', label: 'ท่าฝึก & คลิป', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'history', label: 'ประวัติ', icon: <Calendar className="w-4 h-4" /> },
    { id: 'progress', label: 'น้ำหนัก & โภชนาการ', icon: <TrendingDown className="w-4 h-4" /> },
  ];

  // Reusable Schedule Customizer Bar
  const ScheduleCustomizer = () => (
    <div className="minimal-card rounded-3xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center shrink-0">
          <SlidersHorizontal className="w-4 h-4 text-pink-500" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#0F0F12]">ปรับตารางเวลาให้เข้ากับชีวิตคุณ</h3>
          <p className="text-xs text-zinc-500">
            ระบบจะจัดตารางและจำนวนเซตให้อัตโนมัติ (ค่าเริ่มต้น 3 วัน/สัปดาห์)
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {/* Days per week */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-500 whitespace-nowrap">จำนวนวัน:</span>
          <div className="flex items-center gap-1 bg-[#FAFAFB] p-1 rounded-xl border border-black/[0.06]">
            {DAY_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => updateProfile({ daysPerWeek: d })}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  profile.daysPerWeek === d
                    ? 'bg-[#0F0F12] text-white'
                    : 'text-zinc-500 hover:text-[#0F0F12]'
                }`}
              >
                {d} วัน
              </button>
            ))}
          </div>
        </div>

        {/* Duration per session */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-500 whitespace-nowrap">ครั้งละ:</span>
          <div className="flex items-center gap-1 bg-[#FAFAFB] p-1 rounded-xl border border-black/[0.06]">
            {DURATION_OPTIONS.map((opt) => (
              <button
                key={opt.minutes}
                onClick={() => updateProfile({ sessionMinutes: opt.minutes })}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  profile.sessionMinutes === opt.minutes
                    ? 'bg-pink-500 text-white'
                    : 'text-zinc-500 hover:text-[#0F0F12]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFB] text-[#0F0F12] pb-24 md:pb-12">
      {/* Top Minimal White Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-black/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0F0F12] flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-pink-400" />
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight text-[#0F0F12] leading-none">
                CondoFit <span className="text-pink-500">Pro</span>
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5 font-medium">
                {profile.daysPerWeek} วัน/สัปดาห์ · 78 → 68 กก.
              </div>
            </div>
          </div>

          {/* Desktop Minimal Pill Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-[#FAFAFB] p-1 rounded-2xl border border-black/[0.06]">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-[#0F0F12] text-white'
                    : 'text-zinc-500 hover:text-[#0F0F12] hover:bg-white'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <button
            onClick={() =>
              setActiveWorkout({ workout: recommendedWorkout, phaseNumber: currentPhase.phaseNumber })
            }
            className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            เริ่มเล่นเลย
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* AUTO-SAVED IN-PROGRESS WORKOUT RESUME BANNER */}
        {activeDraft && !activeWorkout && (() => {
          const doneSets = activeDraft.loggedExercises.reduce(
            (a, ex) => a + ex.sets.filter((s) => s.completed).length,
            0
          );
          const totalSets = activeDraft.loggedExercises.reduce((a, ex) => a + ex.sets.length, 0);
          return (
            <div className="rounded-2xl bg-[#0F0F12] text-white p-4 sm:p-5 border border-pink-500/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                    <span className="text-xs font-bold text-pink-400">
                      มีเซสชันที่เล่นค้างไว้ (บันทึกอัตโนมัติแล้ว · {doneSets}/{totalSets} เซต)
                    </span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-white mt-0.5">
                    {activeDraft.workout.titleTh}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() =>
                    setActiveWorkout({
                      workout: activeDraft.workout,
                      phaseNumber: activeDraft.phaseNumber,
                      resumeDraft: true,
                    })
                  }
                  className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> เล่นต่อจากที่ค้าง
                </button>
                <button
                  onClick={handleQuickSaveDraft}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-pink-300" /> บันทึกเข้าประวัติเลย
                </button>
                <button
                  onClick={clearActiveDraft}
                  className="p-2 rounded-xl text-zinc-400 hover:text-pink-400 hover:bg-white/10 cursor-pointer transition"
                  title="ลบเซสชันค้างนี้"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })()}

        {/* ==================== TAB 1: DASHBOARD ==================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Hero Minimal White + Pink + Black Banner */}
            <section className="relative overflow-hidden rounded-3xl bg-white border border-black/[0.07] p-6 sm:p-8 shadow-[0_4px_24px_rgba(15,15,18,0.04)]">
              <div className="absolute -right-20 -top-20 w-72 h-72 bg-pink-200/35 rounded-full blur-3xl pointer-events-none" />
              <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 space-y-3.5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-xs font-semibold text-pink-600">
                    <Sparkles className="w-3.5 h-3.5" />
                    ออกแบบเฉพาะฟิตเนสคอนโดของคุณ · {currentPhase.frequencyLabel}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F0F12] leading-tight tracking-tight">
                    ภารกิจสร้างกล้าม + ลีนหุ่น{' '}
                    <span className="text-pink-500">78 → 68 กก.</span>
                  </h1>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    ตอนนี้คุณอยู่ใน <strong className="text-[#0F0F12]">{currentPhase.titleTh}</strong> ({currentPhase.monthsLabel}) —
                    จัดสรรแผนแบบลงตัวสำหรับ {profile.daysPerWeek} วัน/สัปดาห์ ครั้งละ {profile.sessionMinutes} นาที
                  </p>

                  {/* Weight Progress Bar */}
                  <div className="pt-2 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 font-medium">ความคืบหน้าเป้าหมาย 6 เดือน</span>
                      <span className="font-bold text-[#0F0F12]">
                        {profile.currentWeightKg} กก. / เป้า <span className="text-pink-600">{profile.targetWeightKg} กก.</span> ({goalPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#0F0F12] to-pink-500 transition-all duration-500 rounded-full"
                        style={{ width: `${Math.max(4, goalPct)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Today's Recommended Workout Card (Sleek Black Accent Card) */}
                <div className="lg:col-span-5 rounded-2xl bg-[#0F0F12] text-white p-5 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-pink-400">
                      โปรแกรมแนะนำวันนี้
                    </span>
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> ~{recommendedWorkout.estimatedMinutes} นาที
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{recommendedWorkout.titleTh}</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">{recommendedWorkout.subtitleTh}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recommendedWorkout.focusMuscles.map((m) => (
                      <span
                        key={m}
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-pink-200"
                      >
                        {MUSCLE_INFO[m].nameTh}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() =>
                        setActiveWorkout({ workout: recommendedWorkout, phaseNumber: currentPhase.phaseNumber })
                      }
                      className="flex-1 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition"
                    >
                      <Play className="w-4 h-4 fill-current" /> เริ่มออกกำลังกาย
                    </button>
                    <button
                      onClick={() => setActiveTab('program')}
                      className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white cursor-pointer"
                    >
                      ดูตาราง
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Flexible Schedule Customizer right on Dashboard */}
            <ScheduleCustomizer />

            {/* Quick KPI Stats */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="minimal-card rounded-2xl p-4">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span>เวทสัปดาห์นี้</span>
                  <Activity className="w-4 h-4 text-pink-500" />
                </div>
                <div className="text-2xl font-extrabold text-[#0F0F12]">
                  {weeklyStats.workoutsThisWeek}{' '}
                  <span className="text-xs font-medium text-zinc-400">/ {profile.daysPerWeek} วัน</span>
                </div>
              </div>
              <div className="minimal-card rounded-2xl p-4">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span>Volume สัปดาห์นี้</span>
                  <Dumbbell className="w-4 h-4 text-[#0F0F12]" />
                </div>
                <div className="text-2xl font-extrabold text-[#0F0F12]">
                  {weeklyStats.volumeThisWeek.toLocaleString()}{' '}
                  <span className="text-xs font-medium text-zinc-400">กก.</span>
                </div>
              </div>
              <div className="minimal-card rounded-2xl p-4">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span>เผาผลาญสัปดาห์นี้</span>
                  <Flame className="w-4 h-4 text-pink-500" />
                </div>
                <div className="text-2xl font-extrabold text-[#0F0F12]">
                  {weeklyStats.caloriesThisWeek.toLocaleString()}{' '}
                  <span className="text-xs font-medium text-zinc-400">kcal</span>
                </div>
              </div>
              <div className="minimal-card rounded-2xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span>ดื่มน้ำวันนี้</span>
                  <Droplets className="w-4 h-4 text-pink-500" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xl font-extrabold text-[#0F0F12]">
                    {(profile.dailyWaterMl / 1000).toFixed(2)} L
                  </div>
                  <button
                    onClick={() => addWater(250)}
                    className="px-2.5 py-1 rounded-lg bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-600 text-xs font-bold cursor-pointer transition"
                  >
                    +250ml
                  </button>
                </div>
              </div>
            </section>

            {/* Muscle Recovery Heatmap + Condo Equipment */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-5 minimal-card rounded-3xl p-5">
                <div className="text-center mb-3">
                  <h2 className="text-base font-bold text-[#0F0F12]">แผนที่กล้ามเนื้อ (7 วันล่าสุด)</h2>
                  <p className="text-xs text-zinc-400">แตะมัดกล้ามเนื้อเพื่อค้นหาท่าฝึกจากอุปกรณ์คอนโด</p>
                </div>
                <MuscleMap
                  heatMap={weeklyMuscleHeatmap}
                  onSelectMuscle={(m) => {
                    setMuscleFilter(m);
                    setEquipmentFilter('all');
                    setActiveTab('library');
                  }}
                />
              </div>

              <div className="lg:col-span-7 minimal-card rounded-3xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div>
                      <h2 className="text-base font-bold text-[#0F0F12]">อุปกรณ์ในฟิตเนสคอนโดของคุณ (6 สถานี)</h2>
                      <p className="text-xs text-zinc-400">เลือกอุปกรณ์เพื่อดูคลิป Animation สอนเล่นทุกท่า</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('library')}
                      className="text-xs font-semibold text-pink-600 hover:text-pink-700 cursor-pointer"
                    >
                      ดูทั้งหมด ({EXERCISES.length} ท่า) →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {EQUIPMENT_LIST.map((eq) => {
                      const count = EXERCISES.filter((e) => e.equipment === eq.id).length;
                      return (
                        <button
                          key={eq.id}
                          onClick={() => {
                            setEquipmentFilter(eq.id);
                            setMuscleFilter('all');
                            setActiveTab('library');
                          }}
                          className="text-left p-4 rounded-2xl bg-[#FAFAFB] hover:bg-pink-50/50 border border-black/[0.06] hover:border-pink-300 transition cursor-pointer group"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${eq.badgeColor}`}>
                              {count} ท่าฝึก
                            </span>
                            <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-pink-500 transition" />
                          </div>
                          <div className="text-sm font-bold text-[#0F0F12]">{eq.nameTh}</div>
                          <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2">{eq.descriptionTh}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ==================== TAB 2: 6-MONTH PROGRAM ==================== */}
        {activeTab === 'program' && (
          <div className="space-y-6">
            {/* Schedule Customizer */}
            <ScheduleCustomizer />

            {/* Phase Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {adaptedProgram.map((phase) => {
                const isActive = phase.phaseNumber === profile.activePhase;
                return (
                  <button
                    key={phase.id}
                    onClick={() => updateProfile({ activePhase: phase.phaseNumber })}
                    className={`text-left p-4 rounded-2xl border transition cursor-pointer ${
                      isActive
                        ? 'bg-[#0F0F12] border-[#0F0F12] text-white shadow-md'
                        : 'minimal-card hover:border-pink-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${isActive ? 'text-pink-400' : 'text-pink-600'}`}>
                        {phase.monthsLabel} ({phase.weeksLabel})
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive ? 'bg-pink-500 text-white' : 'bg-pink-50 text-pink-600 border border-pink-200'
                        }`}
                      >
                        {phase.targetWeightRange}
                      </span>
                    </div>
                    <div className={`text-sm font-bold ${isActive ? 'text-white' : 'text-[#0F0F12]'}`}>
                      {phase.titleTh}
                    </div>
                    <div className={`text-[11px] mt-1 ${isActive ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      {phase.frequencyLabel}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Phase Strategy Banner */}
            <div className="minimal-card rounded-3xl p-5 space-y-3">
              <h2 className="text-lg font-bold text-[#0F0F12]">{currentPhase.titleTh}</h2>
              <p className="text-sm text-zinc-600">{currentPhase.goalTh}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-pink-50/70 border border-pink-200 text-xs text-pink-950">
                  🍽️ <strong>โภชนาการ:</strong> {currentPhase.calorieStrategyTh}
                </div>
                <div className="p-3 rounded-xl bg-[#FAFAFB] border border-black/[0.08] text-xs text-zinc-700">
                  🚴 <strong>คาร์ดิโอ:</strong> {currentPhase.cardioStrategyTh}
                </div>
              </div>
            </div>

            {/* Workout Days Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {currentPhase.workouts.map((day) => (
                <div key={day.id} className="minimal-card rounded-3xl p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-pink-600">{day.dayLabel}</span>
                        <h3 className="text-lg font-bold text-[#0F0F12]">{day.titleTh}</h3>
                        <p className="text-xs text-zinc-500">{day.subtitleTh}</p>
                      </div>
                      <div className="text-right text-xs text-zinc-500 shrink-0">
                        <div className="font-semibold text-[#0F0F12]">~{day.estimatedMinutes} นาที</div>
                        <div className="text-pink-600 font-semibold">~{day.estimatedCalories} kcal</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {day.exercises.map((item, idx) => {
                        const ex = EXERCISE_MAP[item.exerciseId];
                        if (!ex) return null;
                        return (
                          <div
                            key={item.exerciseId + idx}
                            onClick={() => setSelectedExercise(ex)}
                            className="p-3 rounded-xl bg-[#FAFAFB] hover:bg-pink-50/60 border border-black/[0.05] hover:border-pink-300 flex items-center justify-between gap-3 cursor-pointer transition group"
                          >
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-[#0F0F12] group-hover:text-pink-600 transition truncate">
                                {idx + 1}. {ex.nameTh}
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                <span className="text-[11px] text-zinc-500">{ex.equipmentLabelTh}</span>
                                <span className="text-zinc-300">•</span>
                                {ex.primaryMuscles.map((m) => (
                                  <span
                                    key={m}
                                    className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-pink-100 text-pink-700"
                                  >
                                    {MUSCLE_INFO[m].nameTh}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-xs font-bold text-[#0F0F12]">
                                {item.sets} × {item.reps}
                              </div>
                              <div className="text-[10px] text-pink-600 font-semibold">ดูคลิปสอน →</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveWorkout({ workout: day, phaseNumber: currentPhase.phaseNumber })}
                    className="w-full py-3 rounded-2xl bg-[#0F0F12] hover:bg-pink-500 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    <Play className="w-4 h-4 fill-current" /> เริ่มออกกำลังกายวันนี้
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB 3: EXERCISE LIBRARY ==================== */}
        {activeTab === 'library' && (
          <div className="space-y-5">
            <div className="minimal-card rounded-3xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-[#0F0F12]">
                    คลังท่าออกกำลังกาย + คลิป Animation ({filteredExercises.length} ท่า)
                  </h2>
                  <p className="text-xs text-zinc-500">
                    คลิกที่ท่าใดก็ได้เพื่อดู Animation สอนฟอร์มและไฮไลต์กล้ามเนื้อชัดเจน
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ค้นหาท่าหรือเครื่อง..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAFAFB] border border-black/[0.08] text-sm text-[#0F0F12] focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Equipment Filter Pills */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setEquipmentFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                    equipmentFilter === 'all'
                      ? 'bg-[#0F0F12] text-white'
                      : 'bg-[#FAFAFB] text-zinc-600 border border-black/[0.06] hover:border-pink-300'
                  }`}
                >
                  ทุกอุปกรณ์ ({EXERCISES.length})
                </button>
                {EQUIPMENT_LIST.map((eq) => (
                  <button
                    key={eq.id}
                    onClick={() => setEquipmentFilter(eq.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                      equipmentFilter === eq.id
                        ? 'bg-[#0F0F12] text-white'
                        : 'bg-[#FAFAFB] text-zinc-600 border border-black/[0.06] hover:border-pink-300'
                    }`}
                  >
                    {eq.nameTh}
                  </button>
                ))}
              </div>

              {/* Muscle Filter Pills */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-black/[0.05]">
                <button
                  onClick={() => setMuscleFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                    muscleFilter === 'all'
                      ? 'bg-pink-500 text-white'
                      : 'bg-[#FAFAFB] text-zinc-500 hover:text-[#0F0F12]'
                  }`}
                >
                  ทุกกล้ามเนื้อ
                </button>
                {(
                  [
                    'chest',
                    'lats',
                    'mid_back',
                    'side_delts',
                    'front_delts',
                    'rear_delts',
                    'biceps',
                    'triceps',
                    'quads',
                    'hamstrings',
                    'glutes',
                    'calves',
                    'abs',
                    'cardio',
                  ] as MuscleId[]
                ).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMuscleFilter(m)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                      muscleFilter === m
                        ? 'bg-pink-500 text-white'
                        : 'bg-[#FAFAFB] text-zinc-500 hover:text-[#0F0F12]'
                    }`}
                  >
                    {MUSCLE_INFO[m].nameTh}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExercises.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => setSelectedExercise(ex)}
                  className="minimal-card minimal-card-hover rounded-2xl p-4 cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FAFAFB] text-zinc-600 border border-black/[0.08] truncate">
                        {ex.equipmentLabelTh}
                      </span>
                      <span className="text-[11px] font-bold text-pink-600 shrink-0">▶ ดู Animation</span>
                    </div>
                    <h3 className="text-base font-bold text-[#0F0F12] leading-snug">{ex.nameTh}</h3>
                    <p className="text-xs text-zinc-400">{ex.nameEn}</p>
                  </div>

                  <div className="space-y-2.5 pt-2 border-t border-black/[0.05]">
                    <div className="flex flex-wrap gap-1">
                      {ex.primaryMuscles.map((m) => (
                        <span
                          key={m}
                          className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-pink-500 text-white"
                        >
                          ● {MUSCLE_INFO[m].nameTh}
                        </span>
                      ))}
                      {ex.secondaryMuscles.slice(0, 2).map((m) => (
                        <span
                          key={m}
                          className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-pink-50 text-pink-700 border border-pink-200"
                        >
                          {MUSCLE_INFO[m].nameTh}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-500">
                      <span>
                        แนะนำ: <strong className="text-[#0F0F12]">{ex.defaultSets} × {ex.defaultReps}</strong>
                      </span>
                      <span>ระดับ: {ex.difficulty}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB 4: HISTORY ==================== */}
        {activeTab === 'history' && (
          <HistoryView
            sessions={sessions}
            personalRecords={personalRecords}
            onDeleteSession={deleteSession}
          />
        )}

        {/* ==================== TAB 5: PROGRESS & TOOLS ==================== */}
        {activeTab === 'progress' && (
          <ProgressAndToolsView
            profile={profile}
            weights={weights}
            onAddWeight={addWeightEntry}
            onDeleteWeight={deleteWeightEntry}
            onUpdateProfile={updateProfile}
            onAddWater={addWater}
            onExportBackup={exportBackupJson}
            onImportBackup={importBackupJson}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-black/[0.08] px-2 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-semibold transition cursor-pointer ${
                isActive ? 'text-pink-600 bg-pink-50' : 'text-zinc-400'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Exercise Detail Modal */}
      <ExerciseDetailModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />

      {/* Live Workout Mode */}
      {activeWorkout && (
        <LiveWorkoutSession
          workout={activeWorkout.workout}
          phaseNumber={activeWorkout.phaseNumber}
          initialDraft={
            activeWorkout.resumeDraft && activeDraft?.workout.id === activeWorkout.workout.id
              ? activeDraft
              : null
          }
          personalRecords={personalRecords}
          onDraftChange={saveActiveDraft}
          onFinish={(session) => {
            addSession(session);
            clearActiveDraft();
            setActiveWorkout(null);
            setActiveTab('history');
          }}
          onMinimize={() => setActiveWorkout(null)}
          onDiscard={() => {
            clearActiveDraft();
            setActiveWorkout(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
