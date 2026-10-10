import { Localized } from '@/lib/translations';

export type SeasonType = 'cool' | 'warm' | 'perennial';
export type SeasonId = 'winter' | 'spring' | 'summer' | 'autumn';

export type PlantInfo = {
  id: string;
  emoji: string;
  name: Localized;
  scientific: string;
  family: string;
  description: Localized;
  care: {
    water: Localized;
    light: Localized;
    soil: Localized;
    temperature: Localized;
    fertilizer: Localized;
    humidity: Localized;
  };
  /** Suggested reminder intervals in days. */
  schedule: { watering: number; fertilizing: number; pruning?: number; misting?: number; harvesting?: number };
  seasonType: SeasonType;
  plantIn: SeasonId[];
  tags: string[];
};

const L = (en: string, ar: string): Localized => ({ en, ar });

export const PLANTS: PlantInfo[] = [
  {
    id: 'tomato',
    emoji: '🍅',
    name: L('Tomato', 'الطماطم'),
    scientific: 'Solanum lycopersicum',
    family: 'Solanaceae',
    description: L(
      'A rewarding fruiting vegetable that loves sun. In the Gulf it grows best from October to March.',
      'خضار مثمرة مجزية تحب الشمس. في الخليج تنمو أفضل من أكتوبر حتى مارس.',
    ),
    care: {
      water: L('Deeply every 2–3 days; keep soil evenly moist, never soggy.', 'ريّ عميق كل 2–3 أيام؛ حافظ على رطوبة متوازنة دون تشبّع.'),
      light: L('Full sun, 6–8 hours a day.', 'شمس كاملة من 6 إلى 8 ساعات يوميًا.'),
      soil: L('Rich, well-drained loam with compost, pH 6.2–6.8.', 'تربة طميية غنية جيدة الصرف مع سماد عضوي، حموضة 6.2–6.8.'),
      temperature: L('18–29 °C. Fruit sets poorly above 32 °C.', '18–29 °م. يضعف عقد الثمار فوق 32 °م.'),
      fertilizer: L('Balanced feed every 2 weeks; switch to high-potassium when flowering.', 'سماد متوازن كل أسبوعين؛ ثم سماد غني بالبوتاسيوم عند الإزهار.'),
      humidity: L('Moderate; good airflow prevents fungal disease.', 'معتدلة؛ التهوية الجيدة تمنع الأمراض الفطرية.'),
    },
    schedule: { watering: 2, fertilizing: 14, pruning: 10, harvesting: 4 },
    seasonType: 'cool',
    plantIn: ['autumn', 'winter'],
    tags: ['tomato', 'vegetable', 'fruit', 'red', 'طماطم'],
  },
  {
    id: 'basil',
    emoji: '🌿',
    name: L('Sweet Basil', 'الريحان'),
    scientific: 'Ocimum basilicum',
    family: 'Lamiaceae',
    description: L('Fragrant culinary herb that thrives in warmth. Pinch tips to keep it bushy.', 'عشب عطري للطهي يزدهر في الدفء. اقرص الأطراف ليبقى كثيفًا.'),
    care: {
      water: L('When the top 2 cm of soil is dry.', 'عندما يجف أعلى 2 سم من التربة.'),
      light: L('6+ hours of sun; afternoon shade in summer.', 'أكثر من 6 ساعات شمس؛ ظل بعد الظهر في الصيف.'),
      soil: L('Light, fertile, well-drained potting mix.', 'خلطة خفيفة خصبة جيدة الصرف.'),
      temperature: L('20–35 °C. Dislikes cold below 10 °C.', '20–35 °م. لا يحب البرد تحت 10 °م.'),
      fertilizer: L('Light liquid feed monthly.', 'سماد سائل خفيف شهريًا.'),
      humidity: L('Average.', 'متوسطة.'),
    },
    schedule: { watering: 2, fertilizing: 30, pruning: 7, harvesting: 7 },
    seasonType: 'warm',
    plantIn: ['spring', 'summer'],
    tags: ['basil', 'herb', 'ريحان'],
  },
  {
    id: 'mint',
    emoji: '🌱',
    name: L('Mint', 'النعناع'),
    scientific: 'Mentha spicata',
    family: 'Lamiaceae',
    description: L('Vigorous herb perfect for tea. Grow in a pot to stop it spreading.', 'عشب قوي النمو مثالي للشاي. ازرعه في أصيص لمنع انتشاره.'),
    care: {
      water: L('Keep soil consistently moist.', 'حافظ على رطوبة التربة باستمرار.'),
      light: L('Partial shade to bright light.', 'ظل جزئي إلى إضاءة ساطعة.'),
      soil: L('Moist, rich potting soil.', 'تربة غنية رطبة.'),
      temperature: L('15–30 °C.', '15–30 °م.'),
      fertilizer: L('Every 4–6 weeks during growth.', 'كل 4–6 أسابيع أثناء النمو.'),
      humidity: L('Moderate to high.', 'معتدلة إلى مرتفعة.'),
    },
    schedule: { watering: 1, fertilizing: 35, harvesting: 7 },
    seasonType: 'perennial',
    plantIn: ['autumn', 'winter', 'spring'],
    tags: ['mint', 'herb', 'نعناع'],
  },
  {
    id: 'aloe',
    emoji: '🪴',
    name: L('Aloe Vera', 'الصبار (ألوفيرا)'),
    scientific: 'Aloe barbadensis miller',
    family: 'Asphodelaceae',
    description: L('Hardy succulent with soothing gel. Ideal for hot, dry climates.', 'نبات عصاري متين ذو هلام ملطّف. مثالي للمناخ الحار الجاف.'),
    care: {
      water: L('Every 2–3 weeks; let soil dry completely.', 'كل 2–3 أسابيع؛ اترك التربة تجف تمامًا.'),
      light: L('Bright light; tolerates full sun.', 'إضاءة ساطعة؛ يتحمّل الشمس الكاملة.'),
      soil: L('Sandy cactus mix with excellent drainage.', 'خلطة صبار رملية ممتازة الصرف.'),
      temperature: L('13–40 °C.', '13–40 °م.'),
      fertilizer: L('Once in spring is enough.', 'مرة واحدة في الربيع تكفي.'),
      humidity: L('Low.', 'منخفضة.'),
    },
    schedule: { watering: 18, fertilizing: 120 },
    seasonType: 'perennial',
    plantIn: ['spring', 'autumn'],
    tags: ['aloe', 'succulent', 'cactus', 'صبار'],
  },
  {
    id: 'monstera',
    emoji: '🍃',
    name: L('Monstera', 'المونستيرا'),
    scientific: 'Monstera deliciosa',
    family: 'Araceae',
    description: L('Iconic split-leaf houseplant. Loves warmth and bright, indirect light.', 'نبتة منزلية شهيرة بأوراقها المشقوقة. تحب الدفء والضوء الساطع غير المباشر.'),
    care: {
      water: L('Weekly, when top 5 cm are dry.', 'أسبوعيًا، عندما يجف أعلى 5 سم.'),
      light: L('Bright, indirect light. Avoid harsh sun.', 'ضوء ساطع غير مباشر. تجنّب الشمس الحارقة.'),
      soil: L('Chunky aroid mix: bark, perlite, peat.', 'خلطة خشنة: لحاء وبيرلايت وبيتموس.'),
      temperature: L('18–30 °C.', '18–30 °م.'),
      fertilizer: L('Monthly in spring and summer.', 'شهريًا في الربيع والصيف.'),
      humidity: L('High — mist or use a pebble tray in AC rooms.', 'مرتفعة — رشّ الرذاذ أو استخدم صينية حصى في الغرف المكيّفة.'),
    },
    schedule: { watering: 7, fertilizing: 30, misting: 3 },
    seasonType: 'perennial',
    plantIn: ['spring', 'summer'],
    tags: ['monstera', 'houseplant', 'indoor', 'مونستيرا'],
  },
  {
    id: 'datepalm',
    emoji: '🌴',
    name: L('Date Palm', 'نخلة التمر'),
    scientific: 'Phoenix dactylifera',
    family: 'Arecaceae',
    description: L('The heritage tree of the Gulf. Extremely heat-tolerant once established.', 'شجرة التراث في الخليج. تتحمل الحرارة الشديدة بعد ترسّخها.'),
    care: {
      water: L('Deep watering weekly in summer, every 2–3 weeks in winter.', 'ريّ عميق أسبوعيًا صيفًا، وكل 2–3 أسابيع شتاءً.'),
      light: L('Full sun.', 'شمس كاملة.'),
      soil: L('Sandy, well-drained; tolerates salinity.', 'رملية جيدة الصرف؛ تتحمّل الملوحة.'),
      temperature: L('Up to 50 °C.', 'حتى 50 °م.'),
      fertilizer: L('Palm fertilizer with manganese 3× a year.', 'سماد النخيل مع المنغنيز 3 مرات سنويًا.'),
      humidity: L('Low.', 'منخفضة.'),
    },
    schedule: { watering: 7, fertilizing: 120, pruning: 180, harvesting: 365 },
    seasonType: 'perennial',
    plantIn: ['spring', 'autumn'],
    tags: ['palm', 'date', 'tree', 'نخلة'],
  },
  {
    id: 'lettuce',
    emoji: '🥬',
    name: L('Lettuce', 'الخس'),
    scientific: 'Lactuca sativa',
    family: 'Asteraceae',
    description: L('Fast-growing leafy green. Bolts in heat — plant in the cool season.', 'خضار ورقية سريعة النمو. تُزهر مبكرًا في الحر — ازرعها في الموسم البارد.'),
    care: {
      water: L('Little and often; never let it dry out.', 'كميات قليلة ومتكررة؛ لا تدعها تجف.'),
      light: L('Full sun in winter, light shade otherwise.', 'شمس كاملة شتاءً، وظل خفيف في غيره.'),
      soil: L('Loose, rich, moisture-retentive.', 'تربة رخوة غنية تحتفظ بالرطوبة.'),
      temperature: L('10–22 °C.', '10–22 °م.'),
      fertilizer: L('Nitrogen-rich feed every 2–3 weeks.', 'سماد غني بالنيتروجين كل 2–3 أسابيع.'),
      humidity: L('Moderate.', 'معتدلة.'),
    },
    schedule: { watering: 1, fertilizing: 18, harvesting: 5 },
    seasonType: 'cool',
    plantIn: ['autumn', 'winter'],
    tags: ['lettuce', 'leafy', 'salad', 'خس'],
  },
  {
    id: 'okra',
    emoji: '🫛',
    name: L('Okra', 'البامية'),
    scientific: 'Abelmoschus esculentus',
    family: 'Malvaceae',
    description: L('A summer champion that loves heat when most crops struggle.', 'بطلة الصيف التي تحب الحرارة حين تعاني معظم المحاصيل.'),
    care: {
      water: L('Every 2–3 days in peak heat; mulch well.', 'كل 2–3 أيام في ذروة الحر؛ استخدم الغطاء العضوي.'),
      light: L('Full sun.', 'شمس كاملة.'),
      soil: L('Well-drained, fertile soil.', 'تربة خصبة جيدة الصرف.'),
      temperature: L('24–40 °C.', '24–40 °م.'),
      fertilizer: L('Side-dress with compost monthly.', 'أضف سمادًا عضويًا بجانب النبات شهريًا.'),
      humidity: L('Tolerant.', 'تتحمّل.'),
    },
    schedule: { watering: 2, fertilizing: 30, harvesting: 2 },
    seasonType: 'warm',
    plantIn: ['spring', 'summer'],
    tags: ['okra', 'vegetable', 'بامية'],
  },
  {
    id: 'bougainvillea',
    emoji: '🌺',
    name: L('Bougainvillea', 'الجهنمية'),
    scientific: 'Bougainvillea glabra',
    family: 'Nyctaginaceae',
    description: L('Vibrant climber that blooms best with sun and a little neglect.', 'متسلّقة زاهية تزهر أفضل مع الشمس وقليل من الإهمال.'),
    care: {
      water: L('Weekly; let soil dry between waterings.', 'أسبوعيًا؛ اترك التربة تجف بين الريّات.'),
      light: L('Full sun for the best flowers.', 'شمس كاملة لأفضل إزهار.'),
      soil: L('Well-drained, slightly acidic.', 'جيدة الصرف، مائلة للحموضة قليلًا.'),
      temperature: L('15–40 °C.', '15–40 °م.'),
      fertilizer: L('Low-nitrogen bloom feed monthly.', 'سماد إزهار منخفض النيتروجين شهريًا.'),
      humidity: L('Low to moderate.', 'منخفضة إلى معتدلة.'),
    },
    schedule: { watering: 7, fertilizing: 30, pruning: 60 },
    seasonType: 'perennial',
    plantIn: ['spring', 'autumn'],
    tags: ['bougainvillea', 'flower', 'climber', 'جهنمية'],
  },
  {
    id: 'pothos',
    emoji: '🪴',
    name: L('Golden Pothos', 'البوتس الذهبي'),
    scientific: 'Epipremnum aureum',
    family: 'Araceae',
    description: L('Nearly indestructible trailing houseplant — perfect for beginners.', 'نبتة منزلية متدلية شبه لا تُقهر — مثالية للمبتدئين.'),
    care: {
      water: L('Every 7–10 days when the top half is dry.', 'كل 7–10 أيام عندما يجف النصف العلوي.'),
      light: L('Low to bright indirect light.', 'إضاءة منخفضة إلى ساطعة غير مباشرة.'),
      soil: L('Any well-draining potting mix.', 'أي خلطة جيدة الصرف.'),
      temperature: L('15–30 °C.', '15–30 °م.'),
      fertilizer: L('Every 6–8 weeks.', 'كل 6–8 أسابيع.'),
      humidity: L('Adaptable.', 'يتكيّف.'),
    },
    schedule: { watering: 8, fertilizing: 50, pruning: 60 },
    seasonType: 'perennial',
    plantIn: ['winter', 'spring', 'summer', 'autumn'],
    tags: ['pothos', 'houseplant', 'indoor', 'بوتس'],
  },
  {
    id: 'cucumber',
    emoji: '🥒',
    name: L('Cucumber', 'الخيار'),
    scientific: 'Cucumis sativus',
    family: 'Cucurbitaceae',
    description: L('Quick climber that gives crunchy fruit within 50–60 days.', 'متسلّق سريع يعطي ثمارًا مقرمشة خلال 50–60 يومًا.'),
    care: {
      water: L('Daily in warm weather; water at the base.', 'يوميًا في الطقس الدافئ؛ اسقِ عند القاعدة.'),
      light: L('Full sun.', 'شمس كاملة.'),
      soil: L('Rich, moist, well-drained.', 'غنية رطبة جيدة الصرف.'),
      temperature: L('18–30 °C.', '18–30 °م.'),
      fertilizer: L('Balanced feed every 2 weeks.', 'سماد متوازن كل أسبوعين.'),
      humidity: L('Moderate; watch for powdery mildew.', 'معتدلة؛ راقب البياض الدقيقي.'),
    },
    schedule: { watering: 1, fertilizing: 14, harvesting: 2 },
    seasonType: 'warm',
    plantIn: ['autumn', 'spring'],
    tags: ['cucumber', 'vegetable', 'خيار'],
  },
  {
    id: 'jasmine',
    emoji: '🌼',
    name: L('Arabian Jasmine', 'الفل العربي'),
    scientific: 'Jasminum sambac',
    family: 'Oleaceae',
    description: L('Beloved for its intensely fragrant white flowers on summer evenings.', 'محبوب لأزهاره البيضاء شديدة العطر في أمسيات الصيف.'),
    care: {
      water: L('Keep moist in summer, reduce in winter.', 'حافظ على الرطوبة صيفًا وقلّل الري شتاءً.'),
      light: L('Full sun to light shade.', 'شمس كاملة إلى ظل خفيف.'),
      soil: L('Rich, well-drained.', 'غنية جيدة الصرف.'),
      temperature: L('18–38 °C.', '18–38 °م.'),
      fertilizer: L('Bloom feed every 3 weeks in season.', 'سماد إزهار كل 3 أسابيع في الموسم.'),
      humidity: L('Moderate.', 'معتدلة.'),
    },
    schedule: { watering: 3, fertilizing: 21, pruning: 45 },
    seasonType: 'perennial',
    plantIn: ['spring', 'summer'],
    tags: ['jasmine', 'flower', 'fragrant', 'فل', 'ياسمين'],
  },
];

export const plantById = (id: string) => PLANTS.find((p) => p.id === id);
