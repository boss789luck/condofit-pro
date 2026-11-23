import React from 'react';
import { MuscleId } from '../types/fitness';
import { MUSCLE_INFO } from '../data/muscles';

interface MuscleMapProps {
  primaryMuscles?: MuscleId[];
  secondaryMuscles?: MuscleId[];
  heatMap?: Partial<Record<MuscleId, number>>;
  compact?: boolean;
  showLegend?: boolean;
  onSelectMuscle?: (muscle: MuscleId) => void;
}

export const MuscleMap: React.FC<MuscleMapProps> = ({
  primaryMuscles = [],
  secondaryMuscles = [],
  heatMap,
  compact = false,
  showLegend = true,
  onSelectMuscle,
}) => {
  const getMuscleStyle = (id: MuscleId) => {
    if (heatMap) {
      const intensity = heatMap[id] ?? 0;
      if (intensity >= 0.75) {
        return {
          fill: '#EC4899',
          stroke: '#BE185D',
          opacity: 0.96,
          className: 'muscle-primary-glow cursor-pointer transition-all duration-300',
        };
      }
      if (intensity >= 0.35) {
        return {
          fill: '#F9A8D4',
          stroke: '#EC4899',
          opacity: 0.92,
          className: 'cursor-pointer transition-all duration-300',
        };
      }
      if (intensity > 0) {
        return {
          fill: '#FCE7F3',
          stroke: '#F472B6',
          opacity: 0.95,
          className: 'cursor-pointer transition-all duration-300',
        };
      }
      return {
        fill: '#F4F4F6',
        stroke: '#D4D4D8',
        opacity: 1,
        className: 'cursor-pointer hover:fill-pink-100 transition-all duration-200',
      };
    }

    if (primaryMuscles.includes(id)) {
      return {
        fill: '#EC4899',
        stroke: '#BE185D',
        opacity: 0.96,
        className: 'muscle-primary-glow cursor-pointer transition-all duration-300',
      };
    }
    if (secondaryMuscles.includes(id)) {
      return {
        fill: '#F9A8D4',
        stroke: '#EC4899',
        opacity: 0.9,
        className: 'cursor-pointer transition-all duration-300',
      };
    }
    return {
      fill: '#F4F4F6',
      stroke: '#D4D4D8',
      opacity: 1,
      className: 'cursor-pointer hover:fill-pink-50 transition-all duration-200',
    };
  };

  const handleClick = (id: MuscleId) => {
    if (onSelectMuscle) onSelectMuscle(id);
  };

  const renderPart = (id: MuscleId, d: string) => {
    const s = getMuscleStyle(id);
    return (
      <path
        d={d}
        fill={s.fill}
        stroke={s.stroke}
        strokeWidth="1.2"
        opacity={s.opacity}
        className={s.className}
        onClick={() => handleClick(id)}
      >
        <title>{`${MUSCLE_INFO[id].nameTh} (${MUSCLE_INFO[id].nameEn})`}</title>
      </path>
    );
  };

  const svgHeight = compact ? 'h-48' : 'h-64 sm:h-72';

  return (
    <div className="flex flex-col items-center w-full">
      <div className="grid grid-cols-2 gap-3 w-full max-w-md items-center justify-items-center">
        {/* FRONT VIEW */}
        <div className="flex flex-col items-center">
          <span className="text-[11px] uppercase tracking-widest text-zinc-400 font-semibold mb-1.5">
            ด้านหน้า (Front)
          </span>
          <svg viewBox="0 0 200 400" className={`${svgHeight} w-auto select-none`}>
            <circle cx="100" cy="34" r="19" fill="#ECECF0" stroke="#D4D4D8" strokeWidth="1.4" />
            <rect x="91" y="52" width="18" height="16" rx="4" fill="#ECECF0" stroke="#D4D4D8" strokeWidth="1.2" />

            {renderPart('traps', 'M90,60 L68,72 L76,78 L92,70 Z M110,60 L132,72 L124,78 L108,70 Z')}
            {renderPart('chest', 'M99,78 C85,78 70,82 68,97 C67,112 80,118 98,116 Z')}
            {renderPart('chest', 'M101,78 C115,78 130,82 132,97 C133,112 120,118 102,116 Z')}
            {renderPart('front_delts', 'M68,74 C55,76 50,88 53,102 C61,100 66,94 68,85 Z')}
            {renderPart('front_delts', 'M132,74 C145,76 150,88 147,102 C139,100 134,94 132,85 Z')}
            {renderPart('side_delts', 'M56,77 C47,82 44,94 48,105 C53,104 56,96 57,85 Z')}
            {renderPart('side_delts', 'M144,77 C153,82 156,94 152,105 C147,104 144,96 143,85 Z')}
            {renderPart('biceps', 'M52,106 C46,118 44,136 48,148 C56,148 61,134 62,114 Z')}
            {renderPart('biceps', 'M148,106 C154,118 156,136 152,148 C144,148 139,134 138,114 Z')}
            {renderPart('forearms', 'M47,151 C41,168 37,188 39,202 L47,203 C52,188 56,168 57,151 Z')}
            {renderPart('forearms', 'M153,151 C159,168 163,188 161,202 L153,203 C148,188 144,168 143,151 Z')}

            <ellipse cx="42" cy="212" rx="6" ry="10" fill="#ECECF0" stroke="#D4D4D8" strokeWidth="1" />
            <ellipse cx="158" cy="212" rx="6" ry="10" fill="#ECECF0" stroke="#D4D4D8" strokeWidth="1" />

            {renderPart(
              'abs',
              'M87,122 L98,122 L98,138 L87,138 Z M102,122 L113,122 L113,138 L102,138 Z M87,141 L98,141 L98,158 L87,158 Z M102,141 L113,141 L113,158 L102,158 Z M88,161 L98,161 L98,179 L89,179 Z M102,161 L112,161 L111,179 L102,179 Z M90,182 L110,182 L106,198 L94,198 Z'
            )}
            {renderPart('obliques', 'M70,120 L84,123 L85,178 L73,182 C68,162 67,138 70,120 Z')}
            {renderPart('obliques', 'M130,120 L116,123 L115,178 L127,182 C132,162 133,138 130,120 Z')}

            <path d="M74,186 L126,186 L112,214 L88,214 Z" fill="#ECECF0" stroke="#D4D4D8" strokeWidth="1" />

            {renderPart('quads', 'M71,200 C65,228 66,265 73,294 L92,294 C96,264 97,232 95,212 Z')}
            {renderPart('quads', 'M129,200 C135,228 134,265 127,294 L108,294 C104,264 103,232 105,212 Z')}

            <ellipse cx="82" cy="302" rx="10" ry="8" fill="#ECECF0" stroke="#D4D4D8" strokeWidth="1" />
            <ellipse cx="118" cy="302" rx="10" ry="8" fill="#ECECF0" stroke="#D4D4D8" strokeWidth="1" />

            {renderPart('calves', 'M73,312 C69,334 72,358 77,374 L88,374 C92,356 93,332 91,312 Z')}
            {renderPart('calves', 'M127,312 C131,334 128,358 123,374 L112,374 C108,356 107,332 109,312 Z')}

            <ellipse cx="81" cy="384" rx="10" ry="6" fill="#ECECF0" stroke="#D4D4D8" strokeWidth="1" />
            <ellipse cx="119" cy="384" rx="10" ry="6" fill="#ECECF0" stroke="#D4D4D8" strokeWidth="1" />

            {primaryMuscles.includes('cardio') && (
              <g className="muscle-primary-glow">
                <circle cx="107" cy="98" r="11" fill="#EC4899" opacity="0.22" />
                <path
                  d="M107,104 C107,104 99,99 99,94 C99,91.5 101,90 103,90 C105,90 106.5,91.5 107,93 C107.5,91.5 109,90 111,90 C113,90 115,91.5 115,94 C115,99 107,104 107,104 Z"
                  fill="#EC4899"
                />
              </g>
            )}
          </svg>
        </div>

        {/* BACK VIEW */}
        <div className="flex flex-col items-center">
          <span className="text-[11px] uppercase tracking-widest text-zinc-400 font-semibold mb-1.5">
            ด้านหลัง (Back)
          </span>
          <svg viewBox="0 0 200 400" className={`${svgHeight} w-auto select-none`}>
            <circle cx="100" cy="34" r="19" fill="#ECECF0" stroke="#D4D4D8" strokeWidth="1.4" />
            <rect x="91" y="52" width="18" height="16" rx="4" fill="#ECECF0" stroke="#D4D4D8" strokeWidth="1.2" />

            {renderPart('traps', 'M100,58 L72,74 L84,116 L100,126 L116,116 L128,74 Z')}
            {renderPart('rear_delts', 'M70,74 C55,77 48,89 52,104 C61,103 68,97 72,88 Z')}
            {renderPart('rear_delts', 'M130,74 C145,77 152,89 148,104 C139,103 132,97 128,88 Z')}
            {renderPart('mid_back', 'M82,106 L118,106 L114,144 L86,144 Z')}
            {renderPart('lats', 'M68,106 L84,114 L85,158 L74,166 C66,146 64,124 68,106 Z')}
            {renderPart('lats', 'M132,106 L116,114 L115,158 L126,166 C134,146 136,124 132,106 Z')}
            {renderPart('lower_back', 'M84,148 L116,148 L118,184 L82,184 Z')}
            {renderPart('triceps', 'M51,106 C45,120 44,138 49,150 C57,148 62,134 63,114 Z')}
            {renderPart('triceps', 'M149,106 C155,120 156,138 151,150 C143,148 138,134 137,114 Z')}
            {renderPart('forearms', 'M47,153 C41,170 37,188 39,202 L47,203 C52,188 56,170 57,153 Z')}
            {renderPart('forearms', 'M153,153 C159,170 163,188 161,202 L153,203 C148,170 144,170 143,153 Z')}

            <ellipse cx="42" cy="212" rx="6" ry="10" fill="#ECECF0" stroke="#D4D4D8" strokeWidth="1" />
            <ellipse cx="158" cy="212" rx="6" ry="10" fill="#ECECF0" stroke="#D4D4D8" strokeWidth="1" />

            {renderPart('glutes', 'M73,186 L99,186 L99,224 C84,228 71,218 70,202 Z')}
            {renderPart('glutes', 'M127,186 L101,186 L101,224 C116,228 129,218 130,202 Z')}
            {renderPart('hamstrings', 'M71,226 C68,252 69,276 74,296 L93,296 C97,274 97,248 95,226 Z')}
            {renderPart('hamstrings', 'M129,226 C132,252 131,276 126,296 L107,296 C103,274 103,248 105,226 Z')}
            {renderPart('calves', 'M73,308 C67,328 69,352 77,374 L89,374 C94,352 95,328 91,308 Z')}
            {renderPart('calves', 'M127,308 C133,328 131,352 123,374 L111,374 C106,352 105,328 109,308 Z')}

            <ellipse cx="81" cy="384" rx="10" ry="6" fill="#ECECF0" stroke="#D4D4D8" strokeWidth="1" />
            <ellipse cx="119" cy="384" rx="10" ry="6" fill="#ECECF0" stroke="#D4D4D8" strokeWidth="1" />
          </svg>
        </div>
      </div>

      {/* Muscle Tags & Legend */}
      {showLegend && !heatMap && (
        <div className="mt-3 w-full space-y-2">
          {primaryMuscles.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-pink-600 mr-1">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                กล้ามเนื้อหลัก:
              </span>
              {primaryMuscles.map((m) => (
                <span
                  key={m}
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-500 text-white"
                >
                  {MUSCLE_INFO[m].nameTh}
                </span>
              ))}
            </div>
          )}
          {secondaryMuscles.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-500 mr-1">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-300" />
                กล้ามเนื้อรอง:
              </span>
              {secondaryMuscles.map((m) => (
                <span
                  key={m}
                  className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-50 text-pink-700 border border-pink-200"
                >
                  {MUSCLE_INFO[m].nameTh}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {showLegend && heatMap && (
        <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500" /> ฝึกหนักแล้ว
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-300" /> ปานกลาง
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-200 border border-zinc-300" /> พร้อมฝึก
          </span>
        </div>
      )}
    </div>
  );
};
