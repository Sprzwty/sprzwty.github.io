import type { Locale } from '../../context/i18n';

/** Display order of the comparison table. */
export const HEALTH_CATEGORIES = [
  'body', 'circulation', 'sensory', 'blood', 'liver', 'lipid', 'glucose', 'kidney', 'urine', 'imaging', 'exam', 'other',
] as const;
export type HealthCategory = (typeof HEALTH_CATEGORIES)[number];

type Converter = (value: number) => number;

export interface Conversion {
  /** Source unit → item unit. */
  to: Converter;
  /** Item unit → source unit. */
  back: Converter;
  /** Set for linear conversions: 1 source unit = `factor` item units. */
  factor?: number;
}

export interface HealthItemDef {
  category: HealthCategory;
  name: Record<Locale, string>;
  /** Unit every comparable value is shown in. Rows with an empty unit are assumed to already use it. */
  unit: string;
  /** Source unit (normalised by `normalizeUnit`) → conversion to and from `unit`. */
  from?: Record<string, Conversion>;
}

const scale = (factor: number): Conversion => ({ factor, to: (v) => v * factor, back: (v) => v / factor });

/** Chinese 5-point record ↔ decimal acuity, per GB/T 11533-2011 table 3 (L = 5 + lg V, decimals rounded as printed). */
const FIVE_POINT_TO_DECIMAL: [number, number][] = [
  [4.0, 0.1], [4.1, 0.12], [4.2, 0.15], [4.3, 0.2], [4.4, 0.25], [4.5, 0.3], [4.6, 0.4],
  [4.7, 0.5], [4.8, 0.6], [4.9, 0.8], [5.0, 1.0], [5.1, 1.2], [5.2, 1.5], [5.3, 2.0],
];
const fivePoint: Conversion = {
  to: (v) => FIVE_POINT_TO_DECIMAL.find(([l]) => l === Math.round(v * 10) / 10)?.[1] ?? 10 ** (v - 5),
  back: (v) => FIVE_POINT_TO_DECIMAL.find(([, d]) => d === v)?.[0] ?? Math.round((5 + Math.log10(v)) * 10) / 10,
};

// mg/dL per mmol/L = molar mass / 10 (PubChem: glucose 180.16, cholesterol 386.65, triolein 885.4 g/mol).
const MMOL_GLUCOSE = { 'mmol/l': scale(18.016) };
const MMOL_CHOLESTEROL = { 'mmol/l': scale(38.67) };
const PER_NANOLITRE = { '10^9/l': scale(1), '/ul': scale(0.001), '10^2/ul': scale(0.1) };
const PER_MINUTE = { '次/分': scale(1), '回/分': scale(1), '/min': scale(1) };

function def(category: HealthCategory, unit: string, [en, zh, ja]: [string, string, string], from?: HealthItemDef['from']): HealthItemDef {
  return { category, unit, name: { en, zh, ja }, from };
}

/** Canonical items. Keys are what goes into the "Key" column of the Notion results table. */
export const HEALTH_ITEMS: Record<string, HealthItemDef> = {
  height: def('body', 'cm', ['Height', '身高', '身長']),
  weight: def('body', 'kg', ['Weight', '体重', '体重']),
  std_weight: def('body', 'kg', ['Standard weight', '标准体重', '標準体重']),
  bmi: def('body', 'kg/m²', ['BMI', '体重指数 BMI', 'BMI']),
  waist: def('body', 'cm', ['Waist', '腰围', '腹囲']),
  hip: def('body', 'cm', ['Hip', '臀围', 'ヒップ']),
  whr: def('body', '', ['Waist-hip ratio', '腰臀比', 'ウエスト・ヒップ比']),

  bp_sys: def('circulation', 'mmHg', ['Systolic BP', '收缩压', '収縮期血圧']),
  bp_dia: def('circulation', 'mmHg', ['Diastolic BP', '舒张压', '拡張期血圧']),
  pulse: def('circulation', 'bpm', ['Heart rate', '心率', '脈拍'], PER_MINUTE),
  ecg: def('circulation', '', ['ECG', '心电图', '心電図']),

  vision_r: def('sensory', '', ['Vision, right (uncorrected)', '裸眼视力（右）', '裸眼視力（右）'], { '5分记录': fivePoint }),
  vision_l: def('sensory', '', ['Vision, left (uncorrected)', '裸眼视力（左）', '裸眼視力（左）'], { '5分记录': fivePoint }),
  color_vision: def('sensory', '', ['Color vision', '色觉', '色覚']),
  hearing: def('sensory', '', ['Hearing', '听力', '聴力']),
  hearing_1000: def('sensory', '', ['Hearing 1000 Hz (R/L)', '听力 1000 Hz（右/左）', '聴力 1000Hz（右/左）']),
  hearing_4000: def('sensory', '', ['Hearing 4000 Hz (R/L)', '听力 4000 Hz（右/左）', '聴力 4000Hz（右/左）']),

  wbc: def('blood', '10³/μL', ['White blood cells', '白细胞计数', '白血球数'], PER_NANOLITRE),
  rbc: def('blood', '10⁴/μL', ['Red blood cells', '红细胞计数', '赤血球数'], { '10^12/l': scale(100), '10^6/ul': scale(100) }),
  hb: def('blood', 'g/dL', ['Hemoglobin', '血红蛋白', '血色素量'], { 'g/l': scale(0.1) }),
  hct: def('blood', '%', ['Hematocrit', '红细胞压积', 'ヘマトクリット'], { 'l/l': scale(100) }),
  mcv: def('blood', 'fL', ['MCV', '平均红细胞体积 MCV', 'MCV']),
  mch: def('blood', 'pg', ['MCH', '平均红细胞血红蛋白量 MCH', 'MCH']),
  mchc: def('blood', 'g/dL', ['MCHC', '平均红细胞血红蛋白浓度 MCHC', 'MCHC'], { 'g/l': scale(0.1) }),
  rdw_cv: def('blood', '%', ['RDW-CV', '红细胞分布宽度 CV', 'RDW-CV']),
  rdw_sd: def('blood', 'fL', ['RDW-SD', '红细胞分布宽度 SD', 'RDW-SD']),
  plt: def('blood', '10⁴/μL', ['Platelets', '血小板计数', '血小板数'], { '10^9/l': scale(0.1), '10^3/ul': scale(0.1) }),
  mpv: def('blood', 'fL', ['MPV', '平均血小板体积', 'MPV']),
  pdw: def('blood', 'fL', ['PDW', '血小板分布宽度', 'PDW']),
  pct: def('blood', '%', ['Plateletcrit', '血小板比容', '血小板クリット']),
  p_lcr: def('blood', '%', ['P-LCR', '大血小板比率', '大型血小板比率']),
  neut_pct: def('blood', '%', ['Neutrophils %', '中性粒细胞百分比', '好中球 %']),
  lym_pct: def('blood', '%', ['Lymphocytes %', '淋巴细胞百分比', 'リンパ球 %']),
  mono_pct: def('blood', '%', ['Monocytes %', '单核细胞百分比', '単球 %']),
  eo_pct: def('blood', '%', ['Eosinophils %', '嗜酸粒细胞百分比', '好酸球 %']),
  ba_pct: def('blood', '%', ['Basophils %', '嗜碱粒细胞百分比', '好塩基球 %']),
  neut: def('blood', '10³/μL', ['Neutrophils', '中性粒细胞计数', '好中球数'], PER_NANOLITRE),
  lym: def('blood', '10³/μL', ['Lymphocytes', '淋巴细胞计数', 'リンパ球数'], PER_NANOLITRE),
  mono: def('blood', '10³/μL', ['Monocytes', '单核细胞计数', '単球数'], PER_NANOLITRE),
  eo: def('blood', '10³/μL', ['Eosinophils', '嗜酸粒细胞计数', '好酸球数'], PER_NANOLITRE),
  ba: def('blood', '10³/μL', ['Basophils', '嗜碱粒细胞计数', '好塩基球数'], PER_NANOLITRE),

  ast: def('liver', 'U/L', ['AST (GOT)', '谷草转氨酶 AST', 'AST（GOT）']),
  alt: def('liver', 'U/L', ['ALT (GPT)', '谷丙转氨酶 ALT', 'ALT（GPT）']),
  ast_alt: def('liver', '', ['AST/ALT ratio', '谷草/谷丙', 'AST/ALT 比']),
  ggt: def('liver', 'U/L', ['γ-GT', 'γ-谷氨酰转移酶 GGT', 'γ-GTP']),

  tc: def('lipid', 'mg/dL', ['Total cholesterol', '总胆固醇', '総コレステロール'], MMOL_CHOLESTEROL),
  tg: def('lipid', 'mg/dL', ['Triglycerides', '甘油三酯', '中性脂肪'], { 'mmol/l': scale(88.54) }),
  hdl: def('lipid', 'mg/dL', ['HDL cholesterol', '高密度脂蛋白胆固醇', 'HDL コレステロール'], MMOL_CHOLESTEROL),
  ldl: def('lipid', 'mg/dL', ['LDL cholesterol', '低密度脂蛋白胆固醇', 'LDL コレステロール'], MMOL_CHOLESTEROL),

  glucose: def('glucose', 'mg/dL', ['Fasting glucose', '空腹血糖', '空腹時血糖'], MMOL_GLUCOSE),
  hba1c: def('glucose', '%', ['HbA1c', '糖化血红蛋白 HbA1c', 'HbA1c']),

  // BUN counts the two N atoms of urea (2 × 14.007); creatinine 113.12, uric acid 168.11 g/mol (PubChem).
  bun: def('kidney', 'mg/dL', ['Urea nitrogen', '尿素氮', '尿素窒素'], { 'mmol/l': scale(2.8014) }),
  creatinine: def('kidney', 'mg/dL', ['Creatinine', '肌酐', 'クレアチニン'], { 'umol/l': scale(1 / 88.4) }),
  uric_acid: def('kidney', 'mg/dL', ['Uric acid', '尿酸', '尿酸'], { 'umol/l': scale(1 / 59.48) }),
  egfr: def('kidney', 'mL/min/1.73m²', ['eGFR', '肾小球滤过率', 'eGFR'], { 'ml/min': scale(1) }),

  u_glucose: def('urine', '', ['Urine glucose', '尿糖', '尿糖']),
  u_protein: def('urine', '', ['Urine protein', '尿蛋白', '尿蛋白']),
  u_blood: def('urine', '', ['Urine occult blood', '尿隐血', '尿潜血']),
  u_ph: def('urine', '', ['Urine pH', '尿 pH', '尿 pH']),
  u_sg: def('urine', '', ['Urine specific gravity', '尿比重', '尿比重']),
  u_ubg: def('urine', '', ['Urobilinogen', '尿胆原', 'ウロビリノーゲン']),
  u_bil: def('urine', '', ['Urine bilirubin', '尿胆红素', '尿ビリルビン']),
  u_ket: def('urine', '', ['Ketones', '尿酮体', 'ケトン体']),
  u_nit: def('urine', '', ['Nitrite', '亚硝酸盐', '亜硝酸塩']),
  u_leu: def('urine', '', ['Urine leukocytes', '尿白细胞', '尿白血球']),
  u_vitc: def('urine', 'mmol/L', ['Urine vitamin C', '尿维生素 C', '尿ビタミン C']),
  u_sed_rbc: def('urine', '/μL', ['Sediment RBC', '尿沉渣红细胞', '沈渣 赤血球']),
  u_sed_wbc: def('urine', '/μL', ['Sediment WBC', '尿沉渣白细胞', '沈渣 白血球']),
  u_sed_wbc_clump: def('urine', '/μL', ['WBC clumps', '白细胞团', '白血球塊']),
  u_sed_sq_epi: def('urine', '/μL', ['Squamous epithelial cells', '鳞状上皮细胞', '扁平上皮']),
  u_sed_nsq_epi: def('urine', '/μL', ['Non-squamous epithelial cells', '非鳞状上皮细胞', '非扁平上皮']),
  u_sed_hyaline: def('urine', '/μL', ['Hyaline casts', '透明管型', '硝子円柱']),
  u_sed_path_cast: def('urine', '/μL', ['Pathological casts', '病理管型', '病的円柱']),
  u_sed_bacteria: def('urine', '/μL', ['Bacteria', '细菌', '細菌']),
  u_sed_yeast: def('urine', '/μL', ['Yeast', '酵母菌', '酵母']),
  u_sed_crystal: def('urine', '/μL', ['Unclassified crystals', '未分类结晶', '未分類結晶']),

  chest_xray: def('imaging', '', ['Chest X-ray', '胸部 X 线', '胸部 X 線']),
  abd_us: def('imaging', '', ['Abdominal ultrasound', '腹部超声', '腹部超音波']),

  internal_exam: def('exam', '', ['Internal medicine exam', '内科检查', '内科診察']),
  surgical_exam: def('exam', '', ['Surgical exam', '外科检查', '外科診察']),
  medical_history: def('exam', '', ['Medical history', '既往史', '既往歴']),
  symptoms: def('exam', '', ['Subjective symptoms', '自觉症状', '自覚症状']),
  signs: def('exam', '', ['Objective signs', '他觉症状', '他覚症状']),
};

export const HEALTH_ITEM_ORDER: string[] = Object.keys(HEALTH_ITEMS);
