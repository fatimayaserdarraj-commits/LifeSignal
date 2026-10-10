import { Localized } from '@/lib/translations';

export type ShopType = 'nursery' | 'market' | 'equipment' | 'expert';

export type Shop = {
  id: string;
  type: ShopType;
  emoji: string;
  name: Localized;
  area: Localized;
  description: Localized;
  hours: string;
  rating: number;
  phone: string;
  lat: number;
  lng: number;
};

const L = (en: string, ar: string): Localized => ({ en, ar });

/**
 * Sample directory for Bahrain. Names and phone numbers are illustrative placeholders —
 * replace with a verified listing (or load from your backend) before release.
 */
export const SHOPS: Shop[] = [
  {
    id: 's1',
    type: 'nursery',
    emoji: '🌳',
    name: L('Green Oasis Nursery', 'مشتل الواحة الخضراء'),
    area: L('Budaiya', 'البديع'),
    description: L('Large outdoor nursery: palms, fruit trees, shrubs and seasonal seedlings.', 'مشتل خارجي كبير: نخيل وأشجار مثمرة وشجيرات وشتلات موسمية.'),
    hours: '07:00 – 19:00',
    rating: 4.7,
    phone: '+97300000001',
    lat: 26.2186,
    lng: 50.4567,
  },
  {
    id: 's2',
    type: 'market',
    emoji: '🧺',
    name: L('Farmers’ Weekend Market', 'سوق المزارعين الأسبوعي'),
    area: L('Budaiya Highway', 'شارع البديع'),
    description: L('Seasonal market (Nov–Apr) with local produce, herbs and seedlings.', 'سوق موسمي (نوفمبر–أبريل) بمنتجات محلية وأعشاب وشتلات.'),
    hours: 'Sat 07:00 – 12:00',
    rating: 4.8,
    phone: '+97300000002',
    lat: 26.2003,
    lng: 50.4921,
  },
  {
    id: 's3',
    type: 'equipment',
    emoji: '🧰',
    name: L('Garden Pro Supplies', 'جاردن برو للمستلزمات'),
    area: L('Sitra', 'سترة'),
    description: L('Drip irrigation kits, tools, pots, soil, fertilizers and shade nets.', 'أطقم الري بالتنقيط والأدوات والأصص والتربة والأسمدة وشبك التظليل.'),
    hours: '08:00 – 21:00',
    rating: 4.4,
    phone: '+97300000003',
    lat: 26.1547,
    lng: 50.6206,
  },
  {
    id: 's4',
    type: 'nursery',
    emoji: '🪴',
    name: L('Urban Leaf Plant Studio', 'استوديو أوربان ليف للنباتات'),
    area: L('Manama', 'المنامة'),
    description: L('Indoor plants, terrariums and pot styling for apartments.', 'نباتات داخلية وتيراريوم وتنسيق أصص للشقق.'),
    hours: '10:00 – 22:00',
    rating: 4.6,
    phone: '+97300000004',
    lat: 26.2235,
    lng: 50.5876,
  },
  {
    id: 's5',
    type: 'expert',
    emoji: '👩‍🌾',
    name: L('Landscape & Plant Clinic', 'عيادة النباتات وتنسيق الحدائق'),
    area: L('Riffa', 'الرفاع'),
    description: L('Book a horticulturist for garden design, soil testing and plant health visits.', 'احجز مختصًا زراعيًا لتصميم الحدائق وفحص التربة وزيارات صحة النبات.'),
    hours: 'By appointment',
    rating: 4.9,
    phone: '+97300000005',
    lat: 26.13,
    lng: 50.555,
  },
  {
    id: 's6',
    type: 'nursery',
    emoji: '🌴',
    name: L('Palm Heritage Nursery', 'مشتل تراث النخيل'),
    area: L('Saar', 'سار'),
    description: L('Specialists in date palm varieties, offshoots and palm care.', 'متخصصون في أصناف نخيل التمر والفسائل والعناية بالنخيل.'),
    hours: '06:30 – 18:00',
    rating: 4.5,
    phone: '+97300000006',
    lat: 26.1906,
    lng: 50.4877,
  },
  {
    id: 's7',
    type: 'market',
    emoji: '🍅',
    name: L('Central Produce Market', 'السوق المركزي للخضار'),
    area: L('Isa Town', 'مدينة عيسى'),
    description: L('Fresh local vegetables, seeds and seasonal seedlings from local farms.', 'خضار محلية طازجة وبذور وشتلات موسمية من المزارع المحلية.'),
    hours: '05:00 – 13:00',
    rating: 4.3,
    phone: '+97300000007',
    lat: 26.1736,
    lng: 50.5478,
  },
  {
    id: 's8',
    type: 'equipment',
    emoji: '💧',
    name: L('AquaGrow Irrigation', 'أكوا جرو لأنظمة الري'),
    area: L('Muharraq', 'المحرق'),
    description: L('Smart irrigation controllers, hydroponics kits and installation service.', 'وحدات تحكم ري ذكية وأطقم زراعة مائية وخدمة تركيب.'),
    hours: '09:00 – 20:00',
    rating: 4.2,
    phone: '+97300000008',
    lat: 26.2572,
    lng: 50.6119,
  },
];

export function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
