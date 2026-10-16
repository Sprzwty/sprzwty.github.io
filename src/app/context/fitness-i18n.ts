import type { ActivityType } from '../lib/fitness/motra';

export type CalendarField = 'title' | 'duration' | 'calories' | 'sets' | 'volume' | 'muscles' | 'hr' | 'effort';

export interface FitnessTranslations {
  title: string;
  subtitle: string;
  lockedDesc: string;
  password: string;
  unlock: string;
  unlocking: string;
  wrongPassword: string;
  lock: string;
  noData: string;
  preview: { button: string; result: (added: number, total: number) => string; hint: string; failed: string };
  tabs: { overview: string; calendar: string; exercises: string; log: string };
  period: { all: string; year: string; month: string; prev: string; next: string };
  stats: { workouts: string; activeDays: string; hours: string; calories: string; volume: string };
  sections: { heatmap: string; trend: string; types: string; hr: string; muscles: string };
  activity: Record<ActivityType, string>;
  fields: Record<CalendarField, string>;
  calendar: { show: string; activities: string; today: string; noWorkouts: string; selectDay: string };
  units: { min: string; kcal: string; sets: string };
  zone: (n: number) => string;
  less: string;
  more: string;
  chart: { minutes: string; calories: string; maxWeight: string; volume: string; est1rm: string };
  exercise: { allMuscles: string; sessions: string; totalSets: string; totalVolume: string; maxWeight: string; best1rm: string; lastDone: string; date: string; sets: string; topSet: string };
  log: { all: string; search: string; allMuscles: string; empty: string; count: (n: number) => string };
  pager: { prev: string; next: string };
  columns: { exercise: string; weight: string; reps: string; time: string; rest: string; muscles: string };
}

export const fitnessEn: FitnessTranslations = {
  title: 'Fitness',
  subtitle: 'Private workout log, exported from Motra.',
  lockedDesc: 'This page is password protected. The data is encrypted and only decrypted in your browser.',
  password: 'Password',
  unlock: 'Unlock',
  unlocking: 'Decrypting…',
  wrongPassword: 'Wrong password.',
  lock: 'Lock',
  noData: 'No data published yet. Attach a Motra .xlsx export to a new row of the Notion "Fitness Imports" database; the next deploy will publish it.',
  preview: {
    button: 'Preview .xlsx',
    result: (added, total) => `Preview: ${added} new workouts, ${total} in total.`,
    hint: 'Preview only — nothing is saved. To publish, upload the file to the Notion "Fitness Imports" database.',
    failed: 'Could not read this file.',
  },
  tabs: { overview: 'Overview', calendar: 'Calendar', exercises: 'Exercises', log: 'Log' },
  period: { all: 'All', year: 'Year', month: 'Month', prev: 'Previous', next: 'Next' },
  stats: { workouts: 'Workouts', activeDays: 'Active days', hours: 'Hours', calories: 'kcal burned', volume: 'Volume lifted' },
  sections: { heatmap: 'Activity heatmap', trend: 'Minutes & calories', types: 'Activity types', hr: 'Heart-rate zones', muscles: 'Sets per muscle group' },
  activity: { strength: 'Strength', walk: 'Walk', stairs: 'Stairs', run: 'Run', hike: 'Hike', ride: 'Ride' },
  fields: { title: 'Activity', duration: 'Duration', calories: 'kcal', sets: 'Sets', volume: 'Volume', muscles: 'Muscles', hr: 'Heart rate', effort: 'Effort' },
  calendar: { show: 'Show', activities: 'Activities', today: 'This month', noWorkouts: 'No workouts on this day.', selectDay: 'Click a day to see its workouts.' },
  units: { min: 'min', kcal: 'kcal', sets: 'sets' },
  zone: (n) => `Zone ${n}`,
  less: 'Less',
  more: 'More',
  chart: { minutes: 'min', calories: 'kcal', maxWeight: 'Max weight (kg)', volume: 'Volume (kg)', est1rm: 'Est. 1RM (kg)' },
  exercise: { allMuscles: 'All muscles', sessions: 'Sessions', totalSets: 'Total sets', totalVolume: 'Total volume', maxWeight: 'Max weight', best1rm: 'Best est. 1RM', lastDone: 'Last done', date: 'Date', sets: 'Sets', topSet: 'Top set' },
  log: { all: 'All', search: 'Search title or exercise…', allMuscles: 'All muscles', empty: 'No matching workouts.', count: (n) => `${n} workouts` },
  pager: { prev: 'Previous', next: 'Next' },
  columns: { exercise: 'Exercise', weight: 'kg', reps: 'Reps', time: 'Time', rest: 'Rest', muscles: 'Muscles' },
};

export const fitnessZh: FitnessTranslations = {
  title: '健身',
  subtitle: '私人训练记录，数据来自 Motra 导出。',
  lockedDesc: '此页面需要密码。数据已加密，仅在你的浏览器中解密。',
  password: '密码',
  unlock: '解锁',
  unlocking: '解密中…',
  wrongPassword: '密码错误。',
  lock: '锁定',
  noData: '尚未发布数据。在 Notion 的「Fitness Imports」数据库新建一行并附上 Motra 导出的 .xlsx，下次部署时会自动发布。',
  preview: {
    button: '预览 .xlsx',
    result: (added, total) => `预览：新增 ${added} 次训练，共 ${total} 次。`,
    hint: '仅预览，不会保存。要发布请把文件上传到 Notion 的「Fitness Imports」数据库。',
    failed: '无法读取该文件。',
  },
  tabs: { overview: '概览', calendar: '月历', exercises: '动作', log: '记录' },
  period: { all: '全部', year: '年', month: '月', prev: '上一个', next: '下一个' },
  stats: { workouts: '训练次数', activeDays: '训练天数', hours: '总时长（小时）', calories: '消耗千卡', volume: '总容量' },
  sections: { heatmap: '训练热力图', trend: '时长与卡路里', types: '运动类型', hr: '心率区间', muscles: '各肌群组数' },
  activity: { strength: '力量', walk: '步行', stairs: '爬楼', run: '跑步', hike: '徒步', ride: '骑行' },
  fields: { title: '项目', duration: '时长', calories: '千卡', sets: '组数', volume: '总重量', muscles: '部位', hr: '心率', effort: '强度' },
  calendar: { show: '显示', activities: '运动类型', today: '本月', noWorkouts: '这一天没有训练。', selectDay: '点击日期查看当天训练。' },
  units: { min: '分钟', kcal: '千卡', sets: '组' },
  zone: (n) => `区间 ${n}`,
  less: '少',
  more: '多',
  chart: { minutes: '分钟', calories: '千卡', maxWeight: '最大重量（kg）', volume: '容量（kg）', est1rm: '推算 1RM（kg）' },
  exercise: { allMuscles: '全部部位', sessions: '训练次数', totalSets: '总组数', totalVolume: '总容量', maxWeight: '最大重量', best1rm: '最佳推算 1RM', lastDone: '最近一次', date: '日期', sets: '各组', topSet: '最佳组' },
  log: { all: '全部', search: '搜索标题或动作…', allMuscles: '全部部位', empty: '没有符合条件的训练。', count: (n) => `共 ${n} 次训练` },
  pager: { prev: '上一页', next: '下一页' },
  columns: { exercise: '动作', weight: 'kg', reps: '次数', time: '时长', rest: '休息', muscles: '部位' },
};

export const fitnessJa: FitnessTranslations = {
  title: 'フィットネス',
  subtitle: 'Motra からエクスポートした個人のトレーニング記録。',
  lockedDesc: 'このページはパスワードで保護されています。データは暗号化され、ブラウザ内でのみ復号されます。',
  password: 'パスワード',
  unlock: 'ロック解除',
  unlocking: '復号中…',
  wrongPassword: 'パスワードが違います。',
  lock: 'ロック',
  noData: 'まだデータがありません。Notion の「Fitness Imports」データベースに行を追加して Motra の .xlsx を添付すると、次回のデプロイで公開されます。',
  preview: {
    button: '.xlsx をプレビュー',
    result: (added, total) => `プレビュー：新規 ${added} 件、合計 ${total} 件。`,
    hint: 'プレビューのみで保存はされません。公開するには Notion の「Fitness Imports」にアップロードしてください。',
    failed: 'このファイルを読み込めませんでした。',
  },
  tabs: { overview: '概要', calendar: 'カレンダー', exercises: '種目', log: '記録' },
  period: { all: 'すべて', year: '年', month: '月', prev: '前へ', next: '次へ' },
  stats: { workouts: 'ワークアウト', activeDays: '活動日数', hours: '合計時間（h）', calories: '消費 kcal', volume: '総挙上量' },
  sections: { heatmap: 'アクティビティ', trend: '時間とカロリー', types: '種類の内訳', hr: '心拍ゾーン', muscles: '筋群ごとのセット数' },
  activity: { strength: '筋トレ', walk: 'ウォーク', stairs: '階段', run: 'ラン', hike: 'ハイク', ride: 'ライド' },
  fields: { title: '種類', duration: '時間', calories: 'kcal', sets: 'セット', volume: '総重量', muscles: '部位', hr: '心拍', effort: '強度' },
  calendar: { show: '表示', activities: '種類', today: '今月', noWorkouts: 'この日のワークアウトはありません。', selectDay: '日付をクリックすると詳細を表示します。' },
  units: { min: '分', kcal: 'kcal', sets: 'セット' },
  zone: (n) => `ゾーン ${n}`,
  less: '少',
  more: '多',
  chart: { minutes: '分', calories: 'kcal', maxWeight: '最大重量（kg）', volume: 'ボリューム（kg）', est1rm: '推定 1RM（kg）' },
  exercise: { allMuscles: 'すべての部位', sessions: '実施回数', totalSets: '総セット数', totalVolume: '総ボリューム', maxWeight: '最大重量', best1rm: '最高推定 1RM', lastDone: '前回', date: '日付', sets: 'セット', topSet: 'トップセット' },
  log: { all: 'すべて', search: 'タイトルや種目で検索…', allMuscles: 'すべての部位', empty: '該当するワークアウトはありません。', count: (n) => `${n} 件` },
  pager: { prev: '前へ', next: '次へ' },
  columns: { exercise: '種目', weight: 'kg', reps: '回数', time: '時間', rest: '休憩', muscles: '部位' },
};
