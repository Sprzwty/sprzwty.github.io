import type { Locale } from '../../context/i18n';

/** zh / ja names for Motra exercise ids. Unknown exercises fall back to the English export name. */
const EXERCISES: Record<string, [zh: string, ja: string]> = {
  'Back Extension (Hyperextension)': ['山羊挺身', 'バックエクステンション'],
  'Barbell Back Squat': ['杠铃深蹲', 'バーベルスクワット'],
  'Barbell Bench Press': ['杠铃卧推', 'バーベルベンチプレス'],
  'Barbell Bent Over Row': ['杠铃俯身划船', 'バーベルベントオーバーロウ'],
  'Barbell Close-Grip Bench Press': ['杠铃窄距卧推', 'ナローグリップベンチプレス'],
  'Barbell Hip Thrust': ['杠铃臀推', 'バーベルヒップスラスト'],
  'Barbell Incline Bench Press': ['杠铃上斜卧推', 'バーベルインクラインベンチプレス'],
  'Barbell Overhead Press / Military Press': ['杠铃推举', 'バーベルオーバーヘッドプレス'],
  'Barbell Romanian Deadlift': ['杠铃罗马尼亚硬拉', 'バーベルルーマニアンデッドリフト'],
  'Bodyweight Calf Raise': ['自重提踵', '自重カーフレイズ'],
  'Cable Bar Seated Row': ['绳索直杆坐姿划船', 'ケーブルシーテッドロウ（バー）'],
  'Cable Bar Straight Arm Pull Down': ['绳索直臂下压', 'ケーブルストレートアームプルダウン'],
  'Cable Bar Tricep Pushdown / Extension': ['绳索直杆三头下压', 'ケーブルプッシュダウン（バー）'],
  'Cable Chop': ['绳索伐木', 'ケーブルチョップ'],
  'Cable Crunch': ['绳索卷腹', 'ケーブルクランチ'],
  'Cable Face Pull': ['绳索面拉', 'ケーブルフェイスプル'],
  'Cable Fly High': ['绳索高位夹胸', 'ケーブルフライ（ハイ）'],
  'Cable Fly Low': ['绳索低位夹胸', 'ケーブルフライ（ロー）'],
  'Cable Lat Pull Down Wide-Grip': ['绳索宽握高位下拉', 'ケーブルラットプルダウン（ワイド）'],
  'Cable Pallof Press': ['绳索抗旋转推', 'ケーブルパロフプレス'],
  'Cable Rope Tricep Pushdown / Extension': ['绳索绳把三头下压', 'ケーブルプッシュダウン（ロープ）'],
  'Cable Single-Arm Lateral Raise': ['绳索单臂侧平举', 'ケーブルワンアームサイドレイズ'],
  'Cable Single-Arm Upright Rear Delt Fly': ['绳索单臂反向飞鸟', 'ケーブルワンアームリアデルトフライ'],
  'Cable Upright Rear Delt Fly': ['绳索反向飞鸟', 'ケーブルリアデルトフライ'],
  'Cable V-Handle Seated Row': ['绳索 V 把坐姿划船', 'ケーブルシーテッドロウ（V ハンドル）'],
  "Captain's Chair Knee Raise": ['悬垂椅屈膝举腿', 'キャプテンズチェア ニーレイズ'],
  "Captain's Chair Leg Raise": ['悬垂椅直腿举腿', 'キャプテンズチェア レッグレイズ'],
  'Dips': ['双杠臂屈伸', 'ディップス'],
  'Dumbbell Bulgarian Split Squat': ['哑铃保加利亚分腿蹲', 'ダンベルブルガリアンスクワット'],
  'Dumbbell Chest-Supported Row': ['哑铃俯卧划船', 'ダンベルチェストサポートロウ'],
  'Dumbbell Incline Bench Press': ['哑铃上斜卧推', 'ダンベルインクラインベンチプレス'],
  'Dumbbell Shoulder Press': ['哑铃肩推', 'ダンベルショルダープレス'],
  'EZ-Bar Bicep Curl': ['EZ 杆弯举', 'EZ バーカール'],
  'Hammer-Grip Pull-Up': ['对握引体向上', 'パラレルグリップ懸垂'],
  'Kettlebell Side Bend': ['壶铃体侧屈', 'ケトルベルサイドベンド'],
  'Leg / Hamstring Curl Seated': ['坐姿腿弯举', 'シーテッドレッグカール'],
  'Machine Ab Crunch': ['器械卷腹', 'マシンアブクランチ'],
  'Machine Alternate Arm Curl': ['器械交替弯举', 'マシンオルタネイトカール'],
  'Machine Assisted Pull-Up': ['器械辅助引体向上', 'アシストプルアップ'],
  'Machine Decline Bench Press': ['器械下斜推胸', 'マシンデクラインプレス'],
  'Machine Fly (Pec Dec)': ['器械夹胸（蝴蝶机）', 'ペックフライ'],
  'Machine Hammer-Grip Preacher Curl': ['器械锤式牧师凳弯举', 'マシンハンマープリーチャーカール'],
  'Machine Hammer-Grip Row': ['器械对握划船', 'マシンハンマーグリップロウ'],
  'Machine Hip Abduction': ['器械髋外展', 'ヒップアブダクション'],
  'Machine Hip Adduction': ['器械髋内收', 'ヒップアダクション'],
  'Machine Hip Thrust (Glute Bridge)': ['器械臀推', 'マシンヒップスラスト'],
  'Machine Lat Pull Down Wide-Grip': ['器械宽握高位下拉', 'マシンラットプルダウン（ワイド）'],
  'Machine Lateral Raise': ['器械侧平举', 'マシンサイドレイズ'],
  'Machine Leg Extension': ['器械腿屈伸', 'レッグエクステンション'],
  'Machine Leg Press': ['器械腿举', 'レッグプレス'],
  'Machine Leg Press (Moving Chair)': ['器械腿举（移动座椅）', 'レッグプレス（可動シート）'],
  'Machine Rear Delt (Reverse) Fly': ['器械反向飞鸟', 'マシンリアデルトフライ'],
  'Machine Row': ['器械划船', 'マシンロウ'],
  'Machine Seated Back Extension': ['器械坐姿背伸', 'マシンバックエクステンション'],
  'Machine Seated Chest Press': ['器械坐姿推胸', 'マシンチェストプレス'],
  'Machine Shoulder Press': ['器械肩推', 'マシンショルダープレス'],
  'Machine Standing Calf Raise': ['器械站姿提踵', 'マシンカーフレイズ'],
  'Machine Torso Rotation': ['器械转体', 'マシントーソローテーション'],
  'Machine Tricep Extension': ['器械三头伸展', 'マシントライセプスエクステンション'],
  'Pull-Up': ['引体向上', '懸垂'],
  'Reverse Crunch': ['反向卷腹', 'リバースクランチ'],
  'Smith Machine Calf Raise': ['史密斯提踵', 'スミスマシンカーフレイズ'],
  'Smith Machine Incline Bench Press': ['史密斯上斜卧推', 'スミスマシンインクラインプレス'],
  'Smith Machine Shoulder Press': ['史密斯肩推', 'スミスマシンショルダープレス'],
  'Smith Machine Squat': ['史密斯深蹲', 'スミスマシンスクワット'],
};

/** [full name, abbreviation] per locale for Motra muscle ids. */
const MUSCLES: Record<string, Record<Locale, [string, string]>> = {
  chest: { en: ['Chest', 'Chest'], zh: ['胸', '胸'], ja: ['胸', '胸'] },
  lats: { en: ['Lats', 'Lats'], zh: ['背阔肌', '背'], ja: ['広背筋', '広背'] },
  traps: { en: ['Traps', 'Trap'], zh: ['斜方肌', '斜方'], ja: ['僧帽筋', '僧帽'] },
  shoulders: { en: ['Shoulders', 'Sh'], zh: ['肩', '肩'], ja: ['肩', '肩'] },
  triceps: { en: ['Triceps', 'Tri'], zh: ['肱三头肌', '三头'], ja: ['上腕三頭筋', '三頭'] },
  biceps: { en: ['Biceps', 'Bi'], zh: ['肱二头肌', '二头'], ja: ['上腕二頭筋', '二頭'] },
  abs: { en: ['Abs', 'Abs'], zh: ['腹肌', '腹'], ja: ['腹筋', '腹'] },
  obliques: { en: ['Obliques', 'Obl'], zh: ['腹斜肌', '腹斜'], ja: ['腹斜筋', '腹斜'] },
  quads: { en: ['Quads', 'Quad'], zh: ['股四头肌', '股四'], ja: ['大腿四頭筋', '四頭'] },
  hamstrings: { en: ['Hamstrings', 'Ham'], zh: ['腘绳肌', '腘绳'], ja: ['ハムストリングス', 'ハム'] },
  glutes: { en: ['Glutes', 'Glu'], zh: ['臀', '臀'], ja: ['臀筋', '臀'] },
  calves: { en: ['Calves', 'Calf'], zh: ['小腿', '小腿'], ja: ['ふくらはぎ', '下腿'] },
  lowerBack: { en: ['Lower back', 'LBk'], zh: ['下背', '下背'], ja: ['腰', '腰'] },
  hipFlexors: { en: ['Hip flexors', 'HipF'], zh: ['髋屈肌', '髋屈'], ja: ['腸腰筋', '腸腰'] },
  abductors: { en: ['Abductors', 'Abd'], zh: ['髋外展肌', '外展'], ja: ['外転筋', '外転'] },
  adductors: { en: ['Adductors', 'Add'], zh: ['髋内收肌', '内收'], ja: ['内転筋', '内転'] },
};

export function exerciseName(id: string, locale: Locale): string {
  if (locale === 'en') return id;
  return EXERCISES[id]?.[locale === 'zh' ? 0 : 1] ?? id;
}

export function muscleName(id: string, locale: Locale): string {
  return MUSCLES[id]?.[locale][0] ?? id;
}

export function muscleAbbr(id: string, locale: Locale): string {
  return MUSCLES[id]?.[locale][1] ?? id;
}

export function listSeparator(locale: Locale): string {
  return locale === 'en' ? ', ' : '、';
}
