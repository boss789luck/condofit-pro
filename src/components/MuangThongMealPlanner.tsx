import React, { useMemo, useState } from 'react';
import {
  Car,
  Check,
  Copy,
  MapPin,
  Navigation,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Wallet,
} from 'lucide-react';
import {
  buildGoogleMapsDirectionUrl,
  DiningMode,
  generateDailyMealCombo,
  MealCategory,
  MUANG_THONG_MEALS,
  openInLinemanApp,
} from '../data/muangThongMeals';

interface MuangThongMealPlannerProps {
  dailyBudget: number;
  mealsPerDay: number;
  targetCalories: number;
  targetProteinG: number;
  onChangeBudget: (budget: number) => void;
  onChangeMealsPerDay: (meals: number) => void;
}

const BUDGET_PRESETS = [300, 500, 650, 800, 1000];
const MEAL_OPTIONS = [
  { count: 2, label: '2 มื้อ (แนะนำ IF)', desc: 'คุมแคลฯ ง่าย อิ่มจุใจ' },
  { count: 3, label: '3 มื้อ (มาตรฐาน)', desc: 'แบ่งโปรตีนสม่ำเสมอ' },
  { count: 4, label: '4 มื้อ (สายเพิ่มกล้าม)', desc: 'เติมโปรตีนทั้งวัน' },
];

const CATEGORY_TABS: { id: MealCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'clean', label: 'คลีน / สลัด' },
  { id: 'steak', label: 'สเต็ก' },
  { id: 'japanese', label: 'ญี่ปุ่น / แซลมอน' },
  { id: 'thai', label: 'สุกี้ / ไทย / ชาบู' },
  { id: 'budget', label: 'ประหยัด / 7-11' },
];

export const MuangThongMealPlanner: React.FC<MuangThongMealPlannerProps> = ({
  dailyBudget,
  mealsPerDay,
  targetCalories,
  targetProteinG,
  onChangeBudget,
  onChangeMealsPerDay,
}) => {
  const [shuffleSeed, setShuffleSeed] = useState(1);
  const [diningMode, setDiningMode] = useState<DiningMode>('all');
  const [categoryFilter, setCategoryFilter] = useState<MealCategory | 'all'>('all');
  const [showOverBudget, setShowOverBudget] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  const safeBudget = Math.max(150, dailyBudget || 500);
  const safeMeals = Math.max(1, Math.min(4, mealsPerDay || 2));
  const perMealBudget = Math.round(safeBudget / safeMeals);

  const dailyCombo = useMemo(
    () => generateDailyMealCombo(safeBudget, safeMeals, shuffleSeed, diningMode),
    [safeBudget, safeMeals, shuffleSeed, diningMode]
  );

  const comboTotals = useMemo(() => {
    return dailyCombo.reduce(
      (acc, m) => ({
        price: acc.price + m.priceThb,
        protein: acc.protein + m.proteinG,
        kcal: acc.kcal + m.kcal,
        carbs: acc.carbs + m.carbsG,
        fat: acc.fat + m.fatG,
      }),
      { price: 0, protein: 0, kcal: 0, carbs: 0, fat: 0 }
    );
  }, [dailyCombo]);

  const filteredMeals = useMemo(() => {
    return MUANG_THONG_MEALS.filter((m) => {
      if (diningMode === 'lineman' && !m.canLineman) return false;
      if (diningMode === 'drive' && !m.canDriveIn) return false;
      if (categoryFilter !== 'all' && m.category !== categoryFilter) return false;
      if (!showOverBudget && m.priceThb > perMealBudget) return false;
      return true;
    }).sort((a, b) => b.proteinG - a.proteinG);
  }, [diningMode, categoryFilter, showOverBudget, perMealBudget]);

  const handleCopy = (id: string, text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // ignore
    }
  };

  const proteinGap = Math.max(0, targetProteinG - comboTotals.protein);

  return (
    <section className="minimal-card rounded-3xl p-5 sm:p-6 space-y-6 relative">
      {/* Floating Toast */}
      {toastMsg && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-[#0F0F12] text-white text-xs font-semibold shadow-2xl border border-pink-500/40 whitespace-nowrap">
          🩷 {toastMsg}
        </div>
      )}

      {/* Section Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-50 border border-pink-200 text-[11px] font-bold text-pink-600 mb-2">
            <MapPin className="w-3.5 h-3.5" />
            พิกัด: อาคารเจนีวา 3 คอนโดเลควิว เมืองทองธานี
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#0F0F12]">
            ร้านอาหารรอบเจนีวา 3 (สั่ง LINE MAN + ขับรถไปกินเอง)
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            กดเปิดแอป LINE MAN ได้ตรงๆ (คัดลอกชื่อร้านให้อัตโนมัติ) หรือกดนำทาง Google Maps ขับรถไปกินรอบเมืองทองฯ–แจ้งวัฒนะ
          </p>
        </div>

        {/* Mode Toggle: All / LINE MAN / Drive-in */}
        <div className="flex items-center gap-1 bg-[#FAFAFB] p-1 rounded-2xl border border-black/[0.08]">
          {[
            { id: 'all' as DiningMode, label: 'ทั้งหมด' },
            { id: 'lineman' as DiningMode, label: '🛵 สั่ง LINE MAN' },
            { id: 'drive' as DiningMode, label: '🚗 ขับรถไปกิน' },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setDiningMode(mode.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                diningMode === mode.id
                  ? 'bg-[#0F0F12] text-white'
                  : 'text-zinc-500 hover:text-[#0F0F12]'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Budget & Meal Count Filter Controls */}
      <div className="rounded-2xl bg-[#FAFAFB] border border-black/[0.07] p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          <div className="lg:col-span-6 space-y-2">
            <label className="text-xs font-bold text-[#0F0F12] flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-pink-500" />
              งบประมาณค่าอาหารต่อวัน (บาท) — กรอกเองได้เลย
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-32">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-pink-600">฿</span>
                <input
                  type="number"
                  min={150}
                  max={5000}
                  step={50}
                  value={dailyBudget}
                  onChange={(e) => onChangeBudget(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full pl-7 pr-3 py-2 rounded-xl bg-white border border-black/[0.12] text-sm font-extrabold text-[#0F0F12] focus:outline-none focus:border-pink-500"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {BUDGET_PRESETS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => onChangeBudget(b)}
                    className={`px-2.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      dailyBudget === b
                        ? 'bg-[#0F0F12] text-white'
                        : 'bg-white border border-black/[0.08] text-zinc-600 hover:border-pink-300'
                    }`}
                  >
                    ฿{b}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-2">
            <label className="text-xs font-bold text-[#0F0F12]">
              จำนวนมื้อต่อวัน (เฉลี่ยมื้อละ{' '}
              <span className="text-pink-600 font-extrabold">฿{perMealBudget}</span>)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {MEAL_OPTIONS.map((opt) => (
                <button
                  key={opt.count}
                  type="button"
                  onClick={() => onChangeMealsPerDay(opt.count)}
                  className={`p-2 rounded-xl text-left border transition cursor-pointer ${
                    mealsPerDay === opt.count
                      ? 'bg-pink-500 border-pink-500 text-white'
                      : 'bg-white border-black/[0.08] text-zinc-700 hover:border-pink-300'
                  }`}
                >
                  <div className="text-xs font-bold">{opt.count} มื้อ</div>
                  <div
                    className={`text-[10px] truncate ${
                      mealsPerDay === opt.count ? 'text-pink-100' : 'text-zinc-400'
                    }`}
                  >
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Auto-Generated Daily Meal Combo */}
      <div className="rounded-3xl bg-[#0F0F12] text-white p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-pink-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              เซตแนะนำวันนี้ ({safeMeals} มื้อ · งบ ฿{safeBudget})
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-zinc-300">
              <span>
                จ่ายจริง:{' '}
                <strong className={comboTotals.price <= safeBudget ? 'text-pink-400' : 'text-amber-300'}>
                  ฿{comboTotals.price}
                </strong>{' '}
                / ฿{safeBudget}
              </span>
              <span>•</span>
              <span>
                โปรตีนรวม: <strong className="text-white">{comboTotals.protein}g</strong> / {targetProteinG}g
              </span>
              <span>•</span>
              <span>
                พลังงาน: <strong className="text-white">{comboTotals.kcal}</strong> / {targetCalories} kcal
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShuffleSeed((s) => s + 1)}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-pink-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> สุ่มเซตอาหารใหม่
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {dailyCombo.map((meal, idx) => (
            <div
              key={meal.id + idx}
              className="rounded-2xl bg-white/[0.06] border border-white/10 p-4 flex flex-col justify-between gap-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500 text-white">
                      มื้อที่ {idx + 1}
                    </span>
                    <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                      <Car className="w-3 h-3" /> {meal.driveMinutes} นาที
                    </span>
                  </div>
                  <span className="text-sm font-extrabold text-pink-300">฿{meal.priceThb}</span>
                </div>
                <div className="text-sm font-bold text-white leading-snug">{meal.menuName}</div>
                <div className="text-xs text-zinc-300 font-medium">{meal.restaurantName}</div>
                <div className="text-[11px] text-zinc-400">{meal.orderNoteTh}</div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="font-bold text-pink-300">P {meal.proteinG}g</span>
                  <span className="text-zinc-400">· {meal.kcal} kcal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {meal.canLineman && (
                    <button
                      type="button"
                      onClick={() => openInLinemanApp(meal.linemanQuery, triggerToast)}
                      className="px-2.5 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition"
                    >
                      <ShoppingBag className="w-3 h-3" /> LINE MAN
                    </button>
                  )}
                  {meal.canDriveIn && (
                    <a
                      href={buildGoogleMapsDirectionUrl(meal.mapsQuery)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold inline-flex items-center gap-1 transition"
                    >
                      <Navigation className="w-3 h-3 text-pink-300" /> นำทาง
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {proteinGap > 15 && (
          <div className="text-xs text-pink-200 bg-pink-500/15 border border-pink-500/30 rounded-xl px-3.5 py-2.5">
            💡 <strong>ทริคให้โปรตีนครบ {targetProteinG}g:</strong> เพิ่มเวย์โปรตีน 1–1.5 สกู๊ป (~30–36g โปรตีน, ~฿40) หรือไข่ต้ม 7-11 อีก 2 ฟอง หลังเล่นเวท จะครบเป้าสร้างกล้ามพอดีเป๊ะครับ!
          </div>
        )}
      </div>

      {/* Filtered Muang Thong Thani Restaurant List */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-[#0F0F12]">
            ร้านอาหารรอบเจนีวา 3 ในงบไม่เกิน ฿{perMealBudget}/มื้อ ({filteredMeals.length} เมนู)
          </h3>
          <label className="inline-flex items-center gap-2 text-xs text-zinc-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showOverBudget}
              onChange={(e) => setShowOverBudget(e.target.checked)}
              className="accent-pink-500 rounded"
            />
            แสดงร้านที่เกินงบด้วย
          </label>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                categoryFilter === tab.id
                  ? 'bg-[#0F0F12] text-white'
                  : 'bg-[#FAFAFB] text-zinc-600 border border-black/[0.06] hover:border-pink-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filteredMeals.length === 0 ? (
          <div className="rounded-2xl bg-[#FAFAFB] border border-black/[0.06] p-6 text-center space-y-2">
            <p className="text-sm font-semibold text-[#0F0F12]">
              ยังไม่มีเมนูในหมวดนี้ที่ต่ำกว่า ฿{perMealBudget}/มื้อ
            </p>
            <button
              type="button"
              onClick={() => setShowOverBudget(true)}
              className="px-3.5 py-1.5 rounded-xl bg-pink-500 text-white text-xs font-bold cursor-pointer"
            >
              แสดงทุกร้านในเมืองทองธานี
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredMeals.map((meal) => {
              const isOver = meal.priceThb > perMealBudget;
              return (
                <div
                  key={meal.id}
                  className={`rounded-2xl p-4 border transition flex flex-col justify-between gap-3 ${
                    isOver
                      ? 'bg-[#FAFAFB] border-black/[0.06] opacity-80'
                      : 'bg-white border-black/[0.08] hover:border-pink-300'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-pink-600 border border-pink-200">
                          {meal.categoryLabelTh}
                        </span>
                        {meal.highlightTag && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0F0F12] text-white">
                            {meal.highlightTag}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-base font-extrabold shrink-0 ${
                          isOver ? 'text-zinc-500' : 'text-pink-600'
                        }`}
                      >
                        ฿{meal.priceThb}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-[#0F0F12] leading-snug">{meal.menuName}</div>
                    <div className="text-xs font-semibold text-zinc-700">{meal.restaurantName}</div>
                    <div className="text-[11px] text-zinc-500 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-pink-500 shrink-0" />
                        {meal.zoneLabel} ({meal.distanceLabel})
                      </span>
                      <span className="inline-flex items-center gap-1 text-[#0F0F12] font-semibold">
                        <Car className="w-3 h-3 text-pink-500" /> ขับรถ {meal.driveMinutes} นาที
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-500">🅿️ {meal.parkingInfoTh}</div>
                    <p className="text-[11px] text-zinc-600 bg-[#FAFAFB] rounded-lg px-2.5 py-1.5 border border-black/[0.05]">
                      📝 {meal.orderNoteTh}
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-2 border-t border-black/[0.05]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-pink-600">โปรตีน {meal.proteinG}g</span>
                      <span className="text-zinc-500">
                        คาร์บ {meal.carbsG}g · ไขมัน {meal.fatG}g · <strong className="text-[#0F0F12]">{meal.kcal} kcal</strong>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {meal.canLineman && (
                        <button
                          type="button"
                          onClick={() => openInLinemanApp(meal.linemanQuery, triggerToast)}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#0F0F12] hover:bg-pink-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          เปิดแอป LINE MAN
                        </button>
                      )}
                      {meal.canDriveIn && (
                        <a
                          href={buildGoogleMapsDirectionUrl(meal.mapsQuery)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2 px-3 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          นำทางไปกิน ({meal.driveMinutes} น.)
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleCopy(meal.id, meal.linemanQuery)}
                        className="p-2 rounded-xl bg-[#FAFAFB] hover:bg-pink-50 border border-black/[0.08] text-zinc-600 cursor-pointer transition"
                        title="คัดลอกชื่อร้าน"
                      >
                        {copiedId === meal.id ? (
                          <Check className="w-4 h-4 text-pink-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
