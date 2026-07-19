/**
 * Generate synthetic products to reach 300-500 total across 7 categories.
 * Produces realistic variants of existing brands with plausible pack sizes.
 */

const VARIANTS = {
  'Fresh Fruits': [
    { names: ['Mango Alphonso', 'Papaya', 'Watermelon', 'Grapes Green', 'Grapes Black', 'Orange Nagpur', 'Pomegranate', 'Guava', 'Pineapple', 'Kiwi', 'Strawberry', 'Lychee', 'Sapota (Chiku)', 'Sweet Lime (Mosambi)', 'Custard Apple'], brand: 'Fresho', units: ['1 kg', '500 g', '250 g'] },
  ],
  'Fresh Vegetables': [
    { names: ['Capsicum Green', 'Capsicum Red', 'Capsicum Yellow', 'Brinjal', 'Lady Finger (Bhindi)', 'Cauliflower', 'Cabbage', 'Carrot', 'Beetroot', 'Radish', 'Spinach', 'Methi Leaves', 'Mushroom Button', 'Sweet Corn', 'Broccoli', 'Peas Green', 'Cucumber', 'Bottle Gourd (Lauki)', 'Ridge Gourd', 'Bitter Gourd'], brand: 'Fresho', units: ['1 kg', '500 g', '250 g'] },
  ],
  'Milk': [
    { names: ['Amul Taaza 1L', 'Mother Dairy Full Cream 1L', 'Nestle a+ Toned Milk', 'Amul Lactose Free Milk'], brand: 'Amul', units: ['1 L', '500 ml'] },
  ],
  'Curd & Yogurt': [
    { names: ['Nestle a+ Probiotic Dahi', 'Mother Dairy Mishti Doi', 'Epigamia Greek Yogurt Strawberry', 'Epigamia Greek Yogurt Vanilla'], brand: 'Mother Dairy', units: ['400 g', '200 g'] },
  ],
  'Cheese': [
    { names: ['Amul Processed Cheese Block', 'Britannia Cheese Cubes', 'Go Cheese Spread', 'Amul Mozzarella'], brand: 'Amul', units: ['200 g', '400 g'] },
  ],
  'Chips & Crisps': [
    { names: ['Lays Magic Masala', 'Lays American Style Cream & Onion', 'Bingo Mad Angles', 'Bingo Tedhe Medhe', 'Uncle Chipps', 'Pringles Original', 'Pringles Sour Cream'], brand: 'Lays', units: ['52 g', '90 g', '130 g'] },
  ],
  'Biscuits & Cookies': [
    { names: ['Britannia Marie Gold', 'Parle Monaco', 'ITC Sunfeast Dark Fantasy', 'Britannia Bourbon', 'Oreo Original', 'McVities Digestive', 'Parle Hide & Seek'], brand: 'Britannia', units: ['150 g', '200 g', '300 g'] },
  ],
  'Chocolates': [
    { names: ['Cadbury Silk', 'KitKat', 'Snickers', 'Ferrero Rocher 3pc', 'Amul Dark Chocolate 55%', 'Cadbury Gems', 'Cadbury Perk'], brand: 'Cadbury', units: ['60 g', '40 g', '150 g'] },
  ],
  'Instant Noodles': [
    { names: ['Maggi Atta Noodles', 'Top Ramen Curry', 'Yippee Noodles', 'Ching\'s Hakka Noodles', 'Wai Wai'], brand: 'Maggi', units: ['70 g', '280 g (4 pack)'] },
  ],
  'Soft Drinks': [
    { names: ['Sprite', 'Fanta Orange', 'Thums Up', 'Limca', 'Mountain Dew', '7UP'], brand: 'Coca-Cola', units: ['750 ml', '2 L', '300 ml'] },
  ],
  'Tea & Coffee': [
    { names: ['Tata Tea Premium', 'Brooke Bond Red Label', 'Nescafe Gold', 'Bru Instant Coffee', 'Tata Tea Agni', 'Society Tea'], brand: 'Tata', units: ['250 g', '500 g', '100 g'] },
  ],
  'Rice': [
    { names: ['BB Royal Sona Masoori Rice', 'Daawat Rozana Basmati', 'Fortune Everyday Basmati', 'Organic Tattva Brown Rice'], brand: 'BB Royal', units: ['1 kg', '5 kg', '10 kg'] },
  ],
  'Atta & Flours': [
    { names: ['Aashirvaad Multigrain Atta', 'Pillsbury Chakki Fresh', 'Rajdhani Besan', 'BB Royal Maida', 'Aashirvaad Sugar Release Control Atta'], brand: 'Aashirvaad', units: ['1 kg', '5 kg'] },
  ],
  'Dals & Pulses': [
    { names: ['Tata Sampann Moong Dal', 'Tata Sampann Chana Dal', 'Tata Sampann Urad Dal', 'BB Royal Rajma', 'BB Royal Kabuli Chana', 'Organic Tattva Masoor Dal'], brand: 'Tata', units: ['1 kg', '500 g'] },
  ],
  'Oils': [
    { names: ['Fortune Rice Bran Oil', 'Saffola Active Oil', 'Sundrop Heart Oil', 'Organic Tattva Coconut Oil', 'Fortune Mustard Oil'], brand: 'Fortune', units: ['1 L', '2 L', '5 L'] },
  ],
  'Shampoo': [
    { names: ['Head & Shoulders', 'Pantene Silky Smooth', 'TRESemmé Keratin', 'Clinic Plus', 'Dove Hair Fall Rescue'], brand: 'Dove', units: ['180 ml', '340 ml', '650 ml'] },
  ],
  'Soaps & Body Wash': [
    { names: ['Dove Beauty Bar', 'Lifebuoy Total 10', 'Lux Soft Touch', 'Pears Pure & Gentle', 'Nivea Creme Soft'], brand: 'Dove', units: ['75 g', '125 g', '250 ml'] },
  ],
  'Detergents': [
    { names: ['Surf Excel Quick Wash', 'Ariel Matic', 'Tide Plus', 'Rin Advanced', 'Comfort Fabric Conditioner'], brand: 'Surf Excel', units: ['1 kg', '2 kg', '500 g'] },
  ],
  'Dishwash': [
    { names: ['Vim Lemon Bar', 'Pril Dishwash Liquid', 'Exo Dish Shine'], brand: 'Vim', units: ['500 ml', '750 ml', '250 g'] },
  ],
};

const PRICE_RANGES = {
  'Fresh Fruits': [30, 300], 'Fresh Vegetables': [15, 120], 'Milk': [22, 65],
  'Curd & Yogurt': [25, 80], 'Cheese': [60, 280], 'Chips & Crisps': [10, 80],
  'Biscuits & Cookies': [10, 120], 'Chocolates': [10, 250], 'Instant Noodles': [12, 60],
  'Soft Drinks': [20, 90], 'Tea & Coffee': [50, 400], 'Rice': [60, 800],
  'Atta & Flours': [40, 500], 'Dals & Pulses': [50, 250], 'Oils': [100, 600],
  'Shampoo': [80, 500], 'Soaps & Body Wash': [25, 300], 'Detergents': [50, 600],
  'Dishwash': [30, 200],
};

function randomPrice(min, max) {
  const raw = min + Math.random() * (max - min);
  return Math.round(raw * 100) / 100;
}

export function generateSyntheticProducts(categoryMap, brandMap) {
  const products = [];

  for (const [categoryName, variantGroups] of Object.entries(VARIANTS)) {
    const categoryId = categoryMap[categoryName];
    if (!categoryId) continue;

    for (const group of variantGroups) {
      const brandId = brandMap[group.brand];
      if (!brandId) continue;

      const [minP, maxP] = PRICE_RANGES[categoryName] || [10, 200];

      for (const name of group.names) {
        const unit = group.units[Math.floor(Math.random() * group.units.length)];
        const price = randomPrice(minP, maxP);
        const mrp = Math.round(price * (1.1 + Math.random() * 0.4) * 100) / 100;
        products.push({
          name,
          category_id: categoryId,
          brand_id: brandId,
          price,
          mrp,
          unit,
        });
      }
    }
  }

  return products;
}
