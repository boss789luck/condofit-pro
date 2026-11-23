import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Wind } from 'lucide-react';
import { AnimationType, MuscleId } from '../types/fitness';

interface ExerciseAnimatorProps {
  animationType: AnimationType;
  primaryMuscles: MuscleId[];
  breathingTip?: string;
  compact?: boolean;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function getRepPhase(cycle: number): { p: number; phaseLabel: string; breathLabel: string; isPeak: boolean } {
  const smooth = (x: number) => x * x * (3 - 2 * x);
  if (cycle < 0.36) {
    const t = smooth(cycle / 0.36);
    return { p: t, phaseLabel: 'ออกแรง (Concentric)', breathLabel: 'หายใจออก', isPeak: t > 0.85 };
  }
  if (cycle < 0.50) {
    return { p: 1, phaseLabel: 'เกร็งค้าง 1 วิ (Peak)', breathLabel: 'เกร็งกล้ามเนื้อ', isPeak: true };
  }
  if (cycle < 0.94) {
    const t = smooth((cycle - 0.50) / 0.44);
    return { p: 1 - t, phaseLabel: 'ผ่อนช้าๆ (Eccentric)', breathLabel: 'หายใจเข้า', isPeak: false };
  }
  return { p: 0, phaseLabel: 'เตรียมรอบถัดไป', breathLabel: 'หายใจเข้า', isPeak: false };
}

export const ExerciseAnimator: React.FC<ExerciseAnimatorProps> = ({
  animationType,
  primaryMuscles,
  breathingTip,
  compact = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<number>(1);
  const [cycle, setCycle] = useState(0);
  const [repCount, setRepCount] = useState(1);
  const lastTimeRef = useRef<number | null>(null);
  const cycleRef = useRef(0);

  useEffect(() => {
    if (!isPlaying) {
      lastTimeRef.current = null;
      return;
    }
    let rafId = 0;
    const durationMs = animationType === 'recumbent_bike' ? 1100 : 3400;

    const tick = (now: number) => {
      if (lastTimeRef.current !== null) {
        const dt = now - lastTimeRef.current;
        const next = cycleRef.current + (dt * speed) / durationMs;
        if (next >= 1) {
          cycleRef.current = next % 1;
          setRepCount((r) => (r >= 12 ? 1 : r + 1));
        } else {
          cycleRef.current = next;
        }
        setCycle(cycleRef.current);
      }
      lastTimeRef.current = now;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, speed, animationType]);

  const { p, phaseLabel, breathLabel, isPeak } =
    animationType === 'recumbent_bike'
      ? { p: cycle, phaseLabel: 'ปั่นต่อเนื่อง Zone 2', breathLabel: 'หายใจสม่ำเสมอ 80 RPM', isPeak: true }
      : getRepPhase(cycle);

  const glowOpacity = 0.5 + p * 0.5;
  const glowRadius = 5 + p * 7;

  // Minimalist Charcoal-Black Athlete + Vibrant Pink Target Muscle
  const Limb = ({
    x1,
    y1,
    x2,
    y2,
    width = 13,
    highlight = false,
  }: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width?: number;
    highlight?: boolean;
  }) => (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={highlight ? '#EC4899' : '#18181B'}
        strokeWidth={width}
        strokeLinecap="round"
        opacity={highlight ? glowOpacity : 0.92}
      />
      {highlight && (
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#F9A8D4"
          strokeWidth={width * 0.4}
          strokeLinecap="round"
          opacity={0.75}
        />
      )}
      <circle cx={x1} cy={y1} r={width * 0.34} fill="#FFFFFF" opacity="0.28" />
    </g>
  );

  const MuscleGlow = ({ cx, cy, r = 11 }: { cx: number; cy: number; r?: number }) => (
    <g>
      <circle cx={cx} cy={cy} r={r + glowRadius * 0.65} fill="#EC4899" opacity={glowOpacity * 0.28} />
      <circle cx={cx} cy={cy} r={r * 0.72} fill="#EC4899" opacity={glowOpacity} />
    </g>
  );

  const renderScene = () => {
    switch (animationType) {
      case 'smith_bench_press':
      case 'smith_incline_press': {
        const isIncline = animationType === 'smith_incline_press';
        const barY = isIncline ? lerp(114, 72, p) : lerp(142, 92, p);
        const shoulderX = isIncline ? 158 : 146;
        const shoulderY = isIncline ? 132 : 162;
        const hipX = 205;
        const hipY = 172;
        const handX = isIncline ? 168 : 156;
        const handY = barY;
        const elbowX = lerp(shoulderX - 10, (shoulderX + handX) / 2 - 4, p);
        const elbowY = lerp(shoulderY + 26, (shoulderY + handY) / 2 + 8, p);

        return (
          <g>
            <rect x="148" y="28" width="8" height="204" rx="2" fill="#D4D4D8" />
            <rect x="172" y="28" width="5" height="204" fill="#E4E4E7" />
            <rect x="120" y="28" width="90" height="8" rx="3" fill="#A1A1AA" />
            {isIncline ? (
              <g>
                <line x1="138" y1="120" x2="195" y2="178" stroke="#52525B" strokeWidth="14" strokeLinecap="round" />
                <line x1="192" y1="178" x2="230" y2="178" stroke="#52525B" strokeWidth="12" strokeLinecap="round" />
                <line x1="162" y1="150" x2="152" y2="232" stroke="#A1A1AA" strokeWidth="6" />
                <line x1="215" y1="180" x2="215" y2="232" stroke="#A1A1AA" strokeWidth="6" />
              </g>
            ) : (
              <g>
                <rect x="118" y="172" width="112" height="12" rx="5" fill="#52525B" />
                <line x1="135" y1="184" x2="135" y2="232" stroke="#A1A1AA" strokeWidth="6" />
                <line x1="212" y1="184" x2="212" y2="232" stroke="#A1A1AA" strokeWidth="6" />
              </g>
            )}
            <circle cx={isIncline ? 142 : 122} cy={isIncline ? 110 : 156} r="13" fill="#0F0F12" />
            <Limb x1={shoulderX} y1={shoulderY} x2={hipX} y2={hipY} width={18} />
            <Limb x1={hipX} y1={hipY} x2={236} y2={196} width={14} />
            <Limb x1={236} y1={196} x2={240} y2={230} width={12} />
            <MuscleGlow cx={shoulderX + 8} cy={shoulderY - 2} r={13} />
            <Limb x1={shoulderX} y1={shoulderY} x2={elbowX} y2={elbowY} width={11} highlight={primaryMuscles.includes('front_delts')} />
            <Limb x1={elbowX} y1={elbowY} x2={handX} y2={handY} width={10} />
            <circle cx={handX} cy={barY} r="20" fill="#FFFFFF" stroke="#EC4899" strokeWidth="3.5" />
            <circle cx={handX} cy={barY} r="5.5" fill="#0F0F12" />
          </g>
        );
      }

      case 'smith_squat': {
        const depth = 1 - p;
        const hipY = lerp(132, 174, depth);
        const hipX = lerp(180, 152, depth);
        const shoulderY = lerp(74, 118, depth);
        const shoulderX = lerp(184, 176, depth);
        const kneeX = lerp(184, 206, depth);
        const kneeY = lerp(182, 178, depth);
        const footX = 190;

        return (
          <g>
            <rect x="176" y="24" width="7" height="208" fill="#D4D4D8" />
            <rect x="135" y="24" width="90" height="8" rx="3" fill="#A1A1AA" />
            <Limb x1={hipX} y1={hipY} x2={kneeX} y2={kneeY} width={15} highlight />
            <Limb x1={kneeX} y1={kneeY} x2={footX} y2={228} width={12} />
            <MuscleGlow cx={(hipX + kneeX) / 2} cy={(hipY + kneeY) / 2 - 4} r={13} />
            <MuscleGlow cx={hipX - 4} cy={hipY + 2} r={11} />
            <Limb x1={shoulderX} y1={shoulderY} x2={hipX} y2={hipY} width={17} />
            <circle cx={shoulderX + 4} cy={shoulderY - 19} r="13" fill="#0F0F12" />
            <Limb x1={shoulderX} y1={shoulderY + 4} x2={shoulderX - 12} y2={shoulderY + 26} width={10} />
            <Limb x1={shoulderX - 12} y1={shoulderY + 26} x2={shoulderX - 2} y2={shoulderY + 2} width={9} />
            <circle cx={shoulderX - 2} cy={shoulderY} r="20" fill="#FFFFFF" stroke="#EC4899" strokeWidth="3.5" />
            <circle cx={shoulderX - 2} cy={shoulderY} r="5" fill="#0F0F12" />
          </g>
        );
      }

      case 'smith_rdl': {
        const hinge = 1 - p;
        const hipX = lerp(175, 148, hinge);
        const hipY = lerp(134, 144, hinge);
        const shoulderX = lerp(177, 210, hinge);
        const shoulderY = lerp(76, 128, hinge);
        const barY = lerp(140, 192, hinge);
        const barX = 198;

        return (
          <g>
            <rect x="195" y="24" width="7" height="208" fill="#D4D4D8" />
            <Limb x1={hipX} y1={hipY} x2={182} y2={184} width={15} highlight />
            <Limb x1={182} y1={184} x2={182} y2={228} width={12} />
            <MuscleGlow cx={(hipX + 182) / 2 - 4} cy={(hipY + 184) / 2} r={12} />
            <MuscleGlow cx={hipX - 4} cy={hipY} r={11} />
            <Limb x1={shoulderX} y1={shoulderY} x2={hipX} y2={hipY} width={17} />
            <circle cx={shoulderX + lerp(2, 16, hinge)} cy={shoulderY - lerp(19, 10, hinge)} r="13" fill="#0F0F12" />
            <Limb x1={shoulderX} y1={shoulderY + 4} x2={barX} y2={barY} width={10} />
            <circle cx={barX} cy={barY} r="19" fill="#FFFFFF" stroke="#EC4899" strokeWidth="3.5" />
            <circle cx={barX} cy={barY} r="5" fill="#0F0F12" />
          </g>
        );
      }

      case 'smith_overhead_press':
      case 'db_shoulder_press': {
        const isSmith = animationType === 'smith_overhead_press';
        const handY = lerp(96, 44, p);
        const elbowX = lerp(155, 166, p);
        const elbowY = lerp(122, 82, p);

        return (
          <g>
            {isSmith && <rect x="176" y="20" width="7" height="212" fill="#D4D4D8" />}
            <line x1="150" y1="86" x2="158" y2="178" stroke="#52525B" strokeWidth="13" strokeLinecap="round" />
            <rect x="155" y="174" width="48" height="11" rx="4" fill="#52525B" />
            <line x1="175" y1="185" x2="175" y2="232" stroke="#A1A1AA" strokeWidth="6" />
            <circle cx="170" cy="78" r="13" fill="#0F0F12" />
            <Limb x1={168} y1={98} x2={172} y2={168} width={17} />
            <Limb x1={172} y1={168} x2={214} y2={176} width={14} />
            <Limb x1={214} y1={176} x2={216} y2={228} width={12} />
            <MuscleGlow cx={168} cy={100} r={12} />
            <Limb x1={168} y1={100} x2={elbowX} y2={elbowY} width={11} highlight />
            <Limb x1={elbowX} y1={elbowY} x2={178} y2={handY} width={10} />
            {isSmith ? (
              <g>
                <circle cx="178" cy={handY} r="17" fill="#FFFFFF" stroke="#EC4899" strokeWidth="3.5" />
                <circle cx="178" cy={handY} r="5" fill="#0F0F12" />
              </g>
            ) : (
              <rect x="166" y={handY - 7} width="24" height="14" rx="4" fill="#EC4899" stroke="#0F0F12" strokeWidth="1.5" />
            )}
          </g>
        );
      }

      case 'smith_bent_row': {
        const barY = lerp(186, 134, p);
        const elbowX = lerp(192, 162, p);
        const elbowY = lerp(146, 108, p);

        return (
          <g>
            <rect x="196" y="24" width="7" height="208" fill="#D4D4D8" />
            <Limb x1={144} y1={146} x2={166} y2={186} width={14} />
            <Limb x1={166} y1={186} x2={162} y2={228} width={12} />
            <Limb x1={194} y1={108} x2={144} y2={146} width={18} highlight />
            <circle cx={210} cy={96} r="13" fill="#0F0F12" />
            <MuscleGlow cx={170} cy={122} r={14} />
            <Limb x1={192} y1={112} x2={elbowX} y2={elbowY} width={11} />
            <Limb x1={elbowX} y1={elbowY} x2={198} y2={barY} width={10} />
            <circle cx={198} cy={barY} r="18" fill="#FFFFFF" stroke="#EC4899" strokeWidth="3.5" />
            <circle cx={198} cy={barY} r="5" fill="#0F0F12" />
          </g>
        );
      }

      case 'smith_calf_raise': {
        const lift = lerp(0, 16, p);
        return (
          <g>
            <rect x="176" y="24" width="7" height="208" fill="#D4D4D8" />
            <rect x="166" y="220" width="34" height="12" rx="2" fill="#A1A1AA" />
            <Limb x1={180} y1={134 - lift} x2={180} y2={182 - lift} width={14} />
            <Limb x1={180} y1={182 - lift} x2={180} y2={220 - lift * 0.6} width={12} highlight />
            <MuscleGlow cx={176} cy={200 - lift} r={11} />
            <Limb x1={180} y1={76 - lift} x2={180} y2={134 - lift} width={17} />
            <circle cx={180} cy={56 - lift} r="13" fill="#0F0F12" />
            <circle cx={180} cy={76 - lift} r="18" fill="#FFFFFF" stroke="#EC4899" strokeWidth="3.5" />
          </g>
        );
      }

      case 'lat_pulldown': {
        const barY = lerp(58, 114, p);
        const elbowX = lerp(172, 162, p);
        const elbowY = lerp(88, 134, p);
        const stackY = lerp(165, 118, p);

        return (
          <g>
            <rect x="108" y="26" width="26" height="206" rx="4" fill="#F4F4F6" stroke="#D4D4D8" strokeWidth="1.5" />
            <rect x="112" y={stackY} width="18" height="44" rx="2" fill="#EC4899" />
            <line x1="121" y1="30" x2="188" y2="30" stroke="#A1A1AA" strokeWidth="8" strokeLinecap="round" />
            <line x1="186" y1="32" x2="186" y2={barY} stroke="#71717A" strokeWidth="2.5" strokeDasharray="4 2" />
            <rect x="164" y="176" width="46" height="10" rx="4" fill="#52525B" />
            <line x1="186" y1="186" x2="186" y2="232" stroke="#A1A1AA" strokeWidth="6" />
            <circle cx="182" cy="96" r="13" fill="#0F0F12" />
            <Limb x1={180} y1={116} x2={184} y2={170} width={18} highlight />
            <Limb x1={184} y1={170} x2={222} y2={176} width={14} />
            <Limb x1={222} y1={176} x2={222} y2={228} width={12} />
            <MuscleGlow cx={175} cy={136} r={14} />
            <Limb x1={180} y1={118} x2={elbowX} y2={elbowY} width={11} />
            <Limb x1={elbowX} y1={elbowY} x2={186} y2={barY} width={10} />
            <line x1="166" y1={barY} x2="206" y2={barY} stroke="#EC4899" strokeWidth="6" strokeLinecap="round" />
          </g>
        );
      }

      case 'seated_cable_row': {
        const handleX = lerp(196, 236, p);
        const elbowX = lerp(222, 268, p);
        const elbowY = lerp(152, 158, p);
        const stackY = lerp(165, 122, p);

        return (
          <g>
            <rect x="92" y="28" width="26" height="204" rx="4" fill="#F4F4F6" stroke="#D4D4D8" strokeWidth="1.5" />
            <rect x="96" y={stackY} width="18" height="40" rx="2" fill="#EC4899" />
            <circle cx="122" cy="198" r="7" fill="#A1A1AA" />
            <line x1="126" y1="196" x2={handleX} y2="156" stroke="#71717A" strokeWidth="2.5" strokeDasharray="4 2" />
            <line x1="158" y1="176" x2="158" y2="232" stroke="#A1A1AA" strokeWidth="8" />
            <circle cx="242" cy="108" r="13" fill="#0F0F12" />
            <Limb x1={242} y1={126} x2={244} y2={184} width={18} highlight />
            <Limb x1={244} y1={184} x2={198} y2={194} width={14} />
            <Limb x1={198} y1={194} x2={164} y2={206} width={12} />
            <MuscleGlow cx={248} cy={148} r={14} />
            <Limb x1={240} y1={132} x2={elbowX} y2={elbowY} width={11} />
            <Limb x1={elbowX} y1={elbowY} x2={handleX} y2={156} width={10} />
            <circle cx={handleX} cy="156" r="6" fill="#EC4899" />
          </g>
        );
      }

      case 'machine_chest_press': {
        const handX = lerp(188, 240, p);
        const elbowX = lerp(158, 206, p);
        const elbowY = lerp(136, 128, p);
        const stackY = lerp(165, 120, p);

        return (
          <g>
            <rect x="110" y="28" width="26" height="204" rx="4" fill="#F4F4F6" stroke="#D4D4D8" strokeWidth="1.5" />
            <rect x="114" y={stackY} width="18" height="42" rx="2" fill="#EC4899" />
            <rect x="150" y="98" width="12" height="72" rx="5" fill="#52525B" />
            <rect x="155" y="170" width="48" height="11" rx="4" fill="#52525B" />
            <line x1="174" y1="181" x2="174" y2="232" stroke="#A1A1AA" strokeWidth="6" />
            <line x1="154" y1="48" x2={handX} y2="124" stroke="#A1A1AA" strokeWidth="7" strokeLinecap="round" />
            <circle cx="174" cy="96" r="13" fill="#0F0F12" />
            <Limb x1={170} y1={116} x2={172} y2={168} width={18} />
            <Limb x1={172} y1={168} x2={212} y2={176} width={14} />
            <Limb x1={212} y1={176} x2={216} y2={228} width={12} />
            <MuscleGlow cx={178} cy={124} r={13} />
            <Limb x1={172} y1={120} x2={elbowX} y2={elbowY} width={11} />
            <Limb x1={elbowX} y1={elbowY} x2={handX} y2={124} width={10} />
            <circle cx={handX} cy="124" r="6" fill="#EC4899" />
          </g>
        );
      }

      case 'pec_deck_fly':
      case 'rear_delt_fly': {
        const isRear = animationType === 'rear_delt_fly';
        const spread = isRear ? lerp(18, 82, p) : lerp(82, 16, p);
        const elbowSpread = isRear ? lerp(28, 66, p) : lerp(66, 28, p);
        const handY = isRear ? lerp(136, 118, p) : lerp(124, 140, p);

        return (
          <g>
            <rect x="108" y="34" width="144" height="10" rx="4" fill="#A1A1AA" />
            <rect x="166" y="44" width="28" height="188" rx="4" fill="#F4F4F6" stroke="#D4D4D8" strokeWidth="1.2" />
            <line x1="126" y1="44" x2={180 - spread} y2={handY} stroke="#A1A1AA" strokeWidth="7" strokeLinecap="round" />
            <line x1="234" y1="44" x2={180 + spread} y2={handY} stroke="#A1A1AA" strokeWidth="7" strokeLinecap="round" />
            <circle cx="180" cy="86" r="14" fill="#0F0F12" />
            <rect x="160" y="104" width="40" height="66" rx="12" fill="#18181B" />
            {isRear ? (
              <>
                <MuscleGlow cx={162} cy={112} r={11} />
                <MuscleGlow cx={198} cy={112} r={11} />
              </>
            ) : (
              <MuscleGlow cx={180} cy={120} r={16} />
            )}
            <Limb x1={160} y1={112} x2={180 - elbowSpread} y2={126} width={11} highlight={isRear} />
            <Limb x1={180 - elbowSpread} y1={126} x2={180 - spread} y2={handY} width={10} />
            <Limb x1={200} y1={112} x2={180 + elbowSpread} y2={126} width={11} highlight={isRear} />
            <Limb x1={180 + elbowSpread} y1={126} x2={180 + spread} y2={handY} width={10} />
            <circle cx={180 - spread} cy={handY} r="6" fill="#EC4899" />
            <circle cx={180 + spread} cy={handY} r="6" fill="#EC4899" />
            <Limb x1={168} y1={170} x2={162} y2={228} width={13} />
            <Limb x1={192} y1={170} x2={198} y2={228} width={13} />
          </g>
        );
      }

      case 'tricep_pushdown': {
        const handY = lerp(114, 168, p);
        const handX = lerp(164, 174, p);
        const stackY = lerp(165, 125, p);

        return (
          <g>
            <rect x="104" y="28" width="26" height="204" rx="4" fill="#F4F4F6" stroke="#D4D4D8" strokeWidth="1.5" />
            <rect x="108" y={stackY} width="18" height="40" rx="2" fill="#EC4899" />
            <line x1="118" y1="32" x2="174" y2="32" stroke="#A1A1AA" strokeWidth="7" />
            <line x1="168" y1="34" x2={handX} y2={handY} stroke="#71717A" strokeWidth="2.5" strokeDasharray="4 2" />
            <circle cx="204" cy="72" r="13" fill="#0F0F12" />
            <Limb x1={202} y1={92} x2={206} y2={152} width={17} />
            <Limb x1={206} y1={152} x2={204} y2={228} width={13} />
            <Limb x1={200} y1={98} x2={198} y2={132} width={11} highlight />
            <MuscleGlow cx={202} cy={116} r={10} />
            <Limb x1={198} y1={132} x2={handX} y2={handY} width={10} />
            <circle cx={handX} cy={handY} r="6" fill="#EC4899" />
          </g>
        );
      }

      case 'cable_bicep_curl':
      case 'db_bicep_curl':
      case 'db_hammer_curl': {
        const isCable = animationType === 'cable_bicep_curl';
        const handX = lerp(194, 176, p);
        const handY = lerp(164, 108, p);
        const stackY = lerp(165, 130, p);

        return (
          <g>
            {isCable && (
              <>
                <rect x="102" y="28" width="26" height="204" rx="4" fill="#F4F4F6" stroke="#D4D4D8" strokeWidth="1.5" />
                <rect x="106" y={stackY} width="18" height="40" rx="2" fill="#EC4899" />
                <circle cx="132" cy="212" r="7" fill="#A1A1AA" />
                <line x1="136" y1="210" x2={handX} y2={handY} stroke="#71717A" strokeWidth="2.5" strokeDasharray="4 2" />
              </>
            )}
            <circle cx="202" cy="70" r="13" fill="#0F0F12" />
            <Limb x1={202} y1={90} x2={202} y2={150} width={17} />
            <Limb x1={202} y1={150} x2={202} y2={228} width={13} />
            <Limb x1={200} y1={96} x2={198} y2={132} width={11} highlight />
            <MuscleGlow cx={196} cy={114} r={10} />
            <Limb x1={198} y1={132} x2={handX} y2={handY} width={10} highlight={animationType === 'db_hammer_curl'} />
            {isCable ? (
              <circle cx={handX} cy={handY} r="6" fill="#EC4899" />
            ) : (
              <rect x={handX - 11} y={handY - 6} width="22" height="12" rx="4" fill="#EC4899" stroke="#0F0F12" strokeWidth="1.5" />
            )}
          </g>
        );
      }

      case 'leg_press': {
        const footX = lerp(176, 134, p);
        const kneeX = lerp(198, 178, p);
        const kneeY = lerp(146, 174, p);

        return (
          <g>
            <line x1={footX - 6} y1="120" x2={footX - 6} y2="232" stroke="#A1A1AA" strokeWidth="8" />
            <rect x={footX - 12} y="128" width="14" height="58" rx="3" fill="#EC4899" />
            <rect x="236" y="108" width="12" height="68" rx="5" fill="#52525B" />
            <rect x="208" y="174" width="44" height="11" rx="4" fill="#52525B" />
            <line x1="230" y1="185" x2="230" y2="232" stroke="#A1A1AA" strokeWidth="6" />
            <circle cx="222" cy="100" r="13" fill="#0F0F12" />
            <Limb x1={226} y1={118} x2={224} y2={170} width={18} />
            <Limb x1={224} y1={170} x2={kneeX} y2={kneeY} width={15} highlight />
            <Limb x1={kneeX} y1={kneeY} x2={footX} y2={156} width={12} />
            <MuscleGlow cx={(224 + kneeX) / 2} cy={(170 + kneeY) / 2 - 4} r={13} />
          </g>
        );
      }

      case 'leg_extension': {
        const ankleX = lerp(212, 260, p);
        const ankleY = lerp(218, 174, p);

        return (
          <g>
            <rect x="148" y="102" width="12" height="68" rx="5" fill="#52525B" />
            <rect x="154" y="168" width="58" height="12" rx="4" fill="#52525B" />
            <line x1="176" y1="180" x2="176" y2="232" stroke="#A1A1AA" strokeWidth="6" />
            <circle cx="170" cy="96" r="13" fill="#0F0F12" />
            <Limb x1={168} y1={116} x2={170} y2={164} width={18} />
            <Limb x1={170} y1={164} x2={212} y2={168} width={15} highlight />
            <MuscleGlow cx={194} cy={162} r={13} />
            <Limb x1={212} y1={168} x2={ankleX} y2={ankleY} width={12} />
            <circle cx={ankleX + 4} cy={ankleY - 4} r="8" fill="#EC4899" />
          </g>
        );
      }

      case 'parallel_dips': {
        const dipOffset = lerp(34, 0, p);
        const shoulderY = 82 + dipOffset;
        const elbowY = lerp(92, 118, 1 - p);

        return (
          <g>
            <line x1="142" y1="132" x2="218" y2="132" stroke="#52525B" strokeWidth="8" strokeLinecap="round" />
            <line x1="152" y1="132" x2="152" y2="232" stroke="#A1A1AA" strokeWidth="8" />
            <line x1="208" y1="132" x2="208" y2="232" stroke="#A1A1AA" strokeWidth="8" />
            <circle cx="186" cy={shoulderY - 18} r="13" fill="#0F0F12" />
            <Limb x1={182} y1={shoulderY} x2={174} y2={shoulderY + 56} width={18} />
            <Limb x1={174} y1={shoulderY + 56} x2={166} y2={shoulderY + 98} width={13} />
            <MuscleGlow cx={184} cy={shoulderY + 12} r={12} />
            <Limb x1={180} y1={shoulderY + 4} x2={164} y2={elbowY} width={11} highlight />
            <Limb x1={164} y1={elbowY} x2={180} y2={132} width={10} />
          </g>
        );
      }

      case 'vertical_knee_raise': {
        const kneeX = lerp(188, 224, p);
        const kneeY = lerp(182, 134, p);
        const footX = lerp(184, 212, p);
        const footY = lerp(222, 166, p);

        return (
          <g>
            <rect x="150" y="64" width="14" height="84" rx="5" fill="#52525B" />
            <rect x="158" y="106" width="46" height="12" rx="4" fill="#71717A" />
            <line x1="156" y1="148" x2="156" y2="232" stroke="#A1A1AA" strokeWidth="8" />
            <circle cx="176" cy="70" r="13" fill="#0F0F12" />
            <Limb x1={174} y1={90} x2={176} y2={146} width={18} highlight />
            <Limb x1={174} y1={94} x2={174} y2={112} width={10} />
            <Limb x1={174} y1={112} x2={200} y2={112} width={10} />
            <MuscleGlow cx={178} cy={132} r={13} />
            <Limb x1={176} y1={146} x2={kneeX} y2={kneeY} width={14} />
            <Limb x1={kneeX} y1={kneeY} x2={footX} y2={footY} width={11} />
          </g>
        );
      }

      case 'db_lateral_raise': {
        const angle = lerp(0.15, 1.48, p);
        const armLen = 58;
        const lx = 160 - Math.sin(angle) * armLen;
        const ly = 104 + Math.cos(angle) * armLen;
        const rx = 200 + Math.sin(angle) * armLen;
        const ry = 104 + Math.cos(angle) * armLen;

        return (
          <g>
            <circle cx="180" cy="74" r="14" fill="#0F0F12" />
            <rect x="161" y="94" width="38" height="66" rx="11" fill="#18181B" />
            <Limb x1={170} y1={160} x2={166} y2={228} width={13} />
            <Limb x1={190} y1={160} x2={194} y2={228} width={13} />
            <MuscleGlow cx={158} cy={104} r={11} />
            <MuscleGlow cx={202} cy={104} r={11} />
            <Limb x1={160} y1={104} x2={lx} y2={ly} width={11} highlight />
            <Limb x1={200} y1={104} x2={rx} y2={ry} width={11} highlight />
            <rect x={lx - 9} y={ly - 6} width="18" height="12" rx="3" fill="#EC4899" stroke="#0F0F12" strokeWidth="1.2" />
            <rect x={rx - 9} y={ry - 6} width="18" height="12" rx="3" fill="#EC4899" stroke="#0F0F12" strokeWidth="1.2" />
          </g>
        );
      }

      case 'db_goblet_squat': {
        const depth = 1 - p;
        const hipY = lerp(134, 178, depth);
        const hipX = lerp(180, 152, depth);
        const shoulderY = lerp(78, 120, depth);
        const shoulderX = lerp(182, 176, depth);
        const kneeX = lerp(184, 206, depth);
        const kneeY = lerp(184, 178, depth);

        return (
          <g>
            <Limb x1={hipX} y1={hipY} x2={kneeX} y2={kneeY} width={15} highlight />
            <Limb x1={kneeX} y1={kneeY} x2={188} y2={228} width={12} />
            <MuscleGlow cx={(hipX + kneeX) / 2} cy={(hipY + kneeY) / 2 - 4} r={13} />
            <Limb x1={shoulderX} y1={shoulderY} x2={hipX} y2={hipY} width={17} />
            <circle cx={shoulderX + 4} cy={shoulderY - 18} r="13" fill="#0F0F12" />
            <Limb x1={shoulderX} y1={shoulderY + 6} x2={shoulderX + 18} y2={shoulderY + 20} width={10} />
            <rect x={shoulderX + 14} y={shoulderY + 6} width="14" height="24" rx="4" fill="#EC4899" stroke="#0F0F12" strokeWidth="1.5" />
          </g>
        );
      }

      case 'db_incline_press': {
        const handY = lerp(116, 68, p);
        const handX = lerp(162, 168, p);
        const shoulderX = 158;
        const shoulderY = 132;
        const elbowX = lerp(146, 162, p);
        const elbowY = lerp(154, 102, p);
        return (
          <g>
            {/* Incline Bench */}
            <line x1="138" y1="118" x2="195" y2="178" stroke="#52525B" strokeWidth="14" strokeLinecap="round" />
            <line x1="192" y1="178" x2="230" y2="178" stroke="#52525B" strokeWidth="12" strokeLinecap="round" />
            <line x1="162" y1="150" x2="152" y2="232" stroke="#A1A1AA" strokeWidth="6" />
            <line x1="215" y1="180" x2="215" y2="232" stroke="#A1A1AA" strokeWidth="6" />
            {/* Athlete */}
            <circle cx="142" cy="108" r="13" fill="#0F0F12" />
            <Limb x1={shoulderX} y1={shoulderY} x2={204} y2={172} width={18} />
            <Limb x1={204} y1={172} x2={236} y2={196} width={14} />
            <Limb x1={236} y1={196} x2={240} y2={230} width={12} />
            <MuscleGlow cx={166} cy={130} r={13} />
            <Limb x1={shoulderX} y1={shoulderY} x2={elbowX} y2={elbowY} width={11} highlight />
            <Limb x1={elbowX} y1={elbowY} x2={handX} y2={handY} width={10} />
            <rect x={handX - 13} y={handY - 7} width="26" height="14" rx="4" fill="#EC4899" stroke="#0F0F12" strokeWidth="1.5" />
          </g>
        );
      }

      case 'db_one_arm_row': {
        const handX = lerp(206, 178, p);
        const handY = lerp(194, 134, p);
        const elbowX = lerp(204, 170, p);
        const elbowY = lerp(156, 102, p);
        return (
          <g>
            {/* Flat Bench */}
            <rect x="122" y="168" width="112" height="12" rx="5" fill="#52525B" />
            <line x1="138" y1="180" x2="138" y2="232" stroke="#A1A1AA" strokeWidth="6" />
            <line x1="216" y1="180" x2="216" y2="232" stroke="#A1A1AA" strokeWidth="6" />
            {/* Athlete Kneeling on Bench */}
            <circle cx="222" cy="112" r="13" fill="#0F0F12" />
            <Limb x1={204} y1={122} x2={146} y2={130} width={18} highlight />
            {/* Support Leg & Knee on Bench */}
            <Limb x1={146} y1={130} x2={148} y2={166} width={14} />
            <Limb x1={148} y1={166} x2={126} y2={168} width={11} />
            {/* Support Arm */}
            <Limb x1={204} y1={124} x2={212} y2={166} width={10} />
            <MuscleGlow cx={178} cy={124} r={14} />
            {/* Rowing Arm */}
            <Limb x1={200} y1={126} x2={elbowX} y2={elbowY} width={11} />
            <Limb x1={elbowX} y1={elbowY} x2={handX} y2={handY} width={10} />
            <rect x={handX - 13} y={handY - 7} width="26" height="14" rx="4" fill="#EC4899" stroke="#0F0F12" strokeWidth="1.5" />
          </g>
        );
      }

      case 'db_bulgarian_split_squat': {
        const depth = 1 - p;
        const hipY = lerp(136, 176, depth);
        const hipX = lerp(176, 166, depth);
        const shoulderY = lerp(78, 120, depth);
        const shoulderX = lerp(182, 178, depth);
        const frontKneeX = lerp(208, 218, depth);
        const frontKneeY = lerp(182, 180, depth);
        const backKneeX = lerp(152, 146, depth);
        const backKneeY = lerp(182, 212, depth);
        return (
          <g>
            {/* Rear Flat Bench */}
            <rect x="86" y="176" width="54" height="11" rx="4" fill="#52525B" />
            <line x1="112" y1="187" x2="112" y2="232" stroke="#A1A1AA" strokeWidth="6" />
            {/* Rear Leg elevated on bench */}
            <Limb x1={hipX} y1={hipY} x2={backKneeX} y2={backKneeY} width={13} />
            <Limb x1={backKneeX} y1={backKneeY} x2={122} y2={176} width={11} />
            {/* Front Working Leg */}
            <Limb x1={hipX} y1={hipY} x2={frontKneeX} y2={frontKneeY} width={15} highlight />
            <Limb x1={frontKneeX} y1={frontKneeY} x2={212} y2={228} width={12} />
            <MuscleGlow cx={(hipX + frontKneeX) / 2} cy={(hipY + frontKneeY) / 2 - 4} r={13} />
            <MuscleGlow cx={hipX - 4} cy={hipY + 2} r={11} />
            {/* Torso & Head */}
            <Limb x1={shoulderX} y1={shoulderY} x2={hipX} y2={hipY} width={17} />
            <circle cx={shoulderX + 4} cy={shoulderY - 18} r="13" fill="#0F0F12" />
            {/* Arm holding heavy Dumbbell */}
            <Limb x1={shoulderX} y1={shoulderY + 6} x2={shoulderX + 2} y2={shoulderY + 60} width={10} />
            <rect x={shoulderX - 11} y={shoulderY + 54} width="26" height="13" rx="4" fill="#EC4899" stroke="#0F0F12" strokeWidth="1.5" />
          </g>
        );
      }

      case 'db_overhead_tricep': {
        const handX = lerp(164, 178, p);
        const handY = lerp(96, 36, p);
        return (
          <g>
            {/* Bench */}
            <rect x="148" y="172" width="60" height="11" rx="4" fill="#52525B" />
            <line x1="176" y1="183" x2="176" y2="232" stroke="#A1A1AA" strokeWidth="6" />
            {/* Seated Athlete */}
            <circle cx="178" cy="84" r="13" fill="#0F0F12" />
            <Limb x1={176} y1={104} x2={176} y2={168} width={17} />
            <Limb x1={176} y1={168} x2={216} y2={176} width={14} />
            <Limb x1={216} y1={176} x2={218} y2={228} width={12} />
            {/* Locked vertical upper arm + Tricep Glow */}
            <Limb x1={176} y1={104} x2={178} y2={66} width={11} highlight />
            <MuscleGlow cx={172} cy={84} r={10} />
            {/* Extending Forearm */}
            <Limb x1={178} y1={66} x2={handX} y2={handY} width={10} />
            <rect x={handX - 12} y={handY - 7} width="24" height="14" rx="4" fill="#EC4899" stroke="#0F0F12" strokeWidth="1.5" />
          </g>
        );
      }

      case 'decline_crunch': {
        const curl = p;
        const hipX = 204;
        const hipY = 178;
        const shoulderX = lerp(142, 178, curl);
        const shoulderY = lerp(194, 134, curl);

        return (
          <g>
            <line x1="126" y1="210" x2="226" y2="164" stroke="#52525B" strokeWidth="14" strokeLinecap="round" />
            <line x1="224" y1="166" x2="224" y2="232" stroke="#A1A1AA" strokeWidth="7" />
            <circle cx="236" cy="158" r="8" fill="#71717A" />
            <Limb x1={hipX} y1={hipY} x2={232} y2={166} width={14} />
            <Limb x1={232} y1={166} x2={242} y2={202} width={12} />
            <Limb x1={shoulderX} y1={shoulderY} x2={hipX} y2={hipY} width={18} highlight />
            <circle cx={shoulderX - lerp(18, 6, curl)} cy={shoulderY - lerp(4, 18, curl)} r="13" fill="#0F0F12" />
            <MuscleGlow cx={(shoulderX + hipX) / 2 + 4} cy={(shoulderY + hipY) / 2 - 4} r={13} />
          </g>
        );
      }

      case 'recumbent_bike': {
        const theta = p * Math.PI * 2;
        const crankX = 140;
        const crankY = 192;
        const pedalX = crankX + Math.cos(theta) * 20;
        const pedalY = crankY + Math.sin(theta) * 20;
        const hipX = 224;
        const hipY = 178;
        const kneeX = (hipX + pedalX) / 2 + 4;
        const kneeY = Math.min(hipY, pedalY) - 24 + Math.sin(theta) * 8;

        return (
          <g>
            <rect x="112" y="218" width="136" height="10" rx="4" fill="#A1A1AA" />
            <line x1="140" y1="192" x2="156" y2="108" stroke="#71717A" strokeWidth="8" strokeLinecap="round" />
            <rect x="142" y="94" width="28" height="20" rx="4" fill="#FFFFFF" stroke="#EC4899" strokeWidth="2" />
            <circle cx={crankX} cy={crankY} r="24" fill="#FCE7F3" stroke="#EC4899" strokeWidth="2.5" />
            <rect x="234" y="114" width="12" height="66" rx="5" fill="#52525B" />
            <rect x="208" y="176" width="38" height="11" rx="4" fill="#52525B" />
            <circle cx="222" cy="108" r="13" fill="#0F0F12" />
            <Limb x1={226} y1={126} x2={hipX} y2={hipY} width={18} />
            <Limb x1={hipX} y1={hipY} x2={kneeX} y2={kneeY} width={14} highlight />
            <Limb x1={kneeX} y1={kneeY} x2={pedalX} y2={pedalY} width={12} />
            <circle cx={pedalX} cy={pedalY} r="6" fill="#EC4899" />
            <MuscleGlow cx={(hipX + kneeX) / 2} cy={(hipY + kneeY) / 2} r={11} />
          </g>
        );
      }
    }

    return null;
  };

  return (
    <div className="relative w-full rounded-2xl bg-white border border-black/[0.08] overflow-hidden">
      {/* Top Status Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#FAFAFB] border-b border-black/[0.06]">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isPlaying ? (isPeak ? 'bg-pink-500 animate-ping' : 'bg-zinc-900') : 'bg-zinc-300'
            }`}
          />
          <span className="text-xs font-semibold text-zinc-900">{phaseLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-pink-50 text-pink-600 border border-pink-200">
            <Wind className="w-3 h-3" />
            {breathLabel}
          </span>
          {animationType !== 'recumbent_bike' && (
            <span className="text-[11px] font-mono text-zinc-400">Rep {repCount}</span>
          )}
        </div>
      </div>

      {/* Main Studio SVG Canvas */}
      <div
        className={`relative flex items-center justify-center ${
          compact ? 'h-48' : 'h-60 sm:h-64'
        } bg-[radial-gradient(circle_at_50%_40%,rgba(236,72,153,0.06),transparent_68%)]`}
      >
        <svg viewBox="0 0 360 250" className="w-full h-full max-w-[380px]">
          <defs>
            <pattern id="gymGridLight" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(15,15,18,0.04)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="360" height="250" fill="url(#gymGridLight)" />
          <line x1="24" y1="232" x2="336" y2="232" stroke="#D4D4D8" strokeWidth="2.5" strokeLinecap="round" />
          {renderScene()}
        </svg>
      </div>

      {/* Playback Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 bg-[#FAFAFB] border-t border-black/[0.06]">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsPlaying((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0F0F12] hover:bg-pink-500 text-white transition cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? 'หยุดชั่วคราว' : 'เล่นท่า'}
          </button>
          <button
            type="button"
            onClick={() => {
              cycleRef.current = 0;
              setCycle(0);
              setRepCount(1);
            }}
            className="p-1.5 rounded-lg bg-white border border-black/[0.08] hover:border-pink-300 text-zinc-700 transition cursor-pointer"
            title="เริ่มรอบใหม่"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-black/[0.08]">
          {[0.5, 1, 1.5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                speed === s ? 'bg-pink-500 text-white' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              {s === 0.5 ? '0.5x ช้า' : `${s}x`}
            </button>
          ))}
        </div>
      </div>

      {breathingTip && !compact && (
        <div className="px-3.5 py-2 bg-pink-50/70 border-t border-pink-100 text-[11px] text-pink-900 flex items-center gap-2">
          <Wind className="w-3.5 h-3.5 text-pink-500 shrink-0" />
          <span>{breathingTip}</span>
        </div>
      )}
    </div>
  );
};
