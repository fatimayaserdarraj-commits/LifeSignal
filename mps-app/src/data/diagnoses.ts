import { Localized } from '@/lib/translations';

export type IssueCategory = 'pest' | 'disease' | 'nutrient' | 'healthy';

export type Diagnosis = {
  id: string;
  category: IssueCategory;
  emoji: string;
  name: Localized;
  severity: number; // 0..1
  causes: Localized;
  treatment: Localized[];
  prevention: Localized[];
  /** Keywords (any language) that point to this issue in the offline matcher. */
  keywords: string[];
};

const L = (en: string, ar: string): Localized => ({ en, ar });

export const DIAGNOSES: Diagnosis[] = [
  {
    id: 'aphids',
    category: 'pest',
    emoji: '🐛',
    name: L('Aphid infestation', 'إصابة بحشرة المنّ'),
    severity: 0.55,
    causes: L('Soft-bodied sap-sucking insects clustering on new growth; often worsened by excess nitrogen.', 'حشرات رخوة تمتص العصارة وتتجمع على النموات الحديثة؛ يزيدها الإفراط في النيتروجين.'),
    treatment: [
      L('Blast colonies off with a strong spray of water.', 'أزل المستعمرات برذاذ ماء قوي.'),
      L('Spray insecticidal soap or neem oil every 5–7 days, in the evening.', 'رشّ صابونًا مبيدًا للحشرات أو زيت النيم كل 5–7 أيام مساءً.'),
      L('Prune heavily infested tips.', 'قلّم الأطراف شديدة الإصابة.'),
    ],
    prevention: [
      L('Encourage ladybirds and lacewings.', 'شجّع وجود الدعسوقة وأسد المن.'),
      L('Avoid over-fertilizing with nitrogen.', 'تجنّب الإفراط في التسميد النيتروجيني.'),
    ],
    keywords: ['aphid', 'sticky', 'curl', 'tiny insects', 'green bugs', 'منّ', 'من', 'لزج', 'حشرات صغيرة', 'تجعد'],
  },
  {
    id: 'spidermites',
    category: 'pest',
    emoji: '🕷️',
    name: L('Spider mites', 'العنكبوت الأحمر'),
    severity: 0.65,
    causes: L('Thrive in hot, dry, dusty air — very common in Gulf summers and AC rooms.', 'تزدهر في الهواء الحار الجاف المغبر — شائعة جدًا في صيف الخليج والغرف المكيّفة.'),
    treatment: [
      L('Wipe leaves (including undersides) with a damp cloth.', 'امسح الأوراق ووجهها السفلي بقطعة قماش رطبة.'),
      L('Apply neem oil or a miticide; repeat after 3 and 7 days.', 'استخدم زيت النيم أو مبيد العناكب؛ كرّر بعد 3 ثم 7 أيام.'),
      L('Isolate the plant from others.', 'اعزل النبتة عن غيرها.'),
    ],
    prevention: [L('Raise humidity and mist regularly.', 'ارفع الرطوبة ورشّ الرذاذ بانتظام.'), L('Inspect leaf undersides weekly.', 'افحص الوجه السفلي للأوراق أسبوعيًا.')],
    keywords: ['web', 'webbing', 'speckled', 'stippling', 'dots', 'mites', 'شبكة', 'خيوط', 'نقاط', 'عنكبوت', 'منقطة'],
  },
  {
    id: 'mealybugs',
    category: 'pest',
    emoji: '🐞',
    name: L('Mealybugs', 'البق الدقيقي'),
    severity: 0.5,
    causes: L('White, cottony insects hiding in leaf joints; spread from new plants.', 'حشرات بيضاء قطنية تختبئ في مفاصل الأوراق؛ تنتقل من النباتات الجديدة.'),
    treatment: [
      L('Dab each bug with a cotton swab dipped in 70% alcohol.', 'امسح كل حشرة بقطنة مغموسة في كحول 70%.'),
      L('Follow with insecticidal soap weekly for 3 weeks.', 'تابع بالصابون المبيد للحشرات أسبوعيًا لمدة 3 أسابيع.'),
    ],
    prevention: [L('Quarantine new plants for two weeks.', 'اعزل النباتات الجديدة لمدة أسبوعين.')],
    keywords: ['white cotton', 'cottony', 'fluffy', 'white bugs', 'mealy', 'قطني', 'قطن', 'أبيض منفوش', 'بق'],
  },
  {
    id: 'powdery',
    category: 'disease',
    emoji: '🍄',
    name: L('Powdery mildew', 'البياض الدقيقي'),
    severity: 0.5,
    causes: L('Fungal disease favored by poor airflow and big day/night humidity swings.', 'مرض فطري تساعده التهوية الضعيفة وتقلّب الرطوبة بين الليل والنهار.'),
    treatment: [
      L('Remove the worst-affected leaves.', 'أزل الأوراق الأكثر إصابة.'),
      L('Spray 1 tsp baking soda + few drops of soap per litre of water, weekly.', 'رشّ ملعقة صغيرة بيكربونات صوديوم مع قطرات صابون لكل لتر ماء أسبوعيًا.'),
      L('Use a sulfur or potassium bicarbonate fungicide if it spreads.', 'استخدم مبيدًا فطريًا كبريتيًا إذا انتشر.'),
    ],
    prevention: [L('Space plants for airflow.', 'باعد بين النباتات لتحسين التهوية.'), L('Water the soil, not the leaves.', 'اسقِ التربة لا الأوراق.')],
    keywords: ['white powder', 'powdery', 'white spots', 'flour', 'mildew', 'بودرة', 'بياض', 'بقع بيضاء', 'دقيقي', 'طحين'],
  },
  {
    id: 'rootrot',
    category: 'disease',
    emoji: '🥀',
    name: L('Root rot', 'تعفّن الجذور'),
    severity: 0.85,
    causes: L('Overwatering and poor drainage suffocate roots and let fungi take over.', 'الإفراط في الري وسوء الصرف يخنقان الجذور ويسمحان للفطريات بالسيطرة.'),
    treatment: [
      L('Unpot the plant and cut away brown, mushy roots.', 'أخرج النبتة من الأصيص وقصّ الجذور البنية الطرية.'),
      L('Repot in fresh, fast-draining mix in a pot with holes.', 'أعد زراعتها في خلطة جديدة سريعة الصرف في أصيص مثقوب.'),
      L('Water sparingly until new growth appears.', 'قلّل الري حتى يظهر نمو جديد.'),
    ],
    prevention: [L('Always check soil moisture before watering.', 'افحص رطوبة التربة دائمًا قبل الري.'), L('Use pots with drainage holes.', 'استخدم أصصًا بفتحات تصريف.')],
    keywords: ['wilting wet', 'mushy', 'rot', 'smell', 'black roots', 'drooping', 'soggy', 'ذبول', 'تعفن', 'رائحة', 'طري', 'جذور سوداء'],
  },
  {
    id: 'leafspot',
    category: 'disease',
    emoji: '🟤',
    name: L('Fungal leaf spot', 'تبقّع الأوراق الفطري'),
    severity: 0.45,
    causes: L('Fungal or bacterial spores splashed onto wet leaves.', 'جراثيم فطرية أو بكتيرية تنتقل إلى الأوراق المبتلة.'),
    treatment: [
      L('Remove and bin spotted leaves (do not compost).', 'أزل الأوراق المبقّعة وتخلّص منها (لا تضعها في السماد).'),
      L('Apply a copper-based fungicide.', 'استخدم مبيدًا فطريًا نحاسيًا.'),
    ],
    prevention: [L('Water early in the day at soil level.', 'اسقِ في الصباح الباكر عند مستوى التربة.')],
    keywords: ['brown spots', 'black spots', 'rings', 'spots', 'بقع بنية', 'بقع سوداء', 'حلقات', 'بقع'],
  },
  {
    id: 'nitrogen',
    category: 'nutrient',
    emoji: '🟡',
    name: L('Nitrogen deficiency', 'نقص النيتروجين'),
    severity: 0.4,
    causes: L('Old, lower leaves yellow evenly as the plant moves nitrogen to new growth.', 'تصفرّ الأوراق السفلية القديمة بالتساوي لأن النبتة تنقل النيتروجين إلى النمو الجديد.'),
    treatment: [
      L('Feed with a balanced or nitrogen-rich fertilizer.', 'سمّد بسماد متوازن أو غني بالنيتروجين.'),
      L('Top-dress with compost or well-rotted manure.', 'أضف طبقة من السماد العضوي أو الروث المتحلل.'),
    ],
    prevention: [L('Feed regularly during the growing season.', 'سمّد بانتظام خلال موسم النمو.')],
    keywords: ['yellow', 'yellowing', 'pale', 'lower leaves', 'old leaves', 'أصفر', 'اصفرار', 'شاحب', 'الأوراق السفلية'],
  },
  {
    id: 'iron',
    category: 'nutrient',
    emoji: '🍂',
    name: L('Iron chlorosis', 'نقص الحديد (الاصفرار)'),
    severity: 0.45,
    causes: L('Alkaline Gulf soils lock up iron; new leaves yellow while veins stay green.', 'تربة الخليج القلوية تحبس الحديد؛ تصفرّ الأوراق الجديدة مع بقاء العروق خضراء.'),
    treatment: [
      L('Apply chelated iron (Fe-EDDHA) to soil or as a foliar spray.', 'أضف حديدًا مخلبيًا (Fe-EDDHA) للتربة أو رشًا على الأوراق.'),
      L('Lower pH with sulfur or acidic compost.', 'خفّض الحموضة بالكبريت أو السماد العضوي الحمضي.'),
    ],
    prevention: [L('Use peat or compost-rich potting mix.', 'استخدم خلطة غنية بالبيتموس أو السماد العضوي.')],
    keywords: ['green veins', 'interveinal', 'new leaves yellow', 'young leaves', 'عروق خضراء', 'الأوراق الجديدة صفراء', 'بين العروق'],
  },
  {
    id: 'potassium',
    category: 'nutrient',
    emoji: '🔥',
    name: L('Potassium deficiency', 'نقص البوتاسيوم'),
    severity: 0.4,
    causes: L('Leaf edges brown and scorch; weak flowering and fruiting.', 'تحترق حواف الأوراق وتصبح بنية؛ مع ضعف الإزهار والإثمار.'),
    treatment: [
      L('Use a high-potassium (tomato) fertilizer.', 'استخدم سمادًا غنيًا بالبوتاسيوم (سماد الطماطم).'),
      L('Add wood ash sparingly to outdoor beds.', 'أضف رماد الخشب باعتدال للأحواض الخارجية.'),
    ],
    prevention: [L('Balance fertilizer during fruiting.', 'وازن التسميد خلال الإثمار.')],
    keywords: ['brown edges', 'scorched', 'crispy edges', 'burnt tips', 'حواف بنية', 'محترقة', 'أطراف جافة', 'حواف'],
  },
  {
    id: 'healthy',
    category: 'healthy',
    emoji: '💚',
    name: L('Looks healthy', 'تبدو سليمة'),
    severity: 0.05,
    causes: L('No clear signs of pests, disease or deficiency were found.', 'لم تظهر علامات واضحة لآفات أو أمراض أو نقص غذائي.'),
    treatment: [L('Keep up your current care routine.', 'حافظ على روتين العناية الحالي.')],
    prevention: [L('Check leaves weekly and rotate the pot for even growth.', 'افحص الأوراق أسبوعيًا وأدر الأصيص لنمو متوازن.')],
    keywords: [],
  },
];

/** Offline symptom matcher — scores each issue by keyword hits. */
export function matchDiagnosis(symptoms: string): { diagnosis: Diagnosis; confidence: number } {
  const text = symptoms.toLowerCase();
  let best = DIAGNOSES[DIAGNOSES.length - 1];
  let bestScore = 0;
  for (const d of DIAGNOSES) {
    const score = d.keywords.reduce((acc, k) => (text.includes(k.toLowerCase()) ? acc + k.length : acc), 0);
    if (score > bestScore) {
      best = d;
      bestScore = score;
    }
  }
  if (!text.trim()) {
    // Without symptoms, an offline photo can't be diagnosed — suggest the most common Gulf issue.
    return { diagnosis: DIAGNOSES.find((d) => d.id === 'spidermites')!, confidence: 0.42 };
  }
  return { diagnosis: best, confidence: bestScore ? Math.min(0.6 + bestScore / 60, 0.93) : 0.55 };
}
