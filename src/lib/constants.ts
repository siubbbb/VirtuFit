export const GARMENTS = [
  {
    id: 'uniqlo-airism',
    name: 'UNIQLO Airism Crew Neck',
    type: 'shirt',
    imageUrl: 'https://picsum.photos/seed/uniqlo-shirt/800/1000',
    imageHint: 'white tshirt',
  },
  {
    id: 'generic-jeans',
    name: 'Classic Denim Jeans',
    type: 'pants',
    imageUrl: 'https://picsum.photos/seed/jeans/800/1000',
    imageHint: 'blue jeans',
  },
  {
    id: 'summer-dress',
    name: 'Floral Summer Dress',
    type: 'dress',
    imageUrl: 'https://picsum.photos/seed/dress/800/1000',
    imageHint: 'summer dress',
  },
];

export const BRAND_SIZE_CHARTS: Record<string, any> = {
  'uniqlo-airism': {
    garmentType: 'shirt',
    chart: {
      S: { chest: 88, waist: 72, length: 66 },
      M: { chest: 96, waist: 80, length: 68 },
      L: { chest: 104, waist: 88, length: 70 },
      XL: { chest: 112, waist: 96, length: 72 },
    },
  },
  'generic-jeans': {
    garmentType: 'pants',
    chart: {
      S: { waist: 76, hip: 96, inseam: 78 },
      M: { waist: 84, hip: 104, inseam: 80 },
      L: { waist: 92, hip: 112, inseam: 82 },
      XL: { waist: 100, hip: 120, inseam: 84 },
    },
  },
  'summer-dress': {
    garmentType: 'dress',
    chart: {
      S: { bust: 84, waist: 68, hip: 92, length: 90 },
      M: { bust: 92, waist: 76, hip: 100, length: 92 },
      L: { bust: 100, waist: 84, hip: 108, length: 94 },
      XL: { bust: 108, waist: 92, hip: 116, length: 96 },
    },
  },
};
