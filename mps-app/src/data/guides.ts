import { GradientName } from '@/theme';
import { Localized } from '@/lib/translations';

export type GuideStep = {
  emoji: string;
  title: Localized;
  body: Localized;
  quiz?: { question: Localized; options: Localized[]; answer: number };
};

export type Guide = {
  id: string;
  emoji: string;
  gradient: GradientName;
  level: 'beginner' | 'intermediate' | 'advanced';
  minutes: number;
  topic: Localized;
  title: Localized;
  summary: Localized;
  steps: GuideStep[];
};

const L = (en: string, ar: string): Localized => ({ en, ar });

export const GUIDES: Guide[] = [
  {
    id: 'watering',
    emoji: '💧',
    gradient: 'sky',
    level: 'beginner',
    minutes: 6,
    topic: L('Watering', 'الري'),
    title: L('Watering the right way', 'الري بالطريقة الصحيحة'),
    summary: L('Learn when, how much and how to water — the #1 skill in plant care.', 'تعلّم متى وكم وكيف تسقي — المهارة الأولى في رعاية النباتات.'),
    steps: [
      {
        emoji: '👆',
        title: L('Use the finger test', 'استخدم اختبار الإصبع'),
        body: L('Push a finger 2–3 cm into the soil. If it feels dry, water. If it is still moist, wait a day or two and check again.', 'أدخل إصبعك 2–3 سم في التربة. إن كانت جافة فاسقِ، وإن كانت رطبة فانتظر يومًا أو يومين ثم افحص مجددًا.'),
      },
      {
        emoji: '🚿',
        title: L('Water deeply, not often', 'اسقِ بعمق لا بكثرة'),
        body: L('Pour slowly until water runs out of the drainage holes. Deep watering grows deep, strong roots; little sips grow shallow ones.', 'اسكب الماء ببطء حتى يخرج من فتحات التصريف. الري العميق ينمّي جذورًا عميقة قوية، أما الرشفات القليلة فتنتج جذورًا سطحية.'),
      },
      {
        emoji: '🌅',
        title: L('Choose the right time', 'اختر الوقت المناسب'),
        body: L('Water early in the morning. In Gulf summers, midday water evaporates quickly and wet leaves can scorch in the sun.', 'اسقِ في الصباح الباكر. في صيف الخليج يتبخر ماء الظهيرة بسرعة وقد تحترق الأوراق المبتلة تحت الشمس.'),
        quiz: {
          question: L('When is the best time to water outdoor plants in summer?', 'ما أفضل وقت لري النباتات الخارجية صيفًا؟'),
          options: [L('Noon', 'الظهيرة'), L('Early morning', 'الصباح الباكر'), L('Whenever I remember', 'متى تذكّرت')],
          answer: 1,
        },
      },
      {
        emoji: '🪣',
        title: L('Empty the saucer', 'أفرغ الصحن'),
        body: L('Never leave a pot standing in water for more than 30 minutes — it is the fastest route to root rot.', 'لا تترك الأصيص في الماء أكثر من 30 دقيقة — إنها أسرع طريق لتعفّن الجذور.'),
      },
    ],
  },
  {
    id: 'planting',
    emoji: '🌱',
    gradient: 'primary',
    level: 'beginner',
    minutes: 8,
    topic: L('Planting', 'الزراعة'),
    title: L('Sowing seeds & transplanting', 'بذر البذور والشتل'),
    summary: L('From seed tray to garden bed, step by step.', 'من صينية البذور إلى حوض الحديقة خطوة بخطوة.'),
    steps: [
      {
        emoji: '🧺',
        title: L('Prepare a seed mix', 'جهّز خلطة البذور'),
        body: L('Use a light, sterile seed-starting mix. Garden soil is too heavy and may carry disease.', 'استخدم خلطة إنبات خفيفة ومعقّمة. تربة الحديقة ثقيلة وقد تحمل الأمراض.'),
      },
      {
        emoji: '📏',
        title: L('Sow at the right depth', 'ازرع على العمق المناسب'),
        body: L('A good rule: plant seeds about twice as deep as they are wide. Tiny seeds just sit on the surface.', 'قاعدة جيدة: ازرع البذرة على عمق يعادل ضعف عرضها تقريبًا. البذور الدقيقة توضع على السطح.'),
        quiz: {
          question: L('How deep should you plant a seed?', 'ما العمق المناسب لزراعة البذرة؟'),
          options: [L('Twice its width', 'ضعف عرضها'), L('10 cm always', '10 سم دائمًا'), L('On top of a rock', 'فوق حجر')],
          answer: 0,
        },
      },
      {
        emoji: '☀️',
        title: L('Harden off seedlings', 'أقلِم الشتلات'),
        body: L('Before transplanting, set seedlings outside for 1–2 hours a day, increasing over a week, so they adapt to sun and wind.', 'قبل الشتل، ضع الشتلات في الخارج ساعة أو ساعتين يوميًا وزد المدة خلال أسبوع لتتأقلم مع الشمس والرياح.'),
      },
      {
        emoji: '🕳️',
        title: L('Transplant gently', 'اشتل بلطف'),
        body: L('Dig a hole as deep as the root ball, set the plant in, firm the soil and water well. Transplant in the late afternoon to reduce shock.', 'احفر حفرة بعمق كتلة الجذور، ضع النبتة، اضغط التربة واسقِ جيدًا. اشتل في آخر العصر لتقليل الصدمة.'),
      },
    ],
  },
  {
    id: 'pruning',
    emoji: '✂️',
    gradient: 'violet',
    level: 'intermediate',
    minutes: 7,
    topic: L('Pruning', 'التقليم'),
    title: L('Pruning for healthier plants', 'التقليم لنباتات أكثر صحة'),
    summary: L('Where to cut, when, and why it makes plants stronger.', 'أين تقص، ومتى، ولماذا يقوّي ذلك النباتات.'),
    steps: [
      {
        emoji: '🧼',
        title: L('Clean your tools', 'نظّف أدواتك'),
        body: L('Wipe blades with 70% alcohol between plants to avoid spreading disease.', 'امسح الشفرات بكحول 70% بين النباتات لتجنّب نقل الأمراض.'),
      },
      {
        emoji: '🍂',
        title: L('Start with the 3 Ds', 'ابدأ بالثلاثة: الميت والمريض والتالف'),
        body: L('Remove dead, diseased and damaged growth first. This alone improves health and airflow.', 'أزل أولًا الأجزاء الميتة والمريضة والتالفة. هذا وحده يحسّن الصحة والتهوية.'),
      },
      {
        emoji: '📐',
        title: L('Cut above a node', 'قصّ فوق العقدة'),
        body: L('Make a clean 45° cut about 5 mm above a leaf node or outward-facing bud. New growth will sprout from there.', 'اقطع قطعًا نظيفًا بزاوية 45° على بعد 5 مم فوق عقدة ورقية أو برعم متجه للخارج. سينطلق النمو الجديد من هناك.'),
        quiz: {
          question: L('Where should you make a pruning cut?', 'أين يجب أن يكون قطع التقليم؟'),
          options: [L('In the middle of a stem', 'في منتصف الساق'), L('Just above a node', 'فوق العقدة مباشرة'), L('At the roots', 'عند الجذور')],
          answer: 1,
        },
      },
      {
        emoji: '⚖️',
        title: L('Never remove more than a third', 'لا تُزل أكثر من الثلث'),
        body: L('Taking more than 1/3 of the plant at once causes stress. Spread heavy pruning over several sessions.', 'إزالة أكثر من ثلث النبتة دفعة واحدة تسبب الإجهاد. وزّع التقليم الكبير على عدة مرات.'),
      },
    ],
  },
  {
    id: 'soil',
    emoji: '🪱',
    gradient: 'sun',
    level: 'intermediate',
    minutes: 9,
    topic: L('Soil', 'التربة'),
    title: L('Building great soil in the Gulf', 'بناء تربة ممتازة في الخليج'),
    summary: L('Turn sandy, alkaline ground into a living, fertile bed.', 'حوّل الأرض الرملية القلوية إلى حوض حيّ خصب.'),
    steps: [
      {
        emoji: '🏜️',
        title: L('Know your soil', 'اعرف تربتك'),
        body: L('Local soils are often sandy, salty and alkaline (pH 8+). They drain fast and hold few nutrients.', 'التربة المحلية غالبًا رملية ومالحة وقلوية (حموضة 8+). تصرف الماء بسرعة وتحتفظ بقليل من العناصر.'),
      },
      {
        emoji: '♻️',
        title: L('Add organic matter', 'أضف المادة العضوية'),
        body: L('Mix 30–40% compost or well-rotted manure into the top 20 cm. It holds water and feeds soil life.', 'اخلط 30–40% من السماد العضوي أو الروث المتحلل في أعلى 20 سم. فهو يحتفظ بالماء ويغذي حياة التربة.'),
      },
      {
        emoji: '🧂',
        title: L('Flush out salts', 'اغسل الأملاح'),
        body: L('Once a month, water deeply to push accumulated salts below the root zone.', 'مرة شهريًا، اسقِ ريًا عميقًا لدفع الأملاح المتراكمة إلى ما تحت منطقة الجذور.'),
        quiz: {
          question: L('What improves sandy soil the most?', 'ما الذي يحسّن التربة الرملية أكثر؟'),
          options: [L('More sand', 'المزيد من الرمل'), L('Compost', 'السماد العضوي'), L('Gravel', 'الحصى')],
          answer: 1,
        },
      },
      {
        emoji: '🍂',
        title: L('Mulch everything', 'غطِّ كل شيء'),
        body: L('A 5–8 cm mulch layer cools roots by up to 10 °C and cuts water use by a third.', 'طبقة غطاء بسمك 5–8 سم تبرّد الجذور حتى 10 °م وتقلل استهلاك الماء بمقدار الثلث.'),
      },
    ],
  },
  {
    id: 'pests',
    emoji: '🐞',
    gradient: 'coral',
    level: 'advanced',
    minutes: 10,
    topic: L('Pest control', 'مكافحة الآفات'),
    title: L('Natural pest control', 'المكافحة الطبيعية للآفات'),
    summary: L('Integrated pest management without harsh chemicals.', 'الإدارة المتكاملة للآفات دون مواد كيميائية قاسية.'),
    steps: [
      {
        emoji: '🔍',
        title: L('Inspect weekly', 'افحص أسبوعيًا'),
        body: L('Check leaf undersides, new shoots and stems. Catching pests early makes them easy to beat.', 'افحص الوجه السفلي للأوراق والبراعم الجديدة والسيقان. الاكتشاف المبكر يجعل المكافحة سهلة.'),
      },
      {
        emoji: '🐞',
        title: L('Recruit allies', 'استعن بالحلفاء'),
        body: L('Ladybirds, lacewings and hoverflies eat aphids. Plant marigold, dill and alyssum to attract them.', 'الدعسوقة وأسد المن وذباب الأزهار تأكل المنّ. ازرع القطيفة والشبت والأليسوم لجذبها.'),
      },
      {
        emoji: '🧴',
        title: L('Use soft sprays', 'استخدم رشّات لطيفة'),
        body: L('Neem oil (5 ml/L) with a drop of soap controls most soft pests. Spray in the evening to protect bees.', 'زيت النيم (5 مل/لتر) مع قطرة صابون يكافح معظم الآفات الرخوة. رشّ مساءً لحماية النحل.'),
        quiz: {
          question: L('Why spray neem oil in the evening?', 'لماذا يُرش زيت النيم مساءً؟'),
          options: [L('It smells better', 'رائحته أفضل'), L('To protect bees and avoid leaf burn', 'لحماية النحل وتجنب حرق الأوراق'), L('It is cheaper', 'أرخص')],
          answer: 1,
        },
      },
      {
        emoji: '🧹',
        title: L('Keep the garden clean', 'حافظ على نظافة الحديقة'),
        body: L('Remove fallen leaves and weeds, where pests and fungi overwinter.', 'أزل الأوراق المتساقطة والأعشاب الضارة حيث تختبئ الآفات والفطريات.'),
      },
    ],
  },
];

export const guideById = (id: string) => GUIDES.find((g) => g.id === id);
