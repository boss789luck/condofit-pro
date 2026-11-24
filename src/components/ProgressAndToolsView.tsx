import React, { useMemo, useState } from 'react';
import {
  Calculator,
  Download,
  Droplets,
  Flame,
  Plus,
  Scale,
  Trash2,
  TrendingDown,
  Upload,
  Utensils,
} from 'lucide-react';
import { UserProfile, WeightEntry } from '../types/fitness';
import { MuangThongMealPlanner } from './MuangThongMealPlanner';

interface ProgressAndToolsViewProps {
  profile: UserProfile;
  weights: WeightEntry[];
  onAddWeight: (kg: number, note?: string, dateISO?: string) => void;
  onDeleteWeight: (id: string) => void;
  onUpdateProfile: (patch: Partial<UserProfile>) => void;
  onAddWater: (ml: number) => void;
  onExportBackup: () => void;
  onImportBackup: (json: string) => boolean;
}

const THAI_PROTEIN_IDEAS = [
  { name: 'อกไก่ย่าง/นึ่ง 150 ก.', protein: 46, kcal: 245, tip: 'มื้อหลักหลังเวท ย่อยง่าย ไขมันต่ำมาก' },
  { name: 'ไข่ต้ม 3 ฟอง (ไข่แดง 2)', protein: 19, kcal: 190, tip: 'มื้อเช้าหรือของว่าง สะดวกมาก' },
  { name: 'ปลากะพง/แซลมอนย่าง 150 ก.', protein: 34, kcal: 260, tip: 'ได้โอเมก้า 3 ช่วยลดการอักเสบกล้ามเนื้อ' },
  { name: 'เวย์โปรตีน 1.5 สกู๊ป', protein: 36, kcal: 180, tip: 'ดื่มหลังเล่นเวททันที ช่วยเติมโปรตีนให้ครบเป้า' },
  { name: 'กรีกโยเกิร์ต 0% + กล้วยครึ่งลูก', protein: 15, kcal: 140, tip: 'ของว่างก่อนเล่นเวท 45 นาที เพิ่มแรงยก' },
];

export const ProgressAndToolsView: React.FC<ProgressAndToolsViewProps> = ({
  profile,
  weights,
  onAddWeight,
  onDeleteWeight,
  onUpdateProfile,
  onAddWater,
  onExportBackup,
  onImportBackup,
}) => {
  const [newWeight, setNewWeight] = useState(String(profile.currentWeightKg));
  const [weightNote, setWeightNote] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const [targetBarWeight, setTargetBarWeight] = useState(50);
  const [smithBarWeight, setSmithBarWeight] = useState(10);
  const [ormWeight, setOrmWeight] = useState(50);
  const [ormReps, setOrmReps] = useState(10);

  const nutrition = useMemo(() => {
    const bmr =
      profile.gender === 'male'
        ? 10 * profile.currentWeightKg + 6.25 * profile.heightCm - 5 * profile.age + 5
        : 10 * profile.currentWeightKg + 6.25 * profile.heightCm - 5 * profile.age - 161;
    const multiplier = profile.activityLevel === 'active' ? 1.65 : 1.5;
    const tdee = Math.round(bmr * multiplier);
    const dailyDeficit = 420;
    const targetCalories = Math.max(1500, tdee - dailyDeficit);
    const proteinG = Math.round(profile.currentWeightKg * 2.0);
    const fatG = Math.round((targetCalories * 0.25) / 9);
    const carbsG = Math.max(80, Math.round((targetCalories - proteinG * 4 - fatG * 9) / 4));
    const bmi = Number((profile.currentWeightKg / Math.pow(profile.heightCm / 100, 2)).toFixed(1));
    return { bmr: Math.round(bmr), tdee, targetCalories, proteinG, fatG, carbsG, bmi };
  }, [profile]);

  const platesPerSide = useMemo(() => {
    const rem = Math.max(0, (targetBarWeight - smithBarWeight) / 2);
    const available = [20, 15, 10, 5, 2.5, 1.25];
    const result: number[] = [];
    let left = rem;
    for (const p of available) {
      while (left >= p - 0.01) {
        result.push(p);
        left -= p;
      }
    }
    return { perSideKg: rem, plates: result };
  }, [targetBarWeight, smithBarWeight]);

  const estimated1RM = useMemo(() => {
    if (ormReps <= 1) return ormWeight;
    return Math.round(ormWeight * (1 + ormReps / 30));
  }, [ormWeight, ormReps]);

  const handleLogWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newWeight);
    if (!isNaN(val) && val >= 35 && val <= 200) {
      onAddWeight(val, weightNote.trim() || undefined);
      setWeightNote('');
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = onImportBackup(String(reader.result || ''));
      setImportStatus(ok ? 'นำเข้าข้อมูลสำเร็จ!' : 'ไฟล์ไม่ถูกต้อง กรุณาใช้ไฟล์ Backup ของ CondoFit Pro');
      setTimeout(() => setImportStatus(null), 3500);
    };
    reader.readAsText(file);
  };

  const minW = Math.min(profile.targetWeightKg - 2, ...weights.map((w) => w.weightKg)) - 1;
  const maxW = Math.max(profile.startWeightKg + 1, ...weights.map((w) => w.weightKg)) + 1;
  const chartW = 540;
  const chartH = 190;
  const padX = 38;
  const padY = 20;
  const yForWeight = (w: number) =>
    padY + ((maxW - w) / Math.max(1, maxW - minW)) * (chartH - padY * 2);

  const lostKg = Number((profile.startWeightKg - profile.currentWeightKg).toFixed(1));
  const totalGoalKg = Math.max(0.1, profile.startWeightKg - profile.targetWeightKg);
  const progressPct = Math.min(100, Math.max(0, Math.round((lostKg / totalGoalKg) * 100)));

  return (
    <div className="space-y-6">
      {/* 1. WEIGHT TRACKER */}
      <section className="minimal-card rounded-3xl p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#0F0F12] flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-pink-500" />
              ติดตามน้ำหนัก 6 เดือน ({profile.startWeightKg} → {profile.targetWeightKg} กก.)
            </h2>
            <p className="text-xs text-zinc-500">
              ลดไปแล้ว <strong className="text-pink-600">{lostKg >= 0 ? lostKg : 0} กก.</strong> ({progressPct}% ของเป้าหมาย) ·
              อัตราแนะนำ: 0.4 กก./สัปดาห์ เพื่อรักษากล้ามเนื้อ
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-[#FAFAFB] border border-black/[0.08] text-xs font-semibold text-zinc-600">
              ปัจจุบัน: <strong className="text-[#0F0F12] text-sm">{profile.currentWeightKg} กก.</strong>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-pink-50 border border-pink-200 text-xs font-semibold text-pink-600">
              เป้าหมาย: <strong className="text-sm">{profile.targetWeightKg} กก.</strong>
            </span>
          </div>
        </div>

        {/* Clean Minimal SVG Chart */}
        <div className="rounded-2xl bg-[#FAFAFB] border border-black/[0.06] p-3 sm:p-4 mb-5 overflow-x-auto">
          <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full min-w-[360px] h-48">
            {[maxW, (maxW + minW) / 2, profile.targetWeightKg, minW].map((val, idx) => {
              const y = yForWeight(val);
              return (
                <g key={idx}>
                  <line x1={padX} y1={y} x2={chartW - 14} y2={y} stroke="rgba(15,15,18,0.08)" strokeDasharray="3 3" />
                  <text x="4" y={y + 4} fill="#71717A" fontSize="10" fontFamily="monospace">
                    {val.toFixed(0)}kg
                  </text>
                </g>
              );
            })}

            {/* 6-Month Ideal Glide Path (Dashed Black) */}
            <line
              x1={padX}
              y1={yForWeight(profile.startWeightKg)}
              x2={chartW - 18}
              y2={yForWeight(profile.targetWeightKg)}
              stroke="#0F0F12"
              strokeWidth="1.8"
              strokeDasharray="6 5"
              opacity="0.45"
            />
            <text
              x={chartW - 122}
              y={yForWeight(profile.targetWeightKg) + 14}
              fill="#0F0F12"
              fontSize="10"
              fontWeight="bold"
            >
              เป้า 6 เดือน ({profile.targetWeightKg} กก.)
            </text>

            {/* Actual Logged Weight Line (Signature Pink) */}
            {weights.length > 1 && (
              <polyline
                fill="none"
                stroke="#EC4899"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={weights
                  .map((w, i) => {
                    const x = padX + (i / Math.max(1, weights.length - 1)) * (chartW - padX - 24);
                    return `${x},${yForWeight(w.weightKg)}`;
                  })
                  .join(' ')}
              />
            )}

            {weights.map((w, i) => {
              const x =
                weights.length === 1
                  ? padX + 20
                  : padX + (i / Math.max(1, weights.length - 1)) * (chartW - padX - 24);
              const y = yForWeight(w.weightKg);
              return (
                <g key={w.id}>
                  <circle cx={x} cy={y} r="5.5" fill="#EC4899" stroke="#FFFFFF" strokeWidth="2.5" />
                  <text x={x} y={y - 10} textAnchor="middle" fill="#0F0F12" fontSize="10" fontWeight="bold">
                    {w.weightKg}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Log Weight Form */}
        <form onSubmit={handleLogWeight} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 mb-4">
          <div className="sm:col-span-3">
            <input
              type="number"
              step="0.1"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder="น้ำหนัก (กก.)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFB] border border-black/[0.1] text-sm font-bold text-[#0F0F12] focus:outline-none focus:border-pink-500"
            />
          </div>
          <div className="sm:col-span-6">
            <input
              type="text"
              value={weightNote}
              onChange={(e) => setWeightNote(e.target.value)}
              placeholder="โน้ต (เช่น ชั่งตอนเช้าหลังตื่นนอน)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFB] border border-black/[0.1] text-sm text-[#0F0F12] focus:outline-none focus:border-pink-500"
            />
          </div>
          <button
            type="submit"
            className="sm:col-span-3 py-2.5 px-4 rounded-xl bg-[#0F0F12] hover:bg-pink-500 text-white font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer transition"
          >
            <Plus className="w-4 h-4" /> บันทึกน้ำหนัก
          </button>
        </form>

        <div className="space-y-1.5 max-h-44 overflow-y-auto">
          {[...weights].reverse().map((w) => (
            <div
              key={w.id}
              className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#FAFAFB] border border-black/[0.05] text-xs"
            >
              <div className="flex items-center gap-3">
                <Scale className="w-3.5 h-3.5 text-pink-500" />
                <span className="font-mono text-zinc-400">{w.dateISO}</span>
                <span className="font-bold text-[#0F0F12] text-sm">{w.weightKg} กก.</span>
                {w.note && <span className="text-zinc-500 hidden sm:inline">· {w.note}</span>}
              </div>
              {weights.length > 1 && (
                <button
                  onClick={() => onDeleteWeight(w.id)}
                  className="p-1 text-zinc-400 hover:text-pink-600 cursor-pointer"
                  title="ลบรายการ"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 2. SMART NUTRITION & HYDRATION */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 minimal-card rounded-3xl p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-[#0F0F12] flex items-center gap-2">
                <Utensils className="w-5 h-5 text-pink-500" />
                โภชนาการ & มาโครส่วนตัว (ลดไขมัน + สร้างกล้าม)
              </h2>
              <p className="text-xs text-zinc-500">คำนวณอัตโนมัติจากน้ำหนักปัจจุบัน {profile.currentWeightKg} กก. (BMI {nutrition.bmi})</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <label className="text-zinc-500">สูง (ซม.):</label>
              <input
                type="number"
                value={profile.heightCm}
                onChange={(e) => onUpdateProfile({ heightCm: parseInt(e.target.value, 10) || 170 })}
                className="w-16 px-2 py-1 rounded-lg bg-[#FAFAFB] border border-black/[0.1] text-[#0F0F12] text-center font-bold"
              />
              <label className="text-zinc-500 ml-1">อายุ:</label>
              <input
                type="number"
                value={profile.age}
                onChange={(e) => onUpdateProfile({ age: parseInt(e.target.value, 10) || 30 })}
                className="w-14 px-2 py-1 rounded-lg bg-[#FAFAFB] border border-black/[0.1] text-[#0F0F12] text-center font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#0F0F12] text-white">
              <div className="text-[11px] text-pink-300 font-semibold">แคลอรี่เป้าหมาย/วัน</div>
              <div className="text-2xl font-extrabold mt-0.5">{nutrition.targetCalories}</div>
              <div className="text-[11px] text-zinc-400">TDEE {nutrition.tdee} (-420)</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-pink-50 border border-pink-200">
              <div className="text-[11px] text-pink-600 font-semibold">โปรตีน (สร้างกล้าม)</div>
              <div className="text-2xl font-extrabold text-[#0F0F12] mt-0.5">{nutrition.proteinG}g</div>
              <div className="text-[11px] text-zinc-500">2.0g / น้ำหนักตัว</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FAFAFB] border border-black/[0.08]">
              <div className="text-[11px] text-zinc-500 font-semibold">คาร์โบไฮเดรต</div>
              <div className="text-2xl font-extrabold text-[#0F0F12] mt-0.5">{nutrition.carbsG}g</div>
              <div className="text-[11px] text-zinc-400">พลังงานตอนเล่นเวท</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FAFAFB] border border-black/[0.08]">
              <div className="text-[11px] text-zinc-500 font-semibold">ไขมันดี</div>
              <div className="text-2xl font-extrabold text-[#0F0F12] mt-0.5">{nutrition.fatG}g</div>
              <div className="text-[11px] text-zinc-400">สมดุลฮอร์โมน</div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
              แหล่งโปรตีนหาง่ายในไทย (กินให้ครบ {nutrition.proteinG}g/วัน)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {THAI_PROTEIN_IDEAS.map((food) => (
                <div
                  key={food.name}
                  className="p-3 rounded-xl bg-[#FAFAFB] border border-black/[0.06] flex items-start justify-between gap-2"
                >
                  <div>
                    <div className="text-sm font-semibold text-[#0F0F12]">{food.name}</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">{food.tip}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-pink-600">P {food.protein}g</div>
                    <div className="text-[10px] text-zinc-400">{food.kcal} kcal</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Water Tracker */}
        <div className="lg:col-span-4 minimal-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#0F0F12] flex items-center gap-2 mb-1">
              <Droplets className="w-5 h-5 text-pink-500" />
              ดื่มน้ำรายวัน
            </h2>
            <p className="text-xs text-zinc-500 mb-4">เป้าหมาย 3.0 ลิตร ช่วยเผาผลาญไขมันและลดความหิว</p>

            <div className="text-center my-4">
              <div className="text-4xl font-extrabold text-[#0F0F12]">
                {(profile.dailyWaterMl / 1000).toFixed(2)}{' '}
                <span className="text-base font-semibold text-zinc-400">/ {(profile.waterTargetMl / 1000).toFixed(1)} L</span>
              </div>
              <div className="w-full h-3 rounded-full bg-pink-100 overflow-hidden mt-3">
                <div
                  className="h-full bg-pink-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, (profile.dailyWaterMl / profile.waterTargetMl) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onAddWater(250)}
              className="py-2.5 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 font-bold text-xs cursor-pointer transition"
            >
              +250 ml
            </button>
            <button
              onClick={() => onAddWater(500)}
              className="py-2.5 rounded-xl bg-[#0F0F12] hover:bg-pink-500 text-white font-bold text-xs cursor-pointer transition"
            >
              +500 ml
            </button>
            <button
              onClick={() => onAddWater(-250)}
              className="py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-semibold text-xs cursor-pointer transition"
            >
              -250
            </button>
          </div>
        </div>
      </section>

      {/* 2.5 MUANG THONG THANI (GENEVA 3) MEAL PLANNER & LINE MAN */}
      <MuangThongMealPlanner
        dailyBudget={profile.dailyFoodBudget ?? 500}
        mealsPerDay={profile.mealsPerDay ?? 2}
        targetCalories={nutrition.targetCalories}
        targetProteinG={nutrition.proteinG}
        onChangeBudget={(b) => onUpdateProfile({ dailyFoodBudget: b })}
        onChangeMealsPerDay={(m) => onUpdateProfile({ mealsPerDay: m })}
      />

      {/* 3. PRO GYM CALCULATORS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="minimal-card rounded-3xl p-5 space-y-4">
          <h3 className="text-base font-bold text-[#0F0F12] flex items-center gap-2">
            <Calculator className="w-5 h-5 text-pink-500" />
            คำนวณแผ่นน้ำหนัก Smith Machine
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-zinc-500 mb-1">น้ำหนักรวมที่ต้องการ (กก.)</label>
              <input
                type="number"
                step="2.5"
                value={targetBarWeight}
                onChange={(e) => setTargetBarWeight(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAFAFB] border border-black/[0.1] text-base font-bold text-[#0F0F12]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-500 mb-1">น้ำหนักแกนบาร์ Smith (กก.)</label>
              <input
                type="number"
                step="2.5"
                value={smithBarWeight}
                onChange={(e) => setSmithBarWeight(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAFAFB] border border-black/[0.1] text-base font-bold text-[#0F0F12]"
              />
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#FAFAFB] border border-black/[0.06]">
            <div className="text-xs text-zinc-500 mb-2">
              ใส่แผ่นน้ำหนัก <strong className="text-pink-600">ข้างละ {platesPerSide.perSideKg} กก.</strong>:
            </div>
            {platesPerSide.plates.length === 0 ? (
              <div className="text-xs text-zinc-400">ใช้แค่แกนบาร์เปล่า (ไม่ต้องใส่แผ่นเพิ่ม)</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {platesPerSide.plates.map((p, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-lg bg-[#0F0F12] text-white font-extrabold text-xs"
                  >
                    {p} กก.
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="minimal-card rounded-3xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#0F0F12] flex items-center gap-2">
              <Flame className="w-5 h-5 text-pink-500" />
              คำนวณแรงยกสูงสุด (Estimated 1RM)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-500 mb-1">น้ำหนักที่ยกได้ (กก.)</label>
                <input
                  type="number"
                  step="2.5"
                  value={ormWeight}
                  onChange={(e) => setOrmWeight(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAFAFB] border border-black/[0.1] text-base font-bold text-[#0F0F12]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-500 mb-1">จำนวนครั้ง (Reps)</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={ormReps}
                  onChange={(e) => setOrmReps(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAFAFB] border border-black/[0.1] text-base font-bold text-[#0F0F12]"
                />
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FAFAFB] border border-black/[0.06] flex items-center justify-between">
              <div>
                <div className="text-xs text-zinc-500">แรงยกสูงสุด 1 ครั้ง (1RM)</div>
                <div className="text-2xl font-extrabold text-pink-600">{estimated1RM} กก.</div>
              </div>
              <div className="text-right text-xs text-zinc-500">
                <div>สร้างกล้าม (75%): <strong className="text-[#0F0F12]">{Math.round(estimated1RM * 0.75)} กก.</strong></div>
                <div>ความทนทาน (65%): <strong className="text-[#0F0F12]">{Math.round(estimated1RM * 0.65)} กก.</strong></div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-black/[0.06] flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-zinc-500">สำรองข้อมูลประวัติทั้งหมด</span>
            <div className="flex items-center gap-2">
              <button
                onClick={onExportBackup}
                className="px-3 py-1.5 rounded-lg bg-[#FAFAFB] border border-black/[0.08] hover:border-pink-300 text-xs font-semibold text-zinc-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Export JSON
              </button>
              <label className="px-3 py-1.5 rounded-lg bg-[#FAFAFB] border border-black/[0.08] hover:border-pink-300 text-xs font-semibold text-zinc-700 flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" /> Import
                <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
              </label>
            </div>
            {importStatus && <div className="w-full text-xs text-pink-600 font-semibold">{importStatus}</div>}
          </div>
        </div>
      </section>
    </div>
  );
};
