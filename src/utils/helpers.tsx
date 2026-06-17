import type { Listing, PopularLocation } from '../types';

export const POPULAR_UKRAINIAN_LOCATIONS: PopularLocation[] = [
  { display_name: "Київ", lat: 50.4501, lng: 30.5234 },
  { display_name: "Київська область", lat: 50.4501, lng: 30.5234 },
  { display_name: "Хмельницький, Хмельницька область", lat: 49.4230, lng: 26.9871 },
  { display_name: "Хмельницька область", lat: 49.5393, lng: 26.8722 },
  { display_name: "Львів, Львівська область", lat: 49.8397, lng: 24.0297 },
  { display_name: "Львівська область", lat: 49.8397, lng: 24.0297 },
  { display_name: "Одеса, Одеська область", lat: 46.4825, lng: 30.7233 },
  { display_name: "Харків, Харківська область", lat: 50.0038, lng: 36.2304 },
  { display_name: "Дніпро, Дніпропетровська область", lat: 48.4647, lng: 35.0462 },
  { display_name: "Запоріжжя, Запорізька область", lat: 47.8388, lng: 35.1396 },
  { display_name: "Вінниця, Вінницька область", lat: 49.2331, lng: 28.4682 },
  { display_name: "Івано-Франківськ, Івано-Франківська область", lat: 48.9226, lng: 24.7111 },
  { display_name: "Тернопіль, Тернопільська область", lat: 49.5535, lng: 25.5948 },
  { display_name: "Чернівці, Чернівецька область", lat: 48.2908, lng: 25.9343 },
  { display_name: "Рівне, Рівненська область", lat: 50.6199, lng: 26.2516 },
  { display_name: "Луцьк, Волинська область", lat: 50.7472, lng: 25.3254 },
  { display_name: "Ужгород, Закарпатська область", lat: 48.6208, lng: 22.2879 },
  { display_name: "Житомир, Житомирська область", lat: 50.2547, lng: 28.6587 },
  { display_name: "Полтава, Полтавська область", lat: 49.5883, lng: 34.5514 },
  { display_name: "Черкаси, Черкаська область", lat: 49.4444, lng: 32.0598 },
  { display_name: "Суми, Сумська область", lat: 50.9077, lng: 34.7981 },
  { display_name: "Чернігів, Чернігівська область", lat: 51.4982, lng: 31.2893 },
  { display_name: "Кропивницький, Кіровоградська область", lat: 48.5079, lng: 32.2623 },
  { display_name: "Херсон, Херсонська область", lat: 46.6354, lng: 32.6169 },
  { display_name: "Миколаїв, Миколаївська область", lat: 46.9750, lng: 31.9950 },
  { display_name: "Донецьк, Донецька область", lat: 48.0159, lng: 37.8028 },
  { display_name: "Луганськ, Луганська область", lat: 48.5740, lng: 39.3078 },
  { display_name: "Сімферополь, АР Крим", lat: 44.9521, lng: 34.1024 },
  { display_name: "Севастополь", lat: 44.6166, lng: 33.5254 },
  { display_name: "Городок, Львівська область", lat: 49.7847, lng: 23.6489 },
  { display_name: "Городок, Хмельницька область", lat: 49.1672, lng: 26.5794 },
  { display_name: "Горохів, Волинська область", lat: 50.4994, lng: 24.7645 },
  { display_name: "Городенка, Івано-Франківська область", lat: 48.6678, lng: 25.5002 },
  { display_name: "Городище, Черкаська область", lat: 49.2889, lng: 31.4452 },
  { display_name: "Городня, Чернігівська область", lat: 51.8906, lng: 31.5794 },
  { display_name: "Кам'янець-Подільський, Хмельницька область", lat: 48.6780, lng: 26.5847 },
  { display_name: "Хмільник, Вінницька область", lat: 49.5574, lng: 27.9547 },
  { display_name: "Кривий Ріг, Дніпропетровська область", lat: 47.9105, lng: 33.3918 },
  { display_name: "Маріуполь, Донецька область", lat: 47.0971, lng: 37.5439 },
  { display_name: "Кременчук, Полтавська область", lat: 49.0630, lng: 33.4116 },
  { display_name: "Біла Церква, Київська область", lat: 49.8025, lng: 30.1167 },
  { display_name: "Бровари, Київська область", lat: 50.5108, lng: 30.7917 },
  { display_name: "Бориспіль, Київська область", lat: 50.3506, lng: 30.9528 },
  { display_name: "Ірпінь, Київська область", lat: 50.5217, lng: 30.2447 },
  { display_name: "Буча, Київська область", lat: 50.5489, lng: 30.2208 },
  { display_name: "Васильків, Київська область", lat: 50.1783, lng: 30.3158 },
  { display_name: "Фастів, Київська область", lat: 50.0789, lng: 29.9172 },
  { display_name: "Обухів, Київська область", lat: 50.1136, lng: 30.6231 },
  { display_name: "Вишгород, Київська область", lat: 50.5833, lng: 30.4833 },
  { display_name: "Дрогобич, Львівська область", lat: 49.3508, lng: 23.5061 },
  { display_name: "Стрий, Львівська область", lat: 49.2558, lng: 23.8458 },
  { display_name: "Самбір, Львівська область", lat: 49.5183, lng: 23.1975 },
  { display_name: "Трускавець, Львівська область", lat: 49.2789, lng: 23.5047 },
  { display_name: "Золочів, Львівська область", lat: 49.8064, lng: 24.8961 },
  { display_name: "Умань, Черкаська область", lat: 48.7483, lng: 30.2214 },
  { display_name: "Сміла, Черкаська область", lat: 49.2125, lng: 31.8742 },
  { display_name: "Бердичів, Житомирська область", lat: 49.8978, lng: 28.5839 },
  { display_name: "Коростень, Житомирська область", lat: 50.9489, lng: 28.6475 },
  { display_name: "Ковель, Волинська область", lat: 51.2167, lng: 24.7167 },
  { display_name: "Нововолинськ, Волинська область", lat: 50.7333, lng: 24.1667 },
  { display_name: "Мукачево, Закарпатська область", lat: 48.4414, lng: 22.7214 },
  { display_name: "Хуст, Закарпатська область", lat: 48.1764, lng: 23.2936 },
  { display_name: "Берегове, Закарпатська область", lat: 48.2039, lng: 22.6436 },
  { display_name: "Коломия, Івано-Франківська область", lat: 48.5283, lng: 25.0389 },
  { display_name: "Калуш, Івано-Франківська область", lat: 49.0275, lng: 24.3606 },
  { display_name: "Шепетівка, Хмельницька область", lat: 50.1856, lng: 27.0678 },
  { display_name: "Нетішин, Хмельницька область", lat: 50.3292, lng: 26.6508 },
  { display_name: "Славута, Хмельницька область", lat: 50.2989, lng: 26.8667 },
  { display_name: "Старокостянтинів, Хмельницька область", lat: 49.7544, lng: 27.2206 },
  { display_name: "Чортків, Тернопільська область", lat: 49.0125, lng: 25.7972 },
  { display_name: "Кременець, Тернопільська область", lat: 50.0967, lng: 25.7236 },
  { display_name: "Дубно, Рівненська область", lat: 50.4011, lng: 25.7369 },
  { display_name: "Сарни, Рівненська область", lat: 51.3328, lng: 26.6022 },
  { display_name: "Шостка, Сумська область", lat: 51.8619, lng: 33.4867 },
  { display_name: "Конотоп, Сумська область", lat: 51.2425, lng: 33.2036 },
  { display_name: "Олександрія, Кіровоградська область", lat: 48.6708, lng: 33.1189 },
  { display_name: "Горішні Плавні, Полтавська область", lat: 49.0089, lng: 33.6439 },
  { display_name: "Миргород, Полтавська область", lat: 49.9658, lng: 33.6128 }
];

export const CATEGORY_PHOTOS: Record<string, string[]> = {
  tools: [
    'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1534224039826-c7a0dea0e66a?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&q=80'
  ],
  electronics: [
    'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80'
  ],
  sport: [
    'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&w=600&q=80'
  ],
  tourism: [
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1486915309851-b0cc1f8a0084?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1533873984035-25970ab07461?auto=format&fit=crop&w=600&q=80'
  ],
  transport: [
    'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=600&q=80'
  ],
  'photo-video': [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=600&q=80'
  ],
  clothing: [
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=600&q=80'
  ],
  'home-garden': [
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1413977886085-3bbbf9a7cf6e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80'
  ],
  kids: [
    'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1515488042361-404e9250afef?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1555448248-2571daf6344b?auto=format&fit=crop&w=600&q=80'
  ],
  hobbies: [
    'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80'
  ]
};

export const DEFAULT_PHOTOS = [
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=600&q=80'
];

export function getGalleryPhotos(listing: Listing | null): string[] {
  if (!listing) return [];
  if (listing.imageUrls && listing.imageUrls.length > 0) {
    return listing.imageUrls;
  }
  const mainPhoto = listing.imageUrl || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80';
  const categorySlug = listing.category?.slug || '';
  const subPhotos = CATEGORY_PHOTOS[categorySlug] || DEFAULT_PHOTOS;
  return [mainPhoto, ...subPhotos].slice(0, 5);
}

export function getCategorySvgIcon(slug: string) {
  const stroke = "currentColor";
  const fill = "none";
  const strokeWidth = 2;
  
  switch (slug) {
    case 'tools':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 1 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77Z" />
        </svg>
      );
    case 'electronics':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" strokeLinecap="round" />
        </svg>
      );
    case 'sport':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          <path d="M6.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM17.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM12 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM6.5 15.5H12M12 15.5h5.5M12 5.5v10" />
        </svg>
      );
    case 'tourism':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          <path d="m19 20-7-14-7 14M12 6v14M5 20h14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'transport':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 1 13v3c0 .6.4 1 1 1h2" />
          <circle cx="7" cy="17" r="2" />
          <circle cx="17" cy="17" r="2" />
        </svg>
      );
    case 'photo-video':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      );
    case 'clothing':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          <path d="M12 2a2 2 0 0 1 2 2c0 .7-.3 1.3-.8 1.7L22 13.5a1 1 0 0 1-.5 1.5H2.5a1 1 0 0 1-.5-1.5l8.8-7.8c-.5-.4-.8-1-.8-1.7a2 2 0 0 1 2-2Z" />
        </svg>
      );
    case 'home-garden':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case 'kids':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          <path d="M12 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM12 6V2M12 2H9M6 12H2M18 12h4" strokeLinecap="round" />
        </svg>
      );
    case 'hobbies':
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="9" cy="9" r="1" fill="currentColor" />
          <circle cx="15" cy="15" r="1" fill="currentColor" />
          <circle cx="12" cy="12" r="1" fill="currentColor" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          <polyline points="16.5 9.4 7.55 4.24 3 6.82 12.5 12 21 7 16.5 9.4" />
          <line x1="12" y1="22" x2="12" y2="12" />
          <polyline points="12 12.02 3.5 7.1 3.5 16.5 12 22" />
          <polyline points="20.5 7.15 20.5 16.5 12 22" />
        </svg>
      );
  }
}

export const renderHighlightedText = (text: string, highlight: string) => {
  if (!highlight.trim()) return <span>{text}</span>;
  
  const lowerText = text.toLowerCase();
  const lowerHighlight = highlight.toLowerCase().trim();
  const index = lowerText.indexOf(lowerHighlight);
  
  if (index === -1) return <span>{text}</span>;
  
  const before = text.substring(0, index);
  const match = text.substring(index, index + lowerHighlight.length);
  const after = text.substring(index + lowerHighlight.length);
  
  return (
    <span>
      {before}
      <strong style={{ fontWeight: 800, color: '#222222' }}>{match}</strong>
      {after}
    </span>
  );
};
