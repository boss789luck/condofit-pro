import { EquipmentCategory, MuscleId } from '../types/fitness';

export interface MuscleInfo {
  id: MuscleId;
  nameTh: string;
  nameEn: string;
  view: 'front' | 'back' | 'both';
}

export const MUSCLE_INFO: Record<MuscleId, MuscleInfo> = {
  chest: { id: 'chest', nameTh: 'กล้ามอก', nameEn: 'Pectorals', view: 'front' },
  front_delts: { id: 'front_delts', nameTh: 'ไหล่หน้า', nameEn: 'Anterior Delts', view: 'front' },
  side_delts: { id: 'side_delts', nameTh: 'ไหล่ข้าง', nameEn: 'Lateral Delts', view: 'both' },
  rear_delts: { id: 'rear_delts', nameTh: 'ไหล่หลัง', nameEn: 'Posterior Delts', view: 'back' },
  biceps: { id: 'biceps', nameTh: 'หน้าแขน', nameEn: 'Biceps', view: 'front' },
  triceps: { id: 'triceps', nameTh: 'หลังแขน', nameEn: 'Triceps', view: 'back' },
  forearms: { id: 'forearms', nameTh: 'ท่อนแขน', nameEn: 'Forearms', view: 'both' },
  abs: { id: 'abs', nameTh: 'หน้าท้อง', nameEn: 'Abdominals', view: 'front' },
  obliques: { id: 'obliques', nameTh: 'หน้าท้องข้าง', nameEn: 'Obliques', view: 'front' },
  traps: { id: 'traps', nameTh: 'บ่า / หลังบน', nameEn: 'Trapezius', view: 'back' },
  lats: { id: 'lats', nameTh: 'ปีก / หลังกว้าง', nameEn: 'Latissimus Dorsi', view: 'back' },
  mid_back: { id: 'mid_back', nameTh: 'หลังกลาง / สะบัก', nameEn: 'Rhomboids & Mid Back', view: 'back' },
  lower_back: { id: 'lower_back', nameTh: 'หลังล่าง', nameEn: 'Lower Back', view: 'back' },
  quads: { id: 'quads', nameTh: 'ต้นขาหน้า', nameEn: 'Quadriceps', view: 'front' },
  hamstrings: { id: 'hamstrings', nameTh: 'ต้นขาหลัง', nameEn: 'Hamstrings', view: 'back' },
  glutes: { id: 'glutes', nameTh: 'สะโพก / ก้น', nameEn: 'Glutes', view: 'back' },
  calves: { id: 'calves', nameTh: 'น่อง', nameEn: 'Calves', view: 'back' },
  cardio: { id: 'cardio', nameTh: 'หัวใจและเผาผลาญ', nameEn: 'Cardio & Fat Burn', view: 'front' },
};

export interface EquipmentMeta {
  id: EquipmentCategory;
  nameTh: string;
  nameEn: string;
  descriptionTh: string;
  badgeColor: string;
}

export const EQUIPMENT_LIST: EquipmentMeta[] = [
  {
    id: 'smith_machine',
    nameTh: 'Smith Machine (Body-Solid)',
    nameEn: 'Smith Machine + Adjustable Bench',
    descriptionTh: 'เครื่องสมิธแมชชีนพร้อมแผ่นน้ำหนักและม้านั่งปรับระดับ เล่นได้ทั้งอก ขา หลัง ไหล่ ปลอดภัยคุมแกนง่าย',
    badgeColor: 'bg-pink-50 text-pink-600 border-pink-200',
  },
  {
    id: 'multi_gym',
    nameTh: 'Body-Solid Multi-Gym',
    nameEn: 'Multi-Station Cable & Press',
    descriptionTh: 'เครื่องรวมสถานี: Lat Pulldown, Pec Deck, Chest Press, Low Cable Row, Leg Press และ Leg Extension',
    badgeColor: 'bg-zinc-900 text-white border-zinc-900',
  },
  {
    id: 'dumbbells',
    nameTh: 'ดัมเบล & ม้านั่ง',
    nameEn: 'Dumbbells & Flat/Incline Bench',
    descriptionTh: 'ดัมเบลสำหรับสร้างสมดุลกล้ามเนื้อ ไหล่ข้าง แขน และขา เพิ่มมิติกล้ามเนื้อแบบอิสระ',
    badgeColor: 'bg-pink-50 text-pink-600 border-pink-200',
  },
  {
    id: 'vkr_dip',
    nameTh: 'VKR / Dip Station',
    nameEn: 'Vertical Knee Raise & Parallel Bars',
    descriptionTh: 'เบาะรองแขนและบาร์คู่สำหรับปั้นหน้าท้องส่วนล่างและเล่น Dip สร้างอกล่าง-หลังแขน',
    badgeColor: 'bg-zinc-100 text-zinc-800 border-zinc-200',
  },
  {
    id: 'decline_bench',
    nameTh: 'ม้านั่งซิทอัพ (Decline Bench)',
    nameEn: 'Decline Ab Bench',
    descriptionTh: 'ม้านั่งเอียงลงพร้อมโรลเลอร์ล็อกขา เน้นเกร็งหน้าท้องให้ชัดและแข็งแรง',
    badgeColor: 'bg-pink-50 text-pink-600 border-pink-200',
  },
  {
    id: 'recumbent_bike',
    nameTh: 'จักรยานเอนปั่น (Recumbent Bike)',
    nameEn: 'Recumbent Cardio Bike',
    descriptionTh: 'คาร์ดิโอถนอมข้อเข่า เหมาะมากสำหรับ Zone 2 เผาผลาญไขมันหลังเล่นเวทและทำ HIIT',
    badgeColor: 'bg-zinc-100 text-zinc-800 border-zinc-200',
  },
];
