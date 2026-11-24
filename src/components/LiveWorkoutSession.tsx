import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  Flame,
  Plus,
  SkipForward,
  Trophy,
  X,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { ActiveWorkoutDraft, LoggedExercise, WorkoutDay, WorkoutSessionLog } from '../types/fitness';
import { EXERCISE_MAP } from '../data/exercises';
import { ExerciseAnimator } from './ExerciseAnimator';
import { MuscleMap } from './MuscleMap';

interface LiveWorkoutSessionProps {
  workout: WorkoutDay;
  phaseNumber: number;
  initialDraft?: ActiveWorkoutDraft | null;
  personalRecords: Record<string, { maxWeightKg: number; maxReps: number; lastWeightKg: number; lastReps: number }>;
  onDraftChange: (draft: ActiveWorkoutDraft) => void;
  onFinish: (session: WorkoutSessionLog) => void;
  onMinimize: () => void;
  onDiscard: () => void;
}

function playBeep() {
  try {
    const AudioCtx =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch {
    // ignore
  }
}

export const LiveWorkoutSession: React.FC<LiveWorkoutSessionProps> = ({
  workout,
  phaseNumber,
  initialDraft,
  personalRecords,
  onDraftChange,
  onFinish,
  onMinimize,
  onDiscard,
}) => {
  const startedAtRef = useRef<number>(initialDraft?.startedAtMs ?? Date.now());
  const [elapsedSec, setElapsedSec] = useState(() =>
    Math.max(0, Math.floor((Date.now() - startedAtRef.current) / 1000))
  );
  const [restSec, setRestSec] = useState(0);
  const [activeExIdx, setActiveExIdx] = useState(initialDraft?.activeExIdx ?? 0);
  const [showGuide, setShowGuide] = useState(true);
  const [notes, setNotes] = useState(initialDraft?.notes ?? '');
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [showExitMenu, setShowExitMenu] = useState(false);

  const [loggedExercises, setLoggedExercises] = useState<LoggedExercise[]>(() => {
    if (initialDraft?.loggedExercises && initialDraft.loggedExercises.length === workout.exercises.length) {
      return initialDraft.loggedExercises;
    }
    return workout.exercises.map((item) => {
      const pr = personalRecords[item.exerciseId];
      const ex = EXERCISE_MAP[item.exerciseId];
      const defaultW = pr?.lastWeightKg ?? (ex?.isCardio ? 0 : 20);
      const parsedReps = parseInt(item.reps, 10) || 12;
      return {
        exerciseId: item.exerciseId,
        sets: Array.from({ length: item.sets }, (_, i) => ({
          setNumber: i + 1,
          weightKg: defaultW,
          reps: pr?.lastReps ?? parsedReps,
          completed: false,
          isPR: false,
        })),
      };
    });
  });

  // Auto-save draft on every change so swiping away / closing app NEVER loses progress
  useEffect(() => {
    onDraftChange({
      workout,
      phaseNumber,
      startedAtMs: startedAtRef.current,
      activeExIdx,
      loggedExercises,
      notes,
      updatedAtMs: Date.now(),
    });
  }, [workout, phaseNumber, activeExIdx, loggedExercises, notes, onDraftChange]);

  useEffect(() => {
    const syncElapsed = () => {
      setElapsedSec(Math.max(0, Math.floor((Date.now() - startedAtRef.current) / 1000)));
    };
    const id = setInterval(syncElapsed, 1000);
    document.addEventListener('visibilitychange', syncElapsed);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', syncElapsed);
    };
  }, []);

  const prevRestRef = useRef(0);
  useEffect(() => {
    if (restSec <= 0) {
      if (prevRestRef.current === 1) {
        playBeep();
      }
      prevRestRef.current = 0;
      return;
    }
    prevRestRef.current = restSec;
    const id = setTimeout(() => setRestSec((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(id);
  }, [restSec]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const currentItem = workout.exercises[activeExIdx];
  const currentExercise = EXERCISE_MAP[currentItem.exerciseId];
  const currentLog = loggedExercises[activeExIdx];

  const updateSetField = (exIdx: number, setIdx: number, field: 'weightKg' | 'reps', value: number) => {
    setLoggedExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exIdx) return ex;
        return {
          ...ex,
          sets: ex.sets.map((st, j) => (j === setIdx ? { ...st, [field]: Math.max(0, value) } : st)),
        };
      })
    );
  };

  const toggleSetComplete = (exIdx: number, setIdx: number) => {
    const exId = loggedExercises[exIdx].exerciseId;
    const pr = personalRecords[exId];
    const exRest = workout.exercises[exIdx].restSeconds;

    setLoggedExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exIdx) return ex;
        return {
          ...ex,
          sets: ex.sets.map((st, j) => {
            if (j !== setIdx) return st;
            const nextDone = !st.completed;
            const isNewPR = nextDone && st.weightKg > 0 && (!pr || st.weightKg > pr.maxWeightKg);
            if (nextDone && exRest > 0) {
              setRestSec(exRest);
            }
            return { ...st, completed: nextDone, isPR: isNewPR };
          }),
        };
      })
    );
  };

  const addExtraSet = (exIdx: number) => {
    setLoggedExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exIdx) return ex;
        const last = ex.sets[ex.sets.length - 1];
        return {
          ...ex,
          sets: [
            ...ex.sets,
            {
              setNumber: ex.sets.length + 1,
              weightKg: last?.weightKg ?? 20,
              reps: last?.reps ?? 12,
              completed: false,
            },
          ],
        };
      })
    );
  };

  const removeSet = (exIdx: number, setIdx: number) => {
    setLoggedExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exIdx || ex.sets.length <= 1) return ex;
        return {
          ...ex,
          sets: ex.sets
            .filter((_, j) => j !== setIdx)
            .map((st, idx) => ({ ...st, setNumber: idx + 1 })),
        };
      })
    );
  };

  const totalSets = loggedExercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedSets = loggedExercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
    0
  );
  const totalVolumeKg = loggedExercises.reduce(
    (acc, ex) =>
      acc + ex.sets.reduce((sAcc, st) => (st.completed ? sAcc + st.weightKg * st.reps : sAcc), 0),
    0
  );

  const handleCompleteWorkout = () => {
    const durationMinutes = Math.max(1, Math.round(elapsedSec / 60));
    const completionRatio = totalSets > 0 ? completedSets / totalSets : 1;
    const estimatedCalories = Math.max(
      50,
      Math.round(workout.estimatedCalories * Math.max(0.35, completionRatio))
    );

    const session: WorkoutSessionLog = {
      id: `sess-${Date.now()}`,
      dateISO: new Date().toISOString(),
      workoutDayId: workout.id,
      workoutTitleTh: workout.titleTh,
      phaseNumber,
      durationMinutes,
      totalVolumeKg: Math.round(totalVolumeKg),
      estimatedCalories,
      exercises: loggedExercises,
      notes: notes.trim() || undefined,
    };
    onFinish(session);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FAFAFB] flex flex-col overflow-hidden">
      {/* Top Sticky Live Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white border-b border-black/[0.06] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setShowExitMenu(true)}
            className="p-2 rounded-xl bg-[#FAFAFB] border border-black/[0.08] hover:border-pink-300 text-zinc-600 transition cursor-pointer"
            title="พับเก็บหรือออก"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
              <span className="text-xs font-semibold text-pink-600">กำลังเล่น</span>
              <span className="text-xs font-mono text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded-md font-semibold">
                {formatTime(elapsedSec)}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                ✓ บันทึกอัตโนมัติ
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-[#0F0F12] truncate">{workout.titleTh}</h2>
          </div>
        </div>

        <button
          onClick={() => setShowFinishConfirm(true)}
          className="px-4 py-2 rounded-xl bg-[#0F0F12] hover:bg-pink-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer shrink-0"
        >
          <CheckCircle2 className="w-4 h-4" />
          บันทึก & จบเซสชัน
        </button>
      </header>

      {/* Progress Bar */}
      <div className="h-1 bg-zinc-200 w-full shrink-0">
        <div
          className="h-full bg-pink-500 transition-all duration-300"
          style={{ width: `${totalSets > 0 ? (completedSets / totalSets) * 100 : 0}%` }}
        />
      </div>

      {/* Active Rest Timer Floating Banner */}
      {restSec > 0 && (
        <div className="px-4 py-2.5 bg-pink-50 border-b border-pink-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-pink-500 animate-pulse" />
            <div>
              <div className="text-[11px] text-pink-600 font-semibold">เวลาพักระหว่างเซต (Rest Timer)</div>
              <div className="text-xl font-extrabold font-mono text-[#0F0F12] leading-none">
                {formatTime(restSec)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRestSec((s) => s + 15)}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-pink-200 text-xs font-semibold text-zinc-800 cursor-pointer"
            >
              +15 วิ
            </button>
            <button
              onClick={() => setRestSec(0)}
              className="px-3 py-1.5 rounded-lg bg-[#0F0F12] hover:bg-pink-500 text-xs font-bold text-white flex items-center gap-1 cursor-pointer transition"
            >
              <SkipForward className="w-3.5 h-3.5" /> ข้ามพัก
            </button>
          </div>
        </div>
      )}

      {/* Exercise Navigation Pills */}
      <div className="flex items-center gap-2 px-4 sm:px-6 py-3 overflow-x-auto border-b border-black/[0.06] bg-white shrink-0">
        {workout.exercises.map((item, idx) => {
          const ex = EXERCISE_MAP[item.exerciseId];
          const doneCount = loggedExercises[idx].sets.filter((s) => s.completed).length;
          const allDone = doneCount === loggedExercises[idx].sets.length;
          const isActive = idx === activeExIdx;
          return (
            <button
              key={item.exerciseId + idx}
              onClick={() => setActiveExIdx(idx)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition cursor-pointer border ${
                isActive
                  ? 'bg-[#0F0F12] border-[#0F0F12] text-white'
                  : allDone
                  ? 'bg-pink-50 border-pink-200 text-pink-700'
                  : 'bg-[#FAFAFB] border-black/[0.08] text-zinc-600 hover:text-[#0F0F12]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                  isActive ? 'bg-pink-500 text-white' : allDone ? 'bg-pink-500 text-white' : 'bg-zinc-200 text-zinc-700'
                }`}
              >
                {allDone ? <Check className="w-3 h-3" /> : idx + 1}
              </span>
              <span className="max-w-[140px] truncate">{ex?.nameTh}</span>
              <span className="text-[10px] opacity-75">
                {doneCount}/{loggedExercises[idx].sets.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-5xl w-full mx-auto space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-pink-50 text-pink-600 border border-pink-200 mb-1.5">
              {currentExercise.equipmentLabelTh}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-[#0F0F12]">{currentExercise.nameTh}</h3>
            <p className="text-xs text-zinc-500">
              เป้าหมาย: {currentItem.sets} เซต × {currentItem.reps} · Tempo {currentExercise.tempo}
              {currentItem.noteTh ? ` · 💡 ${currentItem.noteTh}` : ''}
            </p>
          </div>
          <button
            onClick={() => setShowGuide((v) => !v)}
            className="px-3 py-2 rounded-xl bg-white hover:border-pink-300 text-xs font-semibold text-zinc-800 flex items-center gap-1.5 cursor-pointer border border-black/[0.08]"
          >
            <Eye className="w-4 h-4 text-pink-500" />
            {showGuide ? 'ซ่อนคลิป & กล้ามเนื้อ' : 'ดูคลิปสอน & กล้ามเนื้อ'}
            {showGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showGuide && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7">
              <ExerciseAnimator
                animationType={currentExercise.animationType}
                primaryMuscles={currentExercise.primaryMuscles}
                breathingTip={currentExercise.breathingTip}
                compact
              />
            </div>
            <div className="lg:col-span-5 rounded-2xl bg-white border border-black/[0.08] p-3.5 flex flex-col justify-center">
              <MuscleMap
                primaryMuscles={currentExercise.primaryMuscles}
                secondaryMuscles={currentExercise.secondaryMuscles}
                compact
              />
            </div>
          </div>
        )}

        {/* Set-by-Set Logging Table */}
        <div className="minimal-card rounded-3xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-[#0F0F12]">บันทึกเซต & น้ำหนัก (Progressive Overload)</h4>
            {personalRecords[currentExercise.id] && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200">
                <Trophy className="w-3.5 h-3.5" />
                สถิติสูงสุด (PR): {personalRecords[currentExercise.id].maxWeightKg} กก.
              </span>
            )}
          </div>

          <div className="space-y-2.5">
            <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-zinc-400 px-2 uppercase">
              <div className="col-span-2">เซต</div>
              <div className="col-span-4">{currentExercise.isCardio ? 'ระดับ (Level)' : 'น้ำหนัก (กก.)'}</div>
              <div className="col-span-3">{currentExercise.isCardio ? 'นาที' : 'จำนวนครั้ง'}</div>
              <div className="col-span-3 text-right">สำเร็จ</div>
            </div>

            {currentLog.sets.map((st, sIdx) => (
              <div
                key={sIdx}
                className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl border transition ${
                  st.completed ? 'bg-pink-50/70 border-pink-200' : 'bg-[#FAFAFB] border-black/[0.05]'
                }`}
              >
                <div className="col-span-2 flex items-center gap-1.5">
                  <span className="w-7 h-7 rounded-lg bg-white border border-black/[0.08] flex items-center justify-center text-xs font-bold text-[#0F0F12]">
                    {st.setNumber}
                  </span>
                  {st.isPR && (
                    <span className="px-1.5 py-0.5 rounded bg-pink-500 text-white text-[10px] font-extrabold">
                      PR!
                    </span>
                  )}
                </div>

                <div className="col-span-4">
                  <input
                    type="number"
                    step="2.5"
                    min="0"
                    value={st.weightKg}
                    onChange={(e) =>
                      updateSetField(activeExIdx, sIdx, 'weightKg', parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white border border-black/[0.1] text-sm font-bold text-[#0F0F12] text-center focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div className="col-span-3">
                  <input
                    type="number"
                    min="1"
                    value={st.reps}
                    onChange={(e) =>
                      updateSetField(activeExIdx, sIdx, 'reps', parseInt(e.target.value, 10) || 0)
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white border border-black/[0.1] text-sm font-bold text-[#0F0F12] text-center focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div className="col-span-3 flex items-center justify-end gap-1.5">
                  {currentLog.sets.length > 1 && (
                    <button
                      onClick={() => removeSet(activeExIdx, sIdx)}
                      className="p-2 rounded-lg text-zinc-400 hover:text-pink-600 hover:bg-pink-50 cursor-pointer"
                      title="ลบเซต"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => toggleSetComplete(activeExIdx, sIdx)}
                    className={`px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1 transition cursor-pointer ${
                      st.completed
                        ? 'bg-pink-500 text-white'
                        : 'bg-[#0F0F12] hover:bg-pink-500 text-white'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    {st.completed ? 'เสร็จ' : 'ติ๊ก'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={() => addExtraSet(activeExIdx)}
              className="px-3 py-1.5 rounded-lg bg-[#FAFAFB] border border-black/[0.08] hover:border-pink-300 text-xs font-semibold text-zinc-700 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> เพิ่มเซต
            </button>

            {activeExIdx < workout.exercises.length - 1 && (
              <button
                onClick={() => setActiveExIdx((i) => i + 1)}
                className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-xs font-bold text-white cursor-pointer"
              >
                ท่าถัดไป →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Live Stats Footer */}
      <footer className="px-4 sm:px-6 py-3 bg-white border-t border-black/[0.06] flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-zinc-500">
            เซตสำเร็จ: <strong className="text-[#0F0F12]">{completedSets}/{totalSets}</strong>
          </span>
          <span className="text-zinc-500">
            Volume รวม: <strong className="text-pink-600">{totalVolumeKg.toLocaleString()} กก.</strong>
          </span>
        </div>
        <button
          onClick={() => setRestSec(90)}
          className="px-3 py-1.5 rounded-lg bg-[#FAFAFB] border border-black/[0.08] hover:border-pink-300 text-zinc-800 font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <Clock className="w-3.5 h-3.5 text-pink-500" /> จับเวลาพัก 90 วิ
        </button>
      </footer>

      {/* Finish Summary Modal */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-60 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white border border-black/[0.08] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center">
                <Flame className="w-6 h-6 text-pink-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0F0F12]">เยี่ยมมาก! พร้อมบันทึกผล?</h3>
                <p className="text-xs text-zinc-500">{workout.titleTh}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-xl bg-[#FAFAFB] border border-black/[0.06]">
                <div className="text-xs text-zinc-400">เวลา</div>
                <div className="text-base font-bold text-[#0F0F12]">{Math.max(1, Math.round(elapsedSec / 60))} นาที</div>
              </div>
              <div className="p-3 rounded-xl bg-[#FAFAFB] border border-black/[0.06]">
                <div className="text-xs text-zinc-400">เซต</div>
                <div className="text-base font-bold text-pink-600">{completedSets}/{totalSets}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#FAFAFB] border border-black/[0.06]">
                <div className="text-xs text-zinc-400">Volume</div>
                <div className="text-base font-bold text-[#0F0F12]">{totalVolumeKg.toLocaleString()} กก.</div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1.5">
                โน้ตเพิ่มเติม (เช่น วันนี้แรงดี, เพิ่มน้ำหนัก Smith Bench)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="จดความรู้สึกหลังเล่น..."
                className="w-full px-3 py-2 rounded-xl bg-[#FAFAFB] border border-black/[0.1] text-sm text-[#0F0F12] focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-sm font-semibold text-zinc-700 cursor-pointer"
              >
                เล่นต่อ
              </button>
              <button
                onClick={handleCompleteWorkout}
                className="flex-1 py-2.5 rounded-xl bg-[#0F0F12] hover:bg-pink-500 text-sm font-bold text-white cursor-pointer transition"
              >
                บันทึกประวัติเลย!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit / Minimize Safety Modal */}
      {showExitMenu && (
        <div className="fixed inset-0 z-60 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white border border-black/[0.08] p-6 space-y-4 shadow-2xl">
            <div>
              <h3 className="text-base font-bold text-[#0F0F12]">ต้องการออกจากหน้านี้?</h3>
              <p className="text-xs text-zinc-500 mt-1">
                เซตที่คุณติ๊กไปแล้ว ({completedSets}/{totalSets} เซต) ถูกบันทึกอัตโนมัติไว้ในเครื่องแล้ว ไม่ต้องกลัวหายครับ
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={onMinimize}
                className="w-full py-2.5 rounded-xl bg-[#0F0F12] hover:bg-pink-500 text-white font-bold text-sm cursor-pointer transition"
              >
                พับเก็บไว้ก่อน (กลับมาเล่นต่อได้)
              </button>
              <button
                onClick={() => {
                  setShowExitMenu(false);
                  setShowFinishConfirm(true);
                }}
                className="w-full py-2.5 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 font-bold text-sm cursor-pointer transition"
              >
                บันทึกเข้าประวัติ & จบเซสชัน
              </button>
              <button
                onClick={onDiscard}
                className="w-full py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-rose-600 cursor-pointer transition"
              >
                ยกเลิกและลบทิ้งเซสชันนี้
              </button>
              <button
                onClick={() => setShowExitMenu(false)}
                className="w-full py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold text-zinc-700 cursor-pointer"
              >
                กลับไปเล่นต่อ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
