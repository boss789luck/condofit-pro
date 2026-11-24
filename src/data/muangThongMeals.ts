export type MealCategory = 'clean' | 'steak' | 'japanese' | 'thai' | 'budget';

export interface MuangThongMeal {
  id: string;
  restaurantName: string;
  zoneLabel: string;
  distanceLabel: string;
  category: MealCategory;
  categoryLabelTh: string;
  menuName: string;
  orderNoteTh: string;
  priceThb: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  kcal: number;
  linemanQuery: string;
  highlightTag?: string;
}

export const MUANG_THONG_MEALS: MuangThongMeal[] = [
  {
    id: 'mtt-salad-factory-chicken',
    restaurantName: 'Salad Factory (สาขา Beehive เมืองทอง)',
    zoneLabel: 'Beehive ไลฟ์สไตล์ มอลล์ ชั้น 1',
    distanceLabel: '1.1 กม. จากเจนีวา 3',
    category: 'clean',
    categoryLabelTh: 'คลีน / สลัด',
    menuName: 'สเต็กอกไก่ย่างพริกไทยดำ + สลัดผักสด',
    orderNoteTh: 'โน้ต LINE MAN: แยกน้ำสลัด (เลือกน้ำสลัดงาซีอิ๊วญี่ปุ่นหรือบัลซามิก)',
    priceThb: 225,
    proteinG: 46,
    carbsG: 28,
    fatG: 9,
    kcal: 380,
    linemanQuery: 'Salad Factory Beehive เมืองทองธานี',
    highlightTag: 'โปรตีนสูงมาก · Users’ Choice',
  },
  {
    id: 'mtt-salad-factory-salmon',
    restaurantName: 'Salad Factory (สาขา Beehive เมืองทอง)',
    zoneLabel: 'Beehive ไลฟ์สไตล์ มอลล์ ชั้น 1',
    distanceLabel: '1.1 กม. จากเจนีวา 3',
    category: 'clean',
    categoryLabelTh: 'คลีน / สลัด',
    menuName: 'สเต็กปลาแซลมอนย่างเกลือ + สลัดควินัว',
    orderNoteTh: 'โน้ต LINE MAN: แยกน้ำสลัด ไม่ใส่มายองเนส ได้โอเมก้า 3 สูง',
    priceThb: 335,
    proteinG: 42,
    carbsG: 32,
    fatG: 16,
    kcal: 440,
    linemanQuery: 'Salad Factory Beehive เมืองทองธานี',
    highlightTag: 'โอเมก้า 3 + ลีนสุดๆ',
  },
  {
    id: 'mtt-oic-keto',
    restaurantName: 'OiC Keto Cafe (หลัง Beehive เมืองทอง)',
    zoneLabel: 'หลังห้าง Beehive เมืองทองธานี',
    distanceLabel: '1.2 กม. จากเจนีวา 3',
    category: 'clean',
    categoryLabelTh: 'คลีน / คีโต',
    menuName: 'ข้าวดอกกะหล่ำกะเพราอกไก่ + ไข่ดาวน้ำ 2 ฟอง',
    orderNoteTh: 'โน้ต LINE MAN: ผัดน้ำไม่ใส่น้ำตาล ลดคาร์บหนักมาก เหมาะมื้อเย็น',
    priceThb: 165,
    proteinG: 44,
    carbsG: 14,
    fatG: 8,
    kcal: 310,
    linemanQuery: 'OiC Keto Cafe เมืองทองธานี',
    highlightTag: 'คาร์บต่ำ รีดไขมันไว',
  },
  {
    id: 'mtt-beef-express-steak',
    restaurantName: 'Beef Express (Beehive เมืองทอง)',
    zoneLabel: 'Beehive เมืองทองธานี',
    distanceLabel: '1.1 กม. จากเจนีวา 3',
    category: 'steak',
    categoryLabelTh: 'สเต็กเนื้อ / ไก่',
    menuName: 'สเต็กเนื้อสันใน (Tenderloin 200g) + ผักย่าง',
    orderNoteTh: 'โน้ต LINE MAN: เปลี่ยนเฟรนช์ฟรายส์เป็นผักย่าง/สลัด แยกซอสเกรวี่',
    priceThb: 360,
    proteinG: 52,
    carbsG: 18,
    fatG: 12,
    kcal: 390,
    linemanQuery: 'Beef Express เมืองทองธานี',
    highlightTag: 'โปรตีน 52g · วันงบเยอะ',
  },
  {
    id: 'mtt-nuti-steak',
    restaurantName: 'Nuti Homemade Steak House (Cosmo Bazaar)',
    zoneLabel: 'Cosmo Bazaar เมืองทองธานี',
    distanceLabel: '1.4 กม. จากเจนีวา 3',
    category: 'steak',
    categoryLabelTh: 'สเต็กโฮมเมด',
    menuName: 'สเต็กอกไก่พริกไทยดำ Double + สลัดผัก',
    orderNoteTh: 'โน้ต LINE MAN: ไม่เอาขนมปังปิ้ง แยกน้ำสลัดครีม',
    priceThb: 169,
    proteinG: 48,
    carbsG: 22,
    fatG: 10,
    kcal: 375,
    linemanQuery: 'Nuti Homemade Steak House Cosmo Bazaar เมืองทอง',
    highlightTag: 'คุ้มมาก 48g โปรตีน',
  },
  {
    id: 'mtt-shinkanzen',
    restaurantName: 'Shinkanzen Sushi (Cosmo Bazaar)',
    zoneLabel: 'Cosmo Bazaar ชั้น 1',
    distanceLabel: '1.4 กม. จากเจนีวา 3',
    category: 'japanese',
    categoryLabelTh: 'ญี่ปุ่น / แซลมอน',
    menuName: 'ข้าวหน้าแซลมอนสด (ลดข้าว) + แซลมอนซาชิมิ 5 ชิ้น',
    orderNoteTh: 'โน้ต LINE MAN: ขอข้าวครึ่งถ้วย ไม่ราดซอสมาโย เพิ่มวาซาบิ',
    priceThb: 245,
    proteinG: 44,
    carbsG: 42,
    fatG: 14,
    kcal: 470,
    linemanQuery: 'Shinkanzen Sushi Cosmo Bazaar เมืองทอง',
    highlightTag: 'มื้อหลังเล่นเวทดีมาก',
  },
  {
    id: 'mtt-tsubohachi',
    restaurantName: 'Tsubohachi (Beehive / Cosmo Bazaar)',
    zoneLabel: 'Beehive & Cosmo Bazaar เมืองทอง',
    distanceLabel: '1.1 กม. จากเจนีวา 3',
    category: 'japanese',
    categoryLabelTh: 'ญี่ปุ่น / แซลมอน',
    menuName: 'เซตปลาซาบะ/แซลมอนย่างเกลือ + ซุปมิโซะ + ข้าวญี่ปุ่น',
    orderNoteTh: 'โน้ต LINE MAN: ย่างเกลือ (ไม่ย่างซอสเทอริยากิ) ทานข้าว 2/3 ถ้วย',
    priceThb: 295,
    proteinG: 40,
    carbsG: 48,
    fatG: 15,
    kcal: 490,
    linemanQuery: 'Tsubohachi Beehive เมืองทองธานี',
  },
  {
    id: 'mtt-mk-suki',
    restaurantName: 'MK Restaurants (Cosmo Bazaar)',
    zoneLabel: 'Cosmo Bazaar ชั้น 1',
    distanceLabel: '1.4 กม. จากเจนีวา 3',
    category: 'thai',
    categoryLabelTh: 'สุกี้ / ไทย',
    menuName: 'สุกี้น้ำรวมมิตรอกไก่-เนื้อปลา + เป็ดย่างจานเล็กไม่เอาหนัง',
    orderNoteTh: 'โน้ต LINE MAN: แยกน้ำจิ้มสุกี้ (จิ้มแต่น้อย) เป็ดย่างขอไม่เอาหนังและแยกน้ำราด',
    priceThb: 260,
    proteinG: 45,
    carbsG: 34,
    fatG: 10,
    kcal: 410,
    linemanQuery: 'MK Restaurants Cosmo Bazaar เมืองทองธานี',
    highlightTag: 'อิ่มสบายท้อง ไขมันต่ำ',
  },
  {
    id: 'mtt-mr-hai-chicken',
    restaurantName: 'มิสเตอร์ไฮ้ไก่อบถัง (Cosmo Bazaar)',
    zoneLabel: 'Cosmo Bazaar เมืองทองธานี',
    distanceLabel: '1.4 กม. จากเจนีวา 3',
    category: 'thai',
    categoryLabelTh: 'ไทย / ไก่อบ',
    menuName: 'ไก่อบถังเนื้ออก (ครึ่งตัว/สับไม่เอาหนัง) + ข้าวสวย 1 ถ้วย',
    orderNoteTh: 'โน้ต LINE MAN: ขอเนื้ออกไม่เอาหนัง แยกน้ำจิ้มแจ่ว',
    priceThb: 145,
    proteinG: 46,
    carbsG: 45,
    fatG: 8,
    kcal: 435,
    linemanQuery: 'มิสเตอร์ไฮ้ไก่อบถัง Cosmo เมืองทอง',
    highlightTag: 'คุ้มงบ ฿145 ได้ 46g โปรตีน',
  },
  {
    id: 'mtt-isaan-grill',
    restaurantName: 'ส้มตำ-ไก่ย่าง โซนบอนด์สตรีท / Beehive',
    zoneLabel: 'ถนนบอนด์สตรีท เมืองทองธานี',
    distanceLabel: '0.9 กม. จากเจนีวา 3',
    category: 'thai',
    categoryLabelTh: 'อีสาน / ไก่ย่าง',
    menuName: 'อกไก่ย่างไม่หนัง + ลาบหมูไม่ติดมัน + ส้มตำไทยไม่น้ำตาล',
    orderNoteTh: 'โน้ต LINE MAN: ลาบไม่ใส่หนังหมู ไม่ชูรส ส้มตำหวานน้อย',
    priceThb: 165,
    proteinG: 44,
    carbsG: 28,
    fatG: 9,
    kcal: 370,
    linemanQuery: 'ไก่ย่าง ส้มตำ เมืองทองธานี บอนด์สตรีท',
  },
  {
    id: 'mtt-chicken-rice-lean',
    restaurantName: 'ข้าวมันไก่ต้ม (โซนเมืองทอง / ตึกแถวป๊อปปูล่า)',
    zoneLabel: 'เมืองทองธานี / Cosmo Food Court',
    distanceLabel: '1.0 กม. จากเจนีวา 3',
    category: 'budget',
    categoryLabelTh: 'ประหยัด / จานด่วน',
    menuName: 'ข้าวสวย + ไก่ต้มเนื้ออกพิเศษไม่เอาหนัง (เพิ่มไก่) + ซุปฟัก',
    orderNoteTh: 'โน้ต LINE MAN: เปลี่ยนจากข้าวมันเป็น "ข้าวสวย" เนื้ออกล้วนไม่หนัง แยกน้ำจิ้ม',
    priceThb: 95,
    proteinG: 40,
    carbsG: 46,
    fatG: 6,
    kcal: 400,
    linemanQuery: 'ข้าวมันไก่ เมืองทองธานี',
    highlightTag: 'สายประหยัดต่ำกว่า ฿100',
  },
  {
    id: 'mtt-suki-nam-lean',
    restaurantName: 'สุกี้น้ำอกไก่ (โซนตลาดมะลิ / เมืองทอง)',
    zoneLabel: 'ตลาดมะลิ / เลียบด่วนเมืองทอง',
    distanceLabel: '1.3 กม. จากเจนีวา 3',
    category: 'budget',
    categoryLabelTh: 'ประหยัด / จานด่วน',
    menuName: 'สุกี้น้ำอกไก่พิเศษ + ไข่ต้ม/ไข่ลวก 2 ฟอง (วุ้นเส้นน้อย)',
    orderNoteTh: 'โน้ต LINE MAN: ใส่ผักเยอะๆ วุ้นเส้นครึ่งเดียว แยกน้ำจิ้มสุกี้',
    priceThb: 95,
    proteinG: 38,
    carbsG: 30,
    fatG: 8,
    kcal: 345,
    linemanQuery: 'สุกี้น้ำ เมืองทองธานี',
  },
  {
    id: 'mtt-711-geneva',
    restaurantName: '7-Eleven Delivery (ใกล้คอนโดเจนีวา 3 เลควิว)',
    zoneLabel: 'โซนคอนโดเลควิว เมืองทองธานี',
    distanceLabel: '0.2 กม. จากเจนีวา 3',
    category: 'budget',
    categoryLabelTh: 'ประหยัด / 7-11',
    menuName: 'อกไก่นุ่มพริกไทยดำ 2 ชิ้น + ไข่ต้ม 2 ฟอง + ข้าวไรซ์เบอร์รี่ 1 กล่อง',
    orderNoteTh: 'สั่งผ่าน 7-Delivery หรือ LINE MAN Mart ได้ 24 ชม. โปรตีนแน่นสุด!',
    priceThb: 125,
    proteinG: 54,
    carbsG: 42,
    fatG: 9,
    kcal: 465,
    linemanQuery: '7-Eleven เมืองทองธานี',
    highlightTag: 'โปรตีน 54g ในงบ ฿125!',
  },
];

export function buildLinemanOrderUrl(query: string): string {
  // Wongnai is LINE MAN's official integrated partner directory with 1-tap "สั่งผ่าน LINE MAN" on every restaurant page
  return `https://www.wongnai.com/restaurants?q=${encodeURIComponent(query)}&regions=1`;
}

export function generateDailyMealCombo(
  dailyBudget: number,
  mealsPerDay: number,
  seed: number
): MuangThongMeal[] {
  const safeBudget = Math.max(150, dailyBudget);
  const safeMeals = Math.max(1, Math.min(4, mealsPerDay));
  const avgPerMeal = safeBudget / safeMeals;

  // Sort eligible meals by how well they fit the per-meal budget (preferring rich protein within budget)
  const sorted = [...MUANG_THONG_MEALS].sort((a, b) => {
    const aFit = a.priceThb <= avgPerMeal * 1.25 ? 1 : 0;
    const bFit = b.priceThb <= avgPerMeal * 1.25 ? 1 : 0;
    if (aFit !== bFit) return bFit - aFit;
    // Higher protein per meal
    return b.proteinG - a.proteinG;
  });

  // Deterministic shuffle using seed so user can click "สุ่มเซตใหม่"
  const pool = [...sorted];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.abs((seed * 31 + i * 17) % (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Try to assemble `safeMeals` distinct restaurants within dailyBudget
  const chosen: MuangThongMeal[] = [];
  let spent = 0;

  for (let slot = 0; slot < safeMeals; slot++) {
    const remainingSlots = safeMeals - slot;
    const remainingBudget = safeBudget - spent;
    // Reserve at least 85 THB for each remaining meal
    const maxForThisSlot = remainingBudget - (remainingSlots - 1) * 85;

    const candidate =
      pool.find(
        (m) =>
          !chosen.some((c) => c.id === m.id) &&
          m.priceThb <= maxForThisSlot &&
          // Prefer variety of restaurants
          !chosen.some((c) => c.restaurantName === m.restaurantName)
      ) ??
      pool.find((m) => !chosen.some((c) => c.id === m.id) && m.priceThb <= maxForThisSlot) ??
      [...MUANG_THONG_MEALS]
        .filter((m) => !chosen.some((c) => c.id === m.id))
        .sort((a, b) => a.priceThb - b.priceThb)[0];

    if (candidate) {
      chosen.push(candidate);
      spent += candidate.priceThb;
    }
  }

  return chosen;
}
