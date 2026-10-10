import { GradientName } from '@/theme';
import { Localized } from '@/lib/translations';

import { SeasonId } from './plants';

export type Season = {
  id: SeasonId;
  emoji: string;
  gradient: GradientName;
  months: Localized;
  climate: Localized;
  tips: Localized[];
};

const L = (en: string, ar: string): Localized => ({ en, ar });

/** Seasons tuned for the Gulf (Bahrain) climate. */
export const SEASONS: Season[] = [
  {
    id: 'winter',
    emoji: '❄️',
    gradient: 'sky',
    months: L('Dec – Feb', 'ديسمبر – فبراير'),
    climate: L('Mild 15–22 °C — the prime growing season.', 'معتدل 15–22 °م — ذروة موسم الزراعة.'),
    tips: [
      L('Peak time for leafy greens, tomatoes, herbs and flowers.', 'أفضل وقت للخضار الورقية والطماطم والأعشاب والزهور.'),
      L('Reduce watering — soil stays moist longer.', 'قلّل الري — تبقى التربة رطبة لفترة أطول.'),
      L('Protect seedlings on rare cold, windy nights.', 'احمِ الشتلات في الليالي الباردة العاصفة النادرة.'),
    ],
  },
  {
    id: 'spring',
    emoji: '🌸',
    gradient: 'violet',
    months: L('Mar – May', 'مارس – مايو'),
    climate: L('Warming 22–35 °C with dusty winds.', 'دافئ 22–35 °م مع رياح مغبرة.'),
    tips: [
      L('Sow heat-lovers like okra, basil and melons.', 'ازرع محبّات الحرارة مثل البامية والريحان والبطيخ.'),
      L('Mulch beds before the summer heat arrives.', 'غطِّ الأحواض قبل وصول حرارة الصيف.'),
      L('Wash dust off leaves to deter spider mites.', 'اغسل الغبار عن الأوراق لردع العنكبوت الأحمر.'),
    ],
  },
  {
    id: 'summer',
    emoji: '☀️',
    gradient: 'sun',
    months: L('Jun – Sep', 'يونيو – سبتمبر'),
    climate: L('Extreme 35–48 °C with high humidity.', 'شديد الحرارة 35–48 °م مع رطوبة عالية.'),
    tips: [
      L('Water at dawn; consider drip irrigation on a timer.', 'اسقِ عند الفجر؛ واستخدم الري بالتنقيط بمؤقّت.'),
      L('Use 30–50% shade cloth over vegetables.', 'استخدم شبك تظليل 30–50% فوق الخضار.'),
      L('Move potted plants away from reflected heat.', 'أبعد الأصص عن الحرارة المنعكسة من الجدران.'),
    ],
  },
  {
    id: 'autumn',
    emoji: '🍂',
    gradient: 'coral',
    months: L('Oct – Nov', 'أكتوبر – نوفمبر'),
    climate: L('Cooling 25–32 °C — planting season begins.', 'يبرد 25–32 °م — يبدأ موسم الزراعة.'),
    tips: [
      L('Prepare beds with compost and start cool-season seeds.', 'جهّز الأحواض بالسماد العضوي وابدأ بذور الموسم البارد.'),
      L('Best time to plant trees, palms and shrubs.', 'أفضل وقت لزراعة الأشجار والنخيل والشجيرات.'),
      L('Prune summer-stressed plants to refresh growth.', 'قلّم النباتات المجهدة من الصيف لتجديد نموها.'),
    ],
  },
];

export function currentSeason(date = new Date()): Season {
  const m = date.getMonth(); // 0 = Jan
  const id: SeasonId = m === 11 || m <= 1 ? 'winter' : m <= 4 ? 'spring' : m <= 8 ? 'summer' : 'autumn';
  return SEASONS.find((s) => s.id === id)!;
}

export const TIPS: Localized[] = [
  L('Yellow lower leaves often mean overwatering — check the soil before you water.', 'اصفرار الأوراق السفلية يعني غالبًا الإفراط في الري — افحص التربة قبل السقي.'),
  L('Rotate indoor pots a quarter turn weekly so they grow evenly toward the light.', 'أدر الأصص الداخلية ربع دورة أسبوعيًا لتنمو بالتساوي نحو الضوء.'),
  L('AC rooms are very dry — group plants together to raise humidity.', 'الغرف المكيّفة جافة جدًا — اجمع النباتات معًا لرفع الرطوبة.'),
  L('Mulch can cut summer water use by a third.', 'الغطاء العضوي يمكن أن يقلل استهلاك الماء صيفًا بمقدار الثلث.'),
  L('Coffee grounds are great for compost but too acidic to use alone.', 'تفل القهوة رائع للسماد العضوي لكنه شديد الحموضة لاستخدامه وحده.'),
  L('Water with rainwater or rested tap water to reduce salt build-up.', 'اسقِ بماء المطر أو ماء الصنبور المتروك لتقليل تراكم الأملاح.'),
];
