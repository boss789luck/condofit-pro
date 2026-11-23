import React from 'react';
import { X, AlertTriangle, Sparkles, CheckCircle2, Dumbbell, Clock, Repeat } from 'lucide-react';
import { Exercise } from '../types/fitness';
import { ExerciseAnimator } from './ExerciseAnimator';
import { MuscleMap } from './MuscleMap';

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  onClose: () => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({ exercise, onClose }) => {
  if (!exercise) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-3xl bg-white border border-black/[0.08] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-black/[0.06] bg-[#FAFAFB]">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-pink-50 text-pink-600 border border-pink-200">
                {exercise.equipmentLabelTh}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-900 text-white">
                ระดับ: {exercise.difficulty}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#0F0F12] leading-snug">{exercise.nameTh}</h2>
            <p className="text-xs text-zinc-500">{exercise.nameEn} · ตำแหน่งในคอนโด: {exercise.condoPhotoRef}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white border border-black/[0.08] hover:border-pink-300 text-zinc-500 hover:text-[#0F0F12] transition cursor-pointer shrink-0"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-5 space-y-5 bg-[#FAFAFB]">
          {/* Top Grid: Animation + Anatomical Muscle Highlight */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0F0F12] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pink-500" />
                  คลิป Animation สอนท่าทาง (คุมจังหวะ)
                </h3>
                <span className="text-xs text-zinc-500 font-medium">Tempo: {exercise.tempo}</span>
              </div>
              <ExerciseAnimator
                animationType={exercise.animationType}
                primaryMuscles={exercise.primaryMuscles}
                breathingTip={exercise.breathingTip}
              />

              {/* Quick Specs */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="rounded-2xl bg-white border border-black/[0.06] p-3 text-center">
                  <Repeat className="w-4 h-4 text-pink-500 mx-auto mb-1" />
                  <div className="text-[11px] text-zinc-400">แนะนำ</div>
                  <div className="text-sm font-bold text-[#0F0F12]">
                    {exercise.defaultSets} เซต × {exercise.defaultReps}
                  </div>
                </div>
                <div className="rounded-2xl bg-white border border-black/[0.06] p-3 text-center">
                  <Clock className="w-4 h-4 text-zinc-900 mx-auto mb-1" />
                  <div className="text-[11px] text-zinc-400">พักระหว่างเซต</div>
                  <div className="text-sm font-bold text-[#0F0F12]">
                    {exercise.restSeconds > 0 ? `${exercise.restSeconds} วินาที` : 'ต่อเนื่อง'}
                  </div>
                </div>
                <div className="rounded-2xl bg-white border border-black/[0.06] p-3 text-center">
                  <Dumbbell className="w-4 h-4 text-pink-500 mx-auto mb-1" />
                  <div className="text-[11px] text-zinc-400">จังหวะ</div>
                  <div className="text-sm font-bold text-[#0F0F12]">{exercise.tempo}</div>
                </div>
              </div>
            </div>

            {/* Muscle Highlight Panel */}
            <div className="lg:col-span-5 rounded-2xl bg-white border border-black/[0.06] p-4">
              <h3 className="text-sm font-bold text-[#0F0F12] mb-3 text-center">
                ไฮไลต์กล้ามเนื้อที่ได้จากท่านี้
              </h3>
              <MuscleMap
                primaryMuscles={exercise.primaryMuscles}
                secondaryMuscles={exercise.secondaryMuscles}
              />
            </div>
          </div>

          {/* Step-by-step Form Guide */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white border border-black/[0.06] p-4">
              <h3 className="text-sm font-bold text-[#0F0F12] flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-pink-500" />
                วิธีเล่นทีละขั้นตอน (Step-by-Step)
              </h3>
              <ol className="space-y-2.5">
                {exercise.stepsTh.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-zinc-700 leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-zinc-900 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-white border border-black/[0.08] p-4">
                <h3 className="text-sm font-bold text-[#0F0F12] flex items-center gap-2 mb-2.5">
                  <AlertTriangle className="w-4 h-4 text-pink-500" />
                  ข้อควรระวัง (อย่าทำผิด!)
                </h3>
                <ul className="space-y-2">
                  {exercise.mistakesTh.map((m, idx) => (
                    <li key={idx} className="text-sm text-zinc-600 flex items-start gap-2 leading-relaxed">
                      <span className="text-pink-500 mt-0.5 font-bold">•</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl bg-pink-50/80 border border-pink-200 p-4">
                <h3 className="text-sm font-bold text-pink-700 flex items-center gap-2 mb-1.5">
                  <Sparkles className="w-4 h-4 text-pink-500" />
                  เคล็ดลับระดับโปร (Pro Tip)
                </h3>
                <p className="text-sm text-pink-950/90 leading-relaxed">{exercise.proTipTh}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
