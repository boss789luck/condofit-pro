import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, Clock, Dumbbell, Flame, Trash2, Trophy } from 'lucide-react';
import { WorkoutSessionLog } from '../types/fitness';
import { EXERCISE_MAP } from '../data/exercises';

interface HistoryViewProps {
  sessions: WorkoutSessionLog[];
  personalRecords: Record<string, { maxWeightKg: number; maxReps: number; lastWeightKg: number; lastReps: number }>;
  onDeleteSession: (id: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  sessions,
  personalRecords,
  onDeleteSession,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(sessions[0]?.id ?? null);

  const prEntries = Object.entries(personalRecords)
    .filter(([, v]) => v.maxWeightKg > 0)
    .sort((a, b) => b[1].maxWeightKg - a[1].maxWeightKg);

  const formatDateTh = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('th-TH', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      {prEntries.length > 0 && (
        <section className="minimal-card rounded-3xl p-5">
          <h2 className="text-base font-bold text-[#0F0F12] flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-pink-500" />
            สถิติสูงสุดส่วนตัว (Personal Records)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {prEntries.slice(0, 8).map(([exId, pr]) => {
              const ex = EXERCISE_MAP[exId];
              return (
                <div
                  key={exId}
                  className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-200/80"
                >
                  <div className="text-xs font-semibold text-zinc-700 truncate">{ex?.nameTh ?? exId}</div>
                  <div className="text-lg font-extrabold text-pink-600 mt-0.5">{pr.maxWeightKg} กก.</div>
                  <div className="text-[11px] text-zinc-500">สูงสุด {pr.maxReps} ครั้ง</div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0F0F12] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-pink-500" />
            ประวัติการออกกำลังกายทั้งหมด ({sessions.length} ครั้ง)
          </h2>
        </div>

        {sessions.length === 0 ? (
          <div className="minimal-card rounded-3xl p-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center mx-auto">
              <Dumbbell className="w-7 h-7 text-pink-400" />
            </div>
            <h3 className="text-base font-bold text-[#0F0F12]">ยังไม่มีประวัติการออกกำลังกาย</h3>
            <p className="text-sm text-zinc-500 max-w-md mx-auto">
              ไปที่หน้า &quot;แผน 6 เดือน&quot; แล้วกดปุ่ม <strong className="text-pink-600">เริ่มออกกำลังกายเลย</strong> ระบบจะบันทึกน้ำหนัก จำนวนครั้ง สถิติ PR และคำนวณ Volume ให้โดยอัตโนมัติครับ
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => {
              const isOpen = expandedId === s.id;
              return (
                <div key={s.id} className="minimal-card rounded-2xl overflow-hidden">
                  <div
                    onClick={() => setExpandedId(isOpen ? null : s.id)}
                    className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-pink-50/30 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-900 text-white">
                          Phase {s.phaseNumber}
                        </span>
                        <span className="text-xs text-zinc-400">{formatDateTh(s.dateISO)}</span>
                      </div>
                      <h3 className="text-base font-bold text-[#0F0F12]">{s.workoutTitleTh}</h3>
                      {s.notes && <p className="text-xs text-zinc-500 mt-0.5">📝 {s.notes}</p>}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 text-xs font-medium">
                        <span className="flex items-center gap-1 text-zinc-600">
                          <Clock className="w-3.5 h-3.5 text-zinc-400" /> {s.durationMinutes} น.
                        </span>
                        <span className="flex items-center gap-1 text-zinc-700">
                          <Dumbbell className="w-3.5 h-3.5 text-pink-500" /> {s.totalVolumeKg.toLocaleString()} กก.
                        </span>
                        <span className="flex items-center gap-1 text-zinc-600">
                          <Flame className="w-3.5 h-3.5 text-pink-500" /> ~{s.estimatedCalories} kcal
                        </span>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-zinc-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-zinc-400" />
                      )}
                    </div>
                  </div>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-4 pt-3 border-t border-black/[0.06] space-y-3 bg-[#FAFAFB]">
                      {s.exercises.map((exLog, idx) => {
                        const info = EXERCISE_MAP[exLog.exerciseId];
                        const doneSets = exLog.sets.filter((st) => st.completed);
                        if (doneSets.length === 0) return null;
                        return (
                          <div key={idx} className="rounded-xl bg-white border border-black/[0.06] p-3">
                            <div className="text-xs font-bold text-[#0F0F12] mb-2">{info?.nameTh ?? exLog.exerciseId}</div>
                            <div className="flex flex-wrap gap-2">
                              {doneSets.map((st) => (
                                <span
                                  key={st.setNumber}
                                  className="px-2.5 py-1 rounded-lg bg-[#FAFAFB] border border-black/[0.08] text-xs text-zinc-700"
                                >
                                  เซต {st.setNumber}: <strong className="text-[#0F0F12]">{st.weightKg} กก.</strong> × {st.reps}
                                  {st.isPR && <span className="ml-1 text-pink-600 font-bold">★ PR</span>}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}

                      <div className="flex justify-end">
                        <button
                          onClick={() => onDeleteSession(s.id)}
                          className="px-3 py-1.5 rounded-lg text-xs text-pink-600 hover:bg-pink-50 flex items-center gap-1 cursor-pointer font-semibold"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> ลบประวัตินี้
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
