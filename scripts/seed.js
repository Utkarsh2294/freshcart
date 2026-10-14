import pg from 'pg';
import bcrypt from 'bcryptjs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { generateSyntheticProducts } from './generateSyntheticProducts.js';
import { generateSyntheticReviews } from './generateSyntheticReviews.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://freshcart:freshcart_pass@localhost:5433/freshcart';

// ── Category data (20 categories from master catalog) ────────────────────────
const CATEGORIES = [
  // 1
  { name: 'Dairy, Bread & Eggs', icon_url: '/icons/dairy.svg', children: [
    { name: 'Milk' },
    { name: 'Curd & Yogurt' },
    { name: 'Paneer & Cheese' },
    { name: 'Butter & Ghee' },
    { name: 'Cream' },
    { name: 'Buttermilk & Flavoured Milk' },
    { name: 'Bread' },
    { name: 'Eggs' },
    { name: 'Ice Cream' },
  ]},
  // 2
  { name: 'Fruits & Vegetables', icon_url: '/icons/fruits.svg', children: [
    { name: 'Fresh Fruits' },
    { name: 'Fresh Vegetables' },
    { name: 'Leafy Greens' },
    { name: 'Exotic Vegetables' },
    { name: 'Herbs & Seasonings' },
  ]},
  // 3
  { name: 'Staples', icon_url: '/icons/staples.svg', children: [
    { name: 'Atta & Flours' },
    { name: 'Rice' },
    { name: 'Dals & Pulses' },
    { name: 'Oils' },
    { name: 'Sugar & Salt' },
    { name: 'Sooji & Poha' },
  ]},
  // 4
  { name: 'Masala & Spices', icon_url: '/icons/spices.svg', children: [
    { name: 'Turmeric & Chilli' },
    { name: 'Coriander & Cumin' },
    { name: 'Whole Spices' },
    { name: 'Masala Blends' },
    { name: 'Ready Mix Masala' },
  ]},
  // 5
  { name: 'Breakfast & Spreads', icon_url: '/icons/breakfast.svg', children: [
    { name: 'Jams & Spreads' },
    { name: 'Peanut Butter & Honey' },
    { name: 'Ketchup & Sauces' },
    { name: 'Cereals & Oats' },
  ]},
  // 6
  { name: 'Snacks & Namkeen', icon_url: '/icons/snacks.svg', children: [
    { name: 'Chips & Crisps' },
    { name: 'Namkeen & Mixtures' },
    { name: 'Popcorn' },
    { name: 'Instant Noodles' },
  ]},
  // 7
  { name: 'Biscuits & Bakery', icon_url: '/icons/biscuits.svg', children: [
    { name: 'Glucose & Marie Biscuits' },
    { name: 'Cream Biscuits & Cookies' },
  ]},
  // 8
  { name: 'Tea, Coffee & Health Drinks', icon_url: '/icons/beverages.svg', children: [
    { name: 'Tea' },
    { name: 'Coffee' },
    { name: 'Malt & Health Drinks' },
  ]},
  // 9
  { name: 'Cold Drinks, Juices & Water', icon_url: '/icons/drinks.svg', children: [
    { name: 'Soft Drinks' },
    { name: 'Fruit Juices' },
    { name: 'Packaged Water' },
    { name: 'Energy Drinks' },
  ]},
  // 10
  { name: 'Chocolates & Dry Fruits', icon_url: '/icons/chocolates.svg', children: [
    { name: 'Chocolates' },
    { name: 'Dry Fruits' },
  ]},
  // 11
  { name: 'Bath & Body', icon_url: '/icons/bath.svg', children: [
    { name: 'Bath Soap' },
    { name: 'Body Wash' },
  ]},
  // 12
  { name: 'Oral Care', icon_url: '/icons/oral.svg', children: [
    { name: 'Toothpaste' },
    { name: 'Toothbrush' },
  ]},
  // 13
  { name: 'Hair & Skin Care', icon_url: '/icons/hairskin.svg', children: [
    { name: 'Hair Oil' },
    { name: 'Shampoo' },
    { name: 'Face Wash' },
    { name: 'Body Lotion' },
    { name: 'Skin Care' },
  ]},
  // 14
  { name: 'Feminine Hygiene', icon_url: '/icons/feminine.svg', children: [
    { name: 'Sanitary Pads' },
  ]},
  // 15
  { name: 'Baby Care', icon_url: '/icons/baby.svg', children: [
    { name: 'Diapers' },
    { name: 'Baby Food & Formula' },
    { name: 'Baby Toiletries' },
  ]},
  // 16
  { name: 'Laundry', icon_url: '/icons/laundry.svg', children: [
    { name: 'Detergents' },
    { name: 'Fabric Softener' },
  ]},
  // 17
  { name: 'Home Cleaning', icon_url: '/icons/home.svg', children: [
    { name: 'Dishwash' },
    { name: 'Floor Cleaners' },
    { name: 'Toilet Cleaners' },
    { name: 'Surface & Glass Cleaners' },
  ]},
  // 18
  { name: 'Kitchen Supplies', icon_url: '/icons/kitchen.svg', children: [
    { name: 'Foils & Wraps' },
    { name: 'Garbage Bags' },
    { name: 'Tissue Paper' },
  ]},
  // 19
  { name: 'Pet Care', icon_url: '/icons/pet.svg', children: [
    { name: 'Dog Food' },
    { name: 'Cat Food' },
  ]},
  // 20
  { name: 'Pooja & Festive', icon_url: '/icons/pooja.svg', children: [
    { name: 'Agarbatti & Dhoop' },
    { name: 'Camphor & Wicks' },
  ]},
];

// ── Brand data (100+ brands from master catalog) ─────────────────────────────
const BRANDS = [
  // Dairy
  'Amul', 'Mother Dairy', 'Nestlé', 'Nandini', 'Verka', 'Gowardhan', 'Milky Mist',
  'Go Cheese', 'ID Fresh', 'Epigamia', 'Kwality Walls', 'Havmor', 'Vadilal', 'Baskin Robbins',
  // Eggs & Bread
  'Eggoz', 'Keggs', 'Happy Hens', "Venky's", 'Suguna',
  'Britannia', 'Modern', 'Harvest Gold', 'English Oven', 'Bonn',
  // Staples
  'Aashirvaad', 'Fortune', 'Pillsbury', 'Annapurna', 'Patanjali', '24 Mantra',
  'India Gate', 'Daawat', 'Kohinoor', 'Lal Qilla', 'Amira',
  'Tata Sampann', 'Organic Tattva', 'Bansi',
  'Madhur', 'Dhampure', 'Tata Salt', 'Catch',
  'Saffola', 'Dhara', 'Sundrop', 'Gemini',
  // Masala & Spices
  'MDH', 'Everest', 'Badshah', 'Aachi',
  // Breakfast & Spreads
  'Kissan', "Mala's", 'Druk',
  'Pintola', 'MyFitness', 'American Garden', "Nature's Superfoods",
  'Dabur', 'Zandu',
  'Heinz', 'Del Monte', "Ching's",
  'Nutella', "Hershey's",
  "Kellogg's", "Bagrry's", 'Quaker',
  // Snacks & Namkeen
  "Lay's", 'Bingo', 'Uncle Chipps', 'Kurkure', 'Balaji',
  "Haldiram's", 'Bikaji', 'Bikano', 'Aliva',
  'Act II', '4700BC',
  'Maggi', 'Yippee', 'Top Ramen',
  // Biscuits
  'Parle', 'Sunfeast', 'Oreo', 'McVities', 'Priyagold', 'ITC',
  // Tea, Coffee & Health Drinks
  'Tata Tea', 'Red Label', 'Society', 'Wagh Bakri', 'Girnar', 'Taj Mahal',
  'Nescafé', 'Bru', 'Continental', 'Davidoff', 'Blue Tokai',
  'Horlicks', 'Bournvita', 'Complan', 'Boost',
  // Drinks
  'Coca-Cola', 'Pepsi', 'Sprite', 'Thums Up', 'Limca', 'Fanta',
  'Real', 'Tropicana', 'Paper Boat', 'B Natural', 'Minute Maid',
  'Bisleri', 'Kinley', 'Aquafina', 'Himalayan',
  'Red Bull',
  // Chocolates & Dry Fruits
  'Cadbury', 'KitKat', 'Ferrero', 'Happilo', 'Nutraj', 'Tulsi', 'Borges', 'Farmley',
  // Personal Care
  'Lux', 'Lifebuoy', 'Dove', 'Pears', 'Santoor', 'Cinthol', 'Palmolive', 'Nivea',
  'Colgate', 'Pepsodent', 'Close-Up', 'Sensodyne',
  'Parachute', 'Bajaj', 'Navratna',
  'Head & Shoulders', 'Clinic Plus', 'Sunsilk', 'Pantene', 'TRESemmé',
  'Himalaya', 'Garnier', "Pond's", 'Clean & Clear', 'Vaseline',
  // Feminine Hygiene
  'Stayfree', 'Sofy', 'Nua', 'Carefree',
  // Baby Care
  'Pampers', 'Huggies', 'MamyPoko', 'Sirona', 'Supples',
  'Cerelac', 'Lactogen', 'Similac', 'NAN',
  "Johnson's", 'Sebamed',
  // Laundry & Cleaning
  'Surf Excel', 'Ariel', 'Tide', 'Rin', 'Wheel', 'Ghadi', 'Comfort',
  'Vim', 'Exo', 'Pril',
  'Harpic', 'Domex', 'Sanifresh',
  'Lizol', 'Colin',
  // Kitchen Supplies
  'Origami', 'Premier',
  // Pet Care
  'Pedigree', 'Whiskas', 'Royal Canin', 'Drools', 'Purepet',
  // Pooja & Festive
  'Cycle', 'Mangaldeep', 'Hem', 'Zed Black',
  // Platform private labels
  'Fresho', 'BB Royal',
];

// ── Real products — 20 categories, 150+ SKUs ─────────────────────────────────
const REAL_PRODUCTS = [

  // ── 1. Dairy, Bread & Eggs ─────────────────────────────────────────────────
  // Milk
  { name: 'Amul Taaza Toned Milk', category: 'Milk', brand: 'Amul', price: 24, mrp: 24, unit: '500 ml', dietary_tags: ['vegetarian'] },
  { name: 'Amul Gold Full Cream Milk', category: 'Milk', brand: 'Amul', price: 32, mrp: 32, unit: '500 ml', dietary_tags: ['vegetarian'] },
  { name: 'Amul Taaza Toned Milk', category: 'Milk', brand: 'Amul', price: 46, mrp: 46, unit: '1 L', dietary_tags: ['vegetarian'] },
  { name: 'Mother Dairy Cow Milk', category: 'Milk', brand: 'Mother Dairy', price: 28, mrp: 28, unit: '500 ml', dietary_tags: ['vegetarian'] },
  { name: 'Mother Dairy Full Cream Milk', category: 'Milk', brand: 'Mother Dairy', price: 33, mrp: 33, unit: '500 ml', dietary_tags: ['vegetarian'] },
  { name: 'Nestlé a+ Toned Milk', category: 'Milk', brand: 'Nestlé', price: 30, mrp: 30, unit: '500 ml', dietary_tags: ['vegetarian'] },

  // Curd & Yogurt
  { name: 'Amul Masti Dahi', category: 'Curd & Yogurt', brand: 'Amul', price: 30, mrp: 34, unit: '400 g', dietary_tags: ['vegetarian'] },
  { name: 'Mother Dairy Mishti Doi', category: 'Curd & Yogurt', brand: 'Mother Dairy', price: 35, mrp: 40, unit: '400 g', dietary_tags: ['vegetarian'] },
  { name: 'Epigamia Greek Yogurt Vanilla', category: 'Curd & Yogurt', brand: 'Epigamia', price: 59, mrp: 65, unit: '200 g', dietary_tags: ['vegetarian', 'gluten-free'] },
  { name: 'Epigamia Greek Yogurt Strawberry', category: 'Curd & Yogurt', brand: 'Epigamia', price: 59, mrp: 65, unit: '200 g', dietary_tags: ['vegetarian', 'gluten-free'] },

  // Paneer & Cheese
  { name: 'Amul Fresh Paneer', category: 'Paneer & Cheese', brand: 'Amul', price: 80, mrp: 90, unit: '200 g', dietary_tags: ['vegetarian'] },
  { name: 'Mother Dairy Fresh Paneer', category: 'Paneer & Cheese', brand: 'Mother Dairy', price: 82, mrp: 90, unit: '200 g', dietary_tags: ['vegetarian'] },
  { name: 'Milky Mist Paneer', category: 'Paneer & Cheese', brand: 'Milky Mist', price: 90, mrp: 100, unit: '200 g', dietary_tags: ['vegetarian'] },
  { name: 'Amul Cheese Slices', category: 'Paneer & Cheese', brand: 'Amul', price: 120, mrp: 130, unit: '200 g', dietary_tags: ['vegetarian'] },
  { name: 'Britannia Cheese Slices', category: 'Paneer & Cheese', brand: 'Britannia', price: 115, mrp: 125, unit: '200 g', dietary_tags: ['vegetarian'] },
  { name: 'Go Cheese Cheddar Spread', category: 'Paneer & Cheese', brand: 'Go Cheese', price: 95, mrp: 110, unit: '200 g', dietary_tags: ['vegetarian'] },

  // Butter & Ghee
  { name: 'Amul Butter Salted', category: 'Butter & Ghee', brand: 'Amul', price: 56, mrp: 60, unit: '100 g', dietary_tags: ['vegetarian'] },
  { name: 'Amul Butter Unsalted', category: 'Butter & Ghee', brand: 'Amul', price: 58, mrp: 62, unit: '100 g', dietary_tags: ['vegetarian'] },
  { name: 'Mother Dairy Butter', category: 'Butter & Ghee', brand: 'Mother Dairy', price: 55, mrp: 60, unit: '100 g', dietary_tags: ['vegetarian'] },
  { name: 'Amul Pure Ghee', category: 'Butter & Ghee', brand: 'Amul', price: 265, mrp: 290, unit: '500 g', dietary_tags: ['vegetarian'] },
  { name: 'Mother Dairy Ghee', category: 'Butter & Ghee', brand: 'Mother Dairy', price: 270, mrp: 295, unit: '500 g', dietary_tags: ['vegetarian'] },
  { name: 'Patanjali Cow Ghee', category: 'Butter & Ghee', brand: 'Patanjali', price: 255, mrp: 280, unit: '500 g', dietary_tags: ['vegetarian'] },

  // Cream
  { name: 'Amul Fresh Cream', category: 'Cream', brand: 'Amul', price: 45, mrp: 50, unit: '200 ml', dietary_tags: ['vegetarian'] },
  { name: 'Nestlé Milkmaid Fresh Cream', category: 'Cream', brand: 'Nestlé', price: 48, mrp: 55, unit: '200 ml', dietary_tags: ['vegetarian'] },

  // Buttermilk & Flavoured Milk
  { name: 'Amul Masti Spiced Buttermilk', category: 'Buttermilk & Flavoured Milk', brand: 'Amul', price: 20, mrp: 22, unit: '200 ml', dietary_tags: ['vegetarian'] },
  { name: 'Amul Kool Chocolate Milk', category: 'Buttermilk & Flavoured Milk', brand: 'Amul', price: 25, mrp: 30, unit: '200 ml', dietary_tags: ['vegetarian'] },

  // Bread
  { name: 'Britannia Brown Bread', category: 'Bread', brand: 'Britannia', price: 42, mrp: 45, unit: '400 g', dietary_tags: ['vegetarian'] },
  { name: 'Britannia White Sandwich Bread', category: 'Bread', brand: 'Britannia', price: 38, mrp: 40, unit: '400 g', dietary_tags: ['vegetarian'] },
  { name: 'Modern White Bread', category: 'Bread', brand: 'Modern', price: 36, mrp: 40, unit: '400 g', dietary_tags: ['vegetarian'] },
  { name: 'Harvest Gold Multigrain Bread', category: 'Bread', brand: 'Harvest Gold', price: 50, mrp: 55, unit: '400 g', dietary_tags: ['vegetarian'] },
  { name: 'English Oven Whole Wheat Bread', category: 'Bread', brand: 'English Oven', price: 55, mrp: 60, unit: '400 g', dietary_tags: ['vegetarian'] },

  // Eggs
  { name: 'Eggoz Nutrition Farm Eggs', category: 'Eggs', brand: 'Eggoz', price: 84, mrp: 90, unit: '6 pcs', dietary_tags: [] },
  { name: "Venky's White Eggs", category: 'Eggs', brand: "Venky's", price: 78, mrp: 84, unit: '6 pcs', dietary_tags: [] },
  { name: 'Suguna Fresh Eggs', category: 'Eggs', brand: 'Suguna', price: 80, mrp: 85, unit: '6 pcs', dietary_tags: [] },
  { name: 'Fresho Farm Eggs', category: 'Eggs', brand: 'Fresho', price: 72, mrp: 80, unit: '6 pcs', dietary_tags: [] },

  // Ice Cream
  { name: 'Amul Vanilla Ice Cream', category: 'Ice Cream', brand: 'Amul', price: 120, mrp: 135, unit: '500 ml', dietary_tags: ['vegetarian'] },
  { name: "Kwality Wall's Cornetto", category: 'Ice Cream', brand: 'Kwality Walls', price: 45, mrp: 50, unit: '90 ml', dietary_tags: ['vegetarian'] },
  { name: 'Havmor Choco Bar', category: 'Ice Cream', brand: 'Havmor', price: 35, mrp: 40, unit: '60 ml', dietary_tags: ['vegetarian'] },

  // ── 2. Fruits & Vegetables ─────────────────────────────────────────────────
  { name: 'Banana', category: 'Fresh Fruits', brand: 'Fresho', price: 40, mrp: 45, unit: '1 kg', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Apple Red Shimla', category: 'Fresh Fruits', brand: 'Fresho', price: 180, mrp: 200, unit: '1 kg', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Mango Alphonso', category: 'Fresh Fruits', brand: 'Fresho', price: 280, mrp: 310, unit: '1 kg', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Papaya', category: 'Fresh Fruits', brand: 'Fresho', price: 60, mrp: 70, unit: '1 kg', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Watermelon', category: 'Fresh Fruits', brand: 'Fresho', price: 35, mrp: 40, unit: '1 kg', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Onion', category: 'Fresh Vegetables', brand: 'Fresho', price: 35, mrp: 40, unit: '1 kg', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Tomato', category: 'Fresh Vegetables', brand: 'Fresho', price: 28, mrp: 35, unit: '1 kg', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Potato', category: 'Fresh Vegetables', brand: 'Fresho', price: 32, mrp: 38, unit: '1 kg', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Capsicum Green', category: 'Fresh Vegetables', brand: 'Fresho', price: 45, mrp: 55, unit: '500 g', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Broccoli', category: 'Exotic Vegetables', brand: 'Fresho', price: 55, mrp: 65, unit: '500 g', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Zucchini', category: 'Exotic Vegetables', brand: 'Fresho', price: 50, mrp: 60, unit: '500 g', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Spinach', category: 'Leafy Greens', brand: 'Fresho', price: 18, mrp: 22, unit: '250 g', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Coriander Leaves', category: 'Herbs & Seasonings', brand: 'Fresho', price: 12, mrp: 15, unit: '100 g', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Green Chilli', category: 'Herbs & Seasonings', brand: 'Fresho', price: 15, mrp: 18, unit: '100 g', dietary_tags: ['vegan', 'gluten-free'] },

  // ── 3. Staples ─────────────────────────────────────────────────────────────
  // Atta & Flours
  { name: 'Aashirvaad Whole Wheat Atta', category: 'Atta & Flours', brand: 'Aashirvaad', price: 249, mrp: 265, unit: '5 kg', dietary_tags: ['vegetarian'] },
  { name: 'Aashirvaad Multigrain Atta', category: 'Atta & Flours', brand: 'Aashirvaad', price: 269, mrp: 285, unit: '5 kg', dietary_tags: ['vegetarian'] },
  { name: 'Fortune Chakki Fresh Atta', category: 'Atta & Flours', brand: 'Fortune', price: 235, mrp: 250, unit: '5 kg', dietary_tags: ['vegetarian'] },
  { name: 'Pillsbury Chakki Fresh Atta', category: 'Atta & Flours', brand: 'Pillsbury', price: 245, mrp: 260, unit: '5 kg', dietary_tags: ['vegetarian'] },
  { name: 'Patanjali Atta Whole Grain', category: 'Atta & Flours', brand: 'Patanjali', price: 220, mrp: 240, unit: '5 kg', dietary_tags: ['vegetarian'] },
  { name: 'Fortune Besan', category: 'Atta & Flours', brand: 'Fortune', price: 78, mrp: 85, unit: '500 g', dietary_tags: ['vegetarian', 'gluten-free'] },
  { name: 'Aashirvaad Sooji Fine', category: 'Sooji & Poha', brand: 'Aashirvaad', price: 42, mrp: 48, unit: '500 g', dietary_tags: ['vegetarian'] },
  { name: 'Fortune Poha', category: 'Sooji & Poha', brand: 'Fortune', price: 40, mrp: 46, unit: '500 g', dietary_tags: ['vegetarian', 'gluten-free'] },

  // Rice
  { name: 'India Gate Basmati Rice Classic', category: 'Rice', brand: 'India Gate', price: 399, mrp: 430, unit: '5 kg', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Daawat Rozana Basmati Rice', category: 'Rice', brand: 'Daawat', price: 375, mrp: 400, unit: '5 kg', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Fortune Sona Masoori Rice', category: 'Rice', brand: 'Fortune', price: 310, mrp: 340, unit: '5 kg', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Kohinoor Super Basmati Rice', category: 'Rice', brand: 'Kohinoor', price: 420, mrp: 450, unit: '5 kg', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Organic Tattva Brown Rice', category: 'Rice', brand: 'Organic Tattva', price: 190, mrp: 210, unit: '1 kg', dietary_tags: ['vegan', 'gluten-free', 'organic'] },

  // Dals & Pulses
  { name: 'Tata Sampann Toor Dal', category: 'Dals & Pulses', brand: 'Tata Sampann', price: 145, mrp: 160, unit: '1 kg', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Tata Sampann Moong Dal', category: 'Dals & Pulses', brand: 'Tata Sampann', price: 160, mrp: 175, unit: '1 kg', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Tata Sampann Chana Dal', category: 'Dals & Pulses', brand: 'Tata Sampann', price: 120, mrp: 135, unit: '1 kg', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Tata Sampann Urad Dal', category: 'Dals & Pulses', brand: 'Tata Sampann', price: 155, mrp: 170, unit: '1 kg', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Fortune Masoor Dal', category: 'Dals & Pulses', brand: 'Fortune', price: 110, mrp: 125, unit: '1 kg', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'BB Royal Rajma Red', category: 'Dals & Pulses', brand: 'BB Royal', price: 130, mrp: 145, unit: '1 kg', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Organic Tattva Kabuli Chana', category: 'Dals & Pulses', brand: 'Organic Tattva', price: 148, mrp: 165, unit: '500 g', dietary_tags: ['vegan', 'gluten-free', 'organic'] },

  // Oils
  { name: 'Fortune Sunflower Oil', category: 'Oils', brand: 'Fortune', price: 155, mrp: 175, unit: '1 L', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Fortune Sunflower Oil', category: 'Oils', brand: 'Fortune', price: 695, mrp: 750, unit: '5 L', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Saffola Gold Oil', category: 'Oils', brand: 'Saffola', price: 185, mrp: 200, unit: '1 L', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Dhara Refined Sunflower Oil', category: 'Oils', brand: 'Dhara', price: 150, mrp: 168, unit: '1 L', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Fortune Mustard Oil', category: 'Oils', brand: 'Fortune', price: 165, mrp: 180, unit: '1 L', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Patanjali Mustard Oil', category: 'Oils', brand: 'Patanjali', price: 158, mrp: 175, unit: '1 L', dietary_tags: ['vegan', 'gluten-free'] },

  // Sugar & Salt
  { name: 'Tata Salt Iodised', category: 'Sugar & Salt', brand: 'Tata Salt', price: 24, mrp: 26, unit: '1 kg', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Catch Iodised Salt', category: 'Sugar & Salt', brand: 'Catch', price: 22, mrp: 25, unit: '1 kg', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Madhur Sugar', category: 'Sugar & Salt', brand: 'Madhur', price: 55, mrp: 60, unit: '1 kg', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Organic Tattva Brown Sugar', category: 'Sugar & Salt', brand: 'Organic Tattva', price: 68, mrp: 78, unit: '500 g', dietary_tags: ['vegan', 'gluten-free', 'organic'] },

  // ── 4. Masala & Spices ─────────────────────────────────────────────────────
  { name: 'MDH Haldi Powder', category: 'Turmeric & Chilli', brand: 'MDH', price: 72, mrp: 80, unit: '200 g', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Everest Turmeric Powder', category: 'Turmeric & Chilli', brand: 'Everest', price: 68, mrp: 75, unit: '200 g', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Catch Red Chilli Powder', category: 'Turmeric & Chilli', brand: 'Catch', price: 62, mrp: 70, unit: '200 g', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'MDH Deggi Mirch', category: 'Turmeric & Chilli', brand: 'MDH', price: 80, mrp: 90, unit: '200 g', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Tata Sampann Coriander Powder', category: 'Coriander & Cumin', brand: 'Tata Sampann', price: 58, mrp: 65, unit: '200 g', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'MDH Jeera Powder', category: 'Coriander & Cumin', brand: 'MDH', price: 65, mrp: 72, unit: '100 g', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Everest Garam Masala', category: 'Masala Blends', brand: 'Everest', price: 75, mrp: 85, unit: '100 g', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'MDH Garam Masala', category: 'Masala Blends', brand: 'MDH', price: 80, mrp: 90, unit: '100 g', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Badshah Pav Bhaji Masala', category: 'Ready Mix Masala', brand: 'Badshah', price: 48, mrp: 55, unit: '100 g', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'MDH Chole Masala', category: 'Ready Mix Masala', brand: 'MDH', price: 52, mrp: 60, unit: '100 g', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Everest Biryani Masala', category: 'Ready Mix Masala', brand: 'Everest', price: 55, mrp: 62, unit: '50 g', dietary_tags: ['vegan', 'gluten-free'] },

  // ── 5. Breakfast & Spreads ─────────────────────────────────────────────────
  { name: 'Kissan Mixed Fruit Jam', category: 'Jams & Spreads', brand: 'Kissan', price: 105, mrp: 120, unit: '200 g', dietary_tags: ['vegetarian'] },
  { name: 'Kissan Mixed Fruit Jam', category: 'Jams & Spreads', brand: 'Kissan', price: 215, mrp: 240, unit: '500 g', dietary_tags: ['vegetarian'] },
  { name: 'Nutella Chocolate Hazelnut Spread', category: 'Jams & Spreads', brand: 'Nutella', price: 195, mrp: 220, unit: '200 g', dietary_tags: ['vegetarian'] },
  { name: 'Pintola All Natural Peanut Butter', category: 'Peanut Butter & Honey', brand: 'Pintola', price: 320, mrp: 350, unit: '1 kg', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'MyFitness Natural Peanut Butter', category: 'Peanut Butter & Honey', brand: 'MyFitness', price: 310, mrp: 340, unit: '1 kg', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Dabur Honey', category: 'Peanut Butter & Honey', brand: 'Dabur', price: 198, mrp: 220, unit: '500 g', dietary_tags: ['vegetarian', 'gluten-free'] },
  { name: 'Patanjali Pure Honey', category: 'Peanut Butter & Honey', brand: 'Patanjali', price: 185, mrp: 210, unit: '500 g', dietary_tags: ['vegetarian', 'gluten-free'] },
  { name: 'Kissan Tomato Ketchup', category: 'Ketchup & Sauces', brand: 'Kissan', price: 95, mrp: 110, unit: '500 g', dietary_tags: ['vegan'] },
  { name: 'Maggi Tomato Ketchup', category: 'Ketchup & Sauces', brand: 'Maggi', price: 99, mrp: 115, unit: '500 g', dietary_tags: ['vegan'] },
  { name: "Ching's Red Chilli Sauce", category: 'Ketchup & Sauces', brand: "Ching's", price: 75, mrp: 85, unit: '200 g', dietary_tags: ['vegan'] },
  { name: "Kellogg's Corn Flakes", category: 'Cereals & Oats', brand: "Kellogg's", price: 175, mrp: 195, unit: '500 g', dietary_tags: ['vegetarian'] },
  { name: "Kellogg's Chocos", category: 'Cereals & Oats', brand: "Kellogg's", price: 185, mrp: 205, unit: '500 g', dietary_tags: ['vegetarian'] },
  { name: "Bagrry's Muesli", category: 'Cereals & Oats', brand: "Bagrry's", price: 220, mrp: 250, unit: '500 g', dietary_tags: ['vegetarian'] },
  { name: 'Quaker Oats', category: 'Cereals & Oats', brand: 'Quaker', price: 125, mrp: 145, unit: '500 g', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Saffola Oats', category: 'Cereals & Oats', brand: 'Saffola', price: 128, mrp: 148, unit: '500 g', dietary_tags: ['vegan', 'gluten-free'] },

  // ── 6. Snacks & Namkeen ────────────────────────────────────────────────────
  { name: "Lay's Classic Salted", category: 'Chips & Crisps', brand: "Lay's", price: 20, mrp: 20, unit: '52 g', dietary_tags: ['vegetarian'] },
  { name: "Lay's Magic Masala", category: 'Chips & Crisps', brand: "Lay's", price: 20, mrp: 20, unit: '52 g', dietary_tags: ['vegetarian'] },
  { name: 'Bingo Mad Angles Achaari Masti', category: 'Chips & Crisps', brand: 'Bingo', price: 20, mrp: 20, unit: '75 g', dietary_tags: ['vegetarian'] },
  { name: 'Kurkure Masala Munch', category: 'Chips & Crisps', brand: 'Kurkure', price: 20, mrp: 20, unit: '80 g', dietary_tags: ['vegetarian'] },
  { name: 'Balaji Wafers Cream & Onion', category: 'Chips & Crisps', brand: 'Balaji', price: 20, mrp: 20, unit: '60 g', dietary_tags: ['vegetarian'] },
  { name: "Haldiram's Aloo Bhujia", category: 'Namkeen & Mixtures', brand: "Haldiram's", price: 85, mrp: 95, unit: '200 g', dietary_tags: ['vegetarian'] },
  { name: "Haldiram's Navratan Mix", category: 'Namkeen & Mixtures', brand: "Haldiram's", price: 90, mrp: 100, unit: '200 g', dietary_tags: ['vegetarian'] },
  { name: 'Bikaji Bikaneri Bhujia', category: 'Namkeen & Mixtures', brand: 'Bikaji', price: 80, mrp: 90, unit: '200 g', dietary_tags: ['vegetarian'] },
  { name: 'Act II Butter Popcorn', category: 'Popcorn', brand: 'Act II', price: 42, mrp: 50, unit: '70 g', dietary_tags: ['vegetarian'] },
  { name: '4700BC Himalayan Pink Salt Popcorn', category: 'Popcorn', brand: '4700BC', price: 99, mrp: 115, unit: '125 g', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Maggi 2-Minute Noodles Masala', category: 'Instant Noodles', brand: 'Maggi', price: 14, mrp: 14, unit: '70 g', dietary_tags: ['vegetarian'] },
  { name: 'Maggi Atta Noodles', category: 'Instant Noodles', brand: 'Maggi', price: 18, mrp: 18, unit: '80 g', dietary_tags: ['vegetarian'] },
  { name: 'Yippee Magic Masala Noodles', category: 'Instant Noodles', brand: 'Yippee', price: 14, mrp: 14, unit: '70 g', dietary_tags: ['vegetarian'] },
  { name: "Ching's Hakka Noodles", category: 'Instant Noodles', brand: "Ching's", price: 25, mrp: 28, unit: '150 g', dietary_tags: ['vegetarian'] },

  // ── 7. Biscuits & Bakery ────────────────────────────────────────────────────
  { name: 'Parle-G Glucose Biscuits', category: 'Glucose & Marie Biscuits', brand: 'Parle', price: 10, mrp: 10, unit: '80 g', dietary_tags: ['vegetarian'] },
  { name: 'Britannia Marie Gold Biscuits', category: 'Glucose & Marie Biscuits', brand: 'Britannia', price: 32, mrp: 35, unit: '250 g', dietary_tags: ['vegetarian'] },
  { name: 'Sunfeast Marie Light Biscuits', category: 'Glucose & Marie Biscuits', brand: 'Sunfeast', price: 28, mrp: 32, unit: '200 g', dietary_tags: ['vegetarian'] },
  { name: 'Britannia Good Day Cashew Biscuits', category: 'Cream Biscuits & Cookies', brand: 'Britannia', price: 32, mrp: 35, unit: '200 g', dietary_tags: ['vegetarian'] },
  { name: 'Oreo Original Cream Biscuits', category: 'Cream Biscuits & Cookies', brand: 'Oreo', price: 45, mrp: 50, unit: '200 g', dietary_tags: ['vegetarian'] },
  { name: 'Britannia Bourbon Biscuits', category: 'Cream Biscuits & Cookies', brand: 'Britannia', price: 28, mrp: 32, unit: '200 g', dietary_tags: ['vegetarian'] },
  { name: 'McVities Digestive Biscuits', category: 'Cream Biscuits & Cookies', brand: 'McVities', price: 75, mrp: 85, unit: '200 g', dietary_tags: ['vegetarian'] },
  { name: 'ITC Sunfeast Dark Fantasy', category: 'Cream Biscuits & Cookies', brand: 'Sunfeast', price: 55, mrp: 62, unit: '150 g', dietary_tags: ['vegetarian'] },

  // ── 8. Tea, Coffee & Health Drinks ─────────────────────────────────────────
  { name: 'Tata Tea Gold', category: 'Tea', brand: 'Tata Tea', price: 160, mrp: 178, unit: '250 g', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Tata Tea Premium', category: 'Tea', brand: 'Tata Tea', price: 138, mrp: 155, unit: '250 g', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Brooke Bond Red Label Tea', category: 'Tea', brand: 'Red Label', price: 148, mrp: 165, unit: '250 g', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Wagh Bakri Premium Tea', category: 'Tea', brand: 'Wagh Bakri', price: 155, mrp: 172, unit: '250 g', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Society Tea', category: 'Tea', brand: 'Society', price: 145, mrp: 162, unit: '250 g', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Nescafé Classic Coffee', category: 'Coffee', brand: 'Nescafé', price: 195, mrp: 220, unit: '100 g', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Bru Instant Coffee', category: 'Coffee', brand: 'Bru', price: 175, mrp: 195, unit: '100 g', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Continental Coffee Xtra Strong', category: 'Coffee', brand: 'Continental', price: 158, mrp: 178, unit: '100 g', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Horlicks Classic Malt', category: 'Malt & Health Drinks', brand: 'Horlicks', price: 295, mrp: 330, unit: '500 g', dietary_tags: ['vegetarian'] },
  { name: 'Bournvita Chocolate Health Drink', category: 'Malt & Health Drinks', brand: 'Bournvita', price: 285, mrp: 320, unit: '500 g', dietary_tags: ['vegetarian'] },
  { name: 'Boost Energy Health Drink', category: 'Malt & Health Drinks', brand: 'Boost', price: 265, mrp: 298, unit: '500 g', dietary_tags: ['vegetarian'] },
  { name: 'Complan Chocolate Nutrition Drink', category: 'Malt & Health Drinks', brand: 'Complan', price: 310, mrp: 345, unit: '500 g', dietary_tags: ['vegetarian'] },

  // ── 9. Cold Drinks, Juices & Water ─────────────────────────────────────────
  { name: 'Coca-Cola', category: 'Soft Drinks', brand: 'Coca-Cola', price: 45, mrp: 50, unit: '750 ml', dietary_tags: ['vegan'] },
  { name: 'Pepsi Cola', category: 'Soft Drinks', brand: 'Pepsi', price: 45, mrp: 50, unit: '750 ml', dietary_tags: ['vegan'] },
  { name: 'Thums Up', category: 'Soft Drinks', brand: 'Thums Up', price: 45, mrp: 50, unit: '750 ml', dietary_tags: ['vegan'] },
  { name: 'Sprite Lemon Lime', category: 'Soft Drinks', brand: 'Sprite', price: 40, mrp: 45, unit: '750 ml', dietary_tags: ['vegan'] },
  { name: 'Fanta Orange', category: 'Soft Drinks', brand: 'Fanta', price: 40, mrp: 45, unit: '750 ml', dietary_tags: ['vegan'] },
  { name: 'Limca Lemon & Lime', category: 'Soft Drinks', brand: 'Limca', price: 38, mrp: 42, unit: '750 ml', dietary_tags: ['vegan'] },
  { name: 'Tropicana Orange Juice', category: 'Fruit Juices', brand: 'Tropicana', price: 90, mrp: 105, unit: '1 L', dietary_tags: ['vegan'] },
  { name: 'Real Mixed Fruit Juice', category: 'Fruit Juices', brand: 'Real', price: 99, mrp: 115, unit: '1 L', dietary_tags: ['vegan'] },
  { name: 'Paper Boat Aam Panna', category: 'Fruit Juices', brand: 'Paper Boat', price: 30, mrp: 35, unit: '200 ml', dietary_tags: ['vegan'] },
  { name: 'B Natural Apple Juice', category: 'Fruit Juices', brand: 'B Natural', price: 85, mrp: 95, unit: '1 L', dietary_tags: ['vegan'] },
  { name: 'Bisleri Mineral Water', category: 'Packaged Water', brand: 'Bisleri', price: 20, mrp: 20, unit: '1 L', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Kinley Drinking Water', category: 'Packaged Water', brand: 'Kinley', price: 15, mrp: 15, unit: '1 L', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Aquafina Drinking Water', category: 'Packaged Water', brand: 'Aquafina', price: 20, mrp: 20, unit: '1 L', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Red Bull Energy Drink', category: 'Energy Drinks', brand: 'Red Bull', price: 115, mrp: 130, unit: '250 ml', dietary_tags: ['vegan'] },

  // ── 10. Chocolates & Dry Fruits ────────────────────────────────────────────
  { name: 'Cadbury Dairy Milk Chocolate', category: 'Chocolates', brand: 'Cadbury', price: 40, mrp: 45, unit: '50 g', dietary_tags: ['vegetarian'] },
  { name: 'Cadbury Dairy Milk Silk', category: 'Chocolates', brand: 'Cadbury', price: 95, mrp: 110, unit: '65 g', dietary_tags: ['vegetarian'] },
  { name: 'Cadbury 5 Star', category: 'Chocolates', brand: 'Cadbury', price: 20, mrp: 20, unit: '40 g', dietary_tags: ['vegetarian'] },
  { name: 'KitKat Chocolate Wafer Bar', category: 'Chocolates', brand: 'KitKat', price: 20, mrp: 20, unit: '18 g', dietary_tags: ['vegetarian'] },
  { name: 'Ferrero Rocher', category: 'Chocolates', brand: 'Ferrero', price: 135, mrp: 150, unit: '3 pcs', dietary_tags: ['vegetarian'] },
  { name: 'Happilo Premium Almonds', category: 'Dry Fruits', brand: 'Happilo', price: 349, mrp: 390, unit: '500 g', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Happilo Cashews', category: 'Dry Fruits', brand: 'Happilo', price: 399, mrp: 450, unit: '500 g', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Nutraj Golden Raisins', category: 'Dry Fruits', brand: 'Nutraj', price: 155, mrp: 175, unit: '250 g', dietary_tags: ['vegan', 'gluten-free'] },
  { name: 'Farmley Walnut Kernels', category: 'Dry Fruits', brand: 'Farmley', price: 280, mrp: 320, unit: '250 g', dietary_tags: ['vegan', 'gluten-free'] },

  // ── 11. Bath & Body ────────────────────────────────────────────────────────
  { name: 'Dove Beauty Soap Bar', category: 'Bath Soap', brand: 'Dove', price: 55, mrp: 65, unit: '100 g', dietary_tags: [] },
  { name: 'Lux Soft Touch Soap', category: 'Bath Soap', brand: 'Lux', price: 42, mrp: 50, unit: '100 g', dietary_tags: [] },
  { name: 'Lifebuoy Total 10 Soap', category: 'Bath Soap', brand: 'Lifebuoy', price: 38, mrp: 45, unit: '100 g', dietary_tags: [] },
  { name: 'Pears Pure & Gentle Soap', category: 'Bath Soap', brand: 'Pears', price: 48, mrp: 55, unit: '125 g', dietary_tags: [] },
  { name: 'Santoor Classic Soap', category: 'Bath Soap', brand: 'Santoor', price: 40, mrp: 48, unit: '125 g', dietary_tags: [] },
  { name: 'Dove Body Wash Deeply Nourishing', category: 'Body Wash', brand: 'Dove', price: 175, mrp: 200, unit: '250 ml', dietary_tags: [] },
  { name: 'Nivea Creme Soft Body Wash', category: 'Body Wash', brand: 'Nivea', price: 165, mrp: 190, unit: '250 ml', dietary_tags: [] },
  { name: 'Palmolive Naturals Body Wash', category: 'Body Wash', brand: 'Palmolive', price: 155, mrp: 178, unit: '250 ml', dietary_tags: [] },

  // ── 12. Oral Care ──────────────────────────────────────────────────────────
  { name: 'Colgate MaxFresh Toothpaste', category: 'Toothpaste', brand: 'Colgate', price: 95, mrp: 110, unit: '150 g', dietary_tags: [] },
  { name: 'Colgate Strong Teeth Toothpaste', category: 'Toothpaste', brand: 'Colgate', price: 72, mrp: 85, unit: '200 g', dietary_tags: [] },
  { name: 'Sensodyne Fresh Mint Toothpaste', category: 'Toothpaste', brand: 'Sensodyne', price: 120, mrp: 140, unit: '70 g', dietary_tags: [] },
  { name: 'Pepsodent Germicheck Toothpaste', category: 'Toothpaste', brand: 'Pepsodent', price: 70, mrp: 82, unit: '150 g', dietary_tags: [] },
  { name: 'Colgate 360 Toothbrush', category: 'Toothbrush', brand: 'Colgate', price: 60, mrp: 75, unit: '1 pc', dietary_tags: [] },
  { name: 'Oral-B Pro Health Toothbrush', category: 'Toothbrush', brand: 'Colgate', price: 85, mrp: 99, unit: '1 pc', dietary_tags: [] },

  // ── 13. Hair & Skin Care ───────────────────────────────────────────────────
  { name: 'Parachute Coconut Hair Oil', category: 'Hair Oil', brand: 'Parachute', price: 110, mrp: 130, unit: '200 ml', dietary_tags: [] },
  { name: 'Dabur Amla Hair Oil', category: 'Hair Oil', brand: 'Dabur', price: 115, mrp: 135, unit: '200 ml', dietary_tags: [] },
  { name: 'Bajaj Almond Drops Hair Oil', category: 'Hair Oil', brand: 'Bajaj', price: 120, mrp: 140, unit: '200 ml', dietary_tags: [] },
  { name: 'Navratna Cool Hair Oil', category: 'Hair Oil', brand: 'Navratna', price: 105, mrp: 125, unit: '200 ml', dietary_tags: [] },
  { name: 'Dove Hair Fall Rescue Shampoo', category: 'Shampoo', brand: 'Dove', price: 210, mrp: 240, unit: '340 ml', dietary_tags: [] },
  { name: 'Head & Shoulders Classic Clean Shampoo', category: 'Shampoo', brand: 'Head & Shoulders', price: 220, mrp: 250, unit: '340 ml', dietary_tags: [] },
  { name: 'Clinic Plus Strength Shampoo', category: 'Shampoo', brand: 'Clinic Plus', price: 165, mrp: 190, unit: '340 ml', dietary_tags: [] },
  { name: 'Pantene Silky Smooth Shampoo', category: 'Shampoo', brand: 'Pantene', price: 199, mrp: 228, unit: '340 ml', dietary_tags: [] },
  { name: 'Himalaya Gentle Daily Care Shampoo', category: 'Shampoo', brand: 'Himalaya', price: 175, mrp: 200, unit: '340 ml', dietary_tags: [] },
  { name: 'Himalaya Neem Face Wash', category: 'Face Wash', brand: 'Himalaya', price: 85, mrp: 100, unit: '100 ml', dietary_tags: [] },
  { name: 'Garnier Bright Complete Face Wash', category: 'Face Wash', brand: 'Garnier', price: 95, mrp: 110, unit: '100 ml', dietary_tags: [] },
  { name: "Pond's White Beauty Face Wash", category: 'Face Wash', brand: "Pond's", price: 90, mrp: 105, unit: '100 ml', dietary_tags: [] },
  { name: 'Nivea Refreshing Face Wash', category: 'Face Wash', brand: 'Nivea', price: 98, mrp: 115, unit: '100 ml', dietary_tags: [] },
  { name: 'Nivea Body Lotion Soft', category: 'Body Lotion', brand: 'Nivea', price: 185, mrp: 215, unit: '200 ml', dietary_tags: [] },
  { name: "Pond's Light Moisturiser", category: 'Body Lotion', brand: "Pond's", price: 175, mrp: 200, unit: '200 ml', dietary_tags: [] },
  { name: 'Vaseline Intensive Care Lotion', category: 'Body Lotion', brand: 'Vaseline', price: 165, mrp: 190, unit: '200 ml', dietary_tags: [] },
  { name: 'Parachute Advansed After Shower Body Lotion', category: 'Body Lotion', brand: 'Parachute', price: 145, mrp: 170, unit: '200 ml', dietary_tags: [] },
  { name: 'Himalaya Protective Sunscreen Lotion SPF 15', category: 'Skin Care', brand: 'Himalaya', price: 120, mrp: 145, unit: '100 ml', dietary_tags: [] },

  // ── 14. Feminine Hygiene ───────────────────────────────────────────────────
  { name: 'Nua Ultra Clean Sanitary Pads', category: 'Sanitary Pads', brand: 'Nua', price: 120, mrp: 138, unit: '15 pcs', dietary_tags: [] },
  { name: 'Stayfree Secure Cottony Soft Pads', category: 'Sanitary Pads', brand: 'Stayfree', price: 110, mrp: 128, unit: '15 pcs', dietary_tags: [] },
  { name: 'Sofy Antibacterial Ultra Thin Pads', category: 'Sanitary Pads', brand: 'Sofy', price: 115, mrp: 132, unit: '15 pcs', dietary_tags: [] },
  { name: 'Nua Biodegradable Sanitary Pads', category: 'Sanitary Pads', brand: 'Nua', price: 149, mrp: 170, unit: '15 pcs', dietary_tags: [] },

  // ── 15. Baby Care ──────────────────────────────────────────────────────────
  { name: 'Pampers Baby Dry Pants M', category: 'Diapers', brand: 'Pampers', price: 499, mrp: 549, unit: '56 pcs', dietary_tags: [] },
  { name: 'Huggies Wonder Pants M', category: 'Diapers', brand: 'Huggies', price: 469, mrp: 520, unit: '56 pcs', dietary_tags: [] },
  { name: 'MamyPoko Pants Extra Absorb M', category: 'Diapers', brand: 'MamyPoko', price: 450, mrp: 499, unit: '54 pcs', dietary_tags: [] },
  { name: 'Nestlé Cerelac Rice Wheat', category: 'Baby Food & Formula', brand: 'Cerelac', price: 295, mrp: 330, unit: '400 g', dietary_tags: [] },
  { name: 'Nestlé Lactogen 1 Infant Formula', category: 'Baby Food & Formula', brand: 'Lactogen', price: 480, mrp: 530, unit: '400 g', dietary_tags: [] },
  { name: "Johnson's Baby Powder", category: 'Baby Toiletries', brand: "Johnson's", price: 145, mrp: 165, unit: '200 g', dietary_tags: [] },
  { name: 'Himalaya Gentle Baby Shampoo', category: 'Baby Toiletries', brand: 'Himalaya', price: 110, mrp: 130, unit: '200 ml', dietary_tags: [] },
  { name: "Johnson's Baby Oil", category: 'Baby Toiletries', brand: "Johnson's", price: 155, mrp: 178, unit: '200 ml', dietary_tags: [] },

  // ── 16. Laundry ────────────────────────────────────────────────────────────
  { name: 'Surf Excel Easy Wash Detergent Powder', category: 'Detergents', brand: 'Surf Excel', price: 299, mrp: 340, unit: '2 kg', dietary_tags: [] },
  { name: 'Surf Excel Matic Top Load Detergent', category: 'Detergents', brand: 'Surf Excel', price: 320, mrp: 360, unit: '2 kg', dietary_tags: [] },
  { name: 'Ariel Matic Front Load Detergent', category: 'Detergents', brand: 'Ariel', price: 340, mrp: 385, unit: '2 kg', dietary_tags: [] },
  { name: 'Tide Plus Extra Power Detergent', category: 'Detergents', brand: 'Tide', price: 275, mrp: 310, unit: '2 kg', dietary_tags: [] },
  { name: 'Rin Advanced Detergent Powder', category: 'Detergents', brand: 'Rin', price: 185, mrp: 215, unit: '2 kg', dietary_tags: [] },
  { name: 'Ghadi Detergent Powder', category: 'Detergents', brand: 'Ghadi', price: 150, mrp: 175, unit: '2 kg', dietary_tags: [] },
  { name: 'Comfort After Wash Fabric Softener', category: 'Fabric Softener', brand: 'Comfort', price: 99, mrp: 115, unit: '500 ml', dietary_tags: [] },

  // ── 17. Home Cleaning ─────────────────────────────────────────────────────
  { name: 'Vim Dishwash Gel Lemon', category: 'Dishwash', brand: 'Vim', price: 99, mrp: 115, unit: '500 ml', dietary_tags: [] },
  { name: 'Pril Dishwash Liquid Active Lime', category: 'Dishwash', brand: 'Pril', price: 95, mrp: 110, unit: '500 ml', dietary_tags: [] },
  { name: 'Vim Lemon Dishwash Bar', category: 'Dishwash', brand: 'Vim', price: 40, mrp: 48, unit: '200 g', dietary_tags: [] },
  { name: 'Harpic Power Plus Original Toilet Cleaner', category: 'Toilet Cleaners', brand: 'Harpic', price: 85, mrp: 100, unit: '500 ml', dietary_tags: [] },
  { name: 'Domex Fresh Guard Toilet Cleaner', category: 'Toilet Cleaners', brand: 'Domex', price: 79, mrp: 95, unit: '500 ml', dietary_tags: [] },
  { name: 'Lizol Disinfectant Floor Cleaner Citrus', category: 'Floor Cleaners', brand: 'Lizol', price: 120, mrp: 140, unit: '1 L', dietary_tags: [] },
  { name: 'Domex Floor & Surface Cleaner', category: 'Floor Cleaners', brand: 'Domex', price: 105, mrp: 125, unit: '1 L', dietary_tags: [] },
  { name: 'Colin Glass & Surface Cleaner', category: 'Surface & Glass Cleaners', brand: 'Colin', price: 85, mrp: 100, unit: '500 ml', dietary_tags: [] },

  // ── 18. Kitchen Supplies ───────────────────────────────────────────────────
  { name: 'Origami Garbage Bags Medium', category: 'Garbage Bags', brand: 'Origami', price: 60, mrp: 72, unit: '30 pcs', dietary_tags: [] },
  { name: 'Origami Garbage Bags Large', category: 'Garbage Bags', brand: 'Origami', price: 75, mrp: 88, unit: '30 pcs', dietary_tags: [] },
  { name: 'Origami Facial Tissue', category: 'Tissue Paper', brand: 'Origami', price: 55, mrp: 65, unit: '200 pulls', dietary_tags: [] },
  { name: 'Premier Facial Tissue Box', category: 'Tissue Paper', brand: 'Premier', price: 50, mrp: 62, unit: '200 pulls', dietary_tags: [] },

  // ── 19. Pet Care ───────────────────────────────────────────────────────────
  { name: 'Pedigree Adult Dog Food Chicken & Vegetables', category: 'Dog Food', brand: 'Pedigree', price: 310, mrp: 350, unit: '1.2 kg', dietary_tags: [] },
  { name: 'Drools Chicken & Egg Adult Dog Food', category: 'Dog Food', brand: 'Drools', price: 285, mrp: 320, unit: '1.2 kg', dietary_tags: [] },
  { name: 'Royal Canin Adult Dog Food', category: 'Dog Food', brand: 'Royal Canin', price: 850, mrp: 950, unit: '3 kg', dietary_tags: [] },
  { name: 'Whiskas Adult Cat Food Ocean Fish', category: 'Cat Food', brand: 'Whiskas', price: 290, mrp: 330, unit: '1.2 kg', dietary_tags: [] },
  { name: 'Purepet Mackerel Cat Food', category: 'Cat Food', brand: 'Purepet', price: 250, mrp: 285, unit: '1.2 kg', dietary_tags: [] },

  // ── 20. Pooja & Festive ────────────────────────────────────────────────────
  { name: 'Cycle No. 3 Agarbatti', category: 'Agarbatti & Dhoop', brand: 'Cycle', price: 65, mrp: 75, unit: '100 sticks', dietary_tags: [] },
  { name: 'Mangaldeep Tulsi Agarbatti', category: 'Agarbatti & Dhoop', brand: 'Mangaldeep', price: 55, mrp: 65, unit: '100 sticks', dietary_tags: [] },
  { name: 'Hem Lavender Incense Sticks', category: 'Agarbatti & Dhoop', brand: 'Hem', price: 50, mrp: 60, unit: '100 sticks', dietary_tags: [] },
  { name: 'Zed Black Agarbatti Zipper', category: 'Agarbatti & Dhoop', brand: 'Zed Black', price: 75, mrp: 85, unit: '200 sticks', dietary_tags: [] },
  { name: 'Cycle Pure Camphor Tablets', category: 'Camphor & Wicks', brand: 'Cycle', price: 42, mrp: 50, unit: '50 g', dietary_tags: [] },
];

// ── Dark Stores (Bangalore) ─────────────────────────────────────────────────
const DARK_STORES = [
  { name: 'Freshcart Koramangala Hub', lat: 12.9352, lng: 77.6245, service_radius_km: 5 },
  { name: 'Freshcart Indiranagar Hub', lat: 12.9784, lng: 77.6408, service_radius_km: 5 },
  { name: 'Freshcart HSR Layout Hub', lat: 12.9121, lng: 77.6446, service_radius_km: 5 },
];

const SYNTHETIC_USER_COUNT = 180;

async function seed() {
  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();
  const demoPasswordHash = await bcrypt.hash('password123', 12);

  try {
    console.log('🌱 Starting seed...\n');

    // ── Seed Categories ──────────────────────
    console.log('📂 Seeding categories...');
    const categoryMap = {}; // name -> id

    for (const cat of CATEGORIES) {
      const { rows: [parent] } = await client.query(
        'INSERT INTO categories (name, icon_url) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING id',
        [cat.name, cat.icon_url]
      );
      const parentId = parent?.id || (await client.query('SELECT id FROM categories WHERE name = $1', [cat.name])).rows[0].id;
      categoryMap[cat.name] = parentId;

      for (const child of (cat.children || [])) {
        const { rows: [c] } = await client.query(
          'INSERT INTO categories (name, parent_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING id',
          [child.name, parentId]
        );
        categoryMap[child.name] = c?.id || (await client.query('SELECT id FROM categories WHERE name = $1', [child.name])).rows[0].id;
      }
    }
    console.log(`   ✅ ${Object.keys(categoryMap).length} categories\n`);

    // ── Seed Brands ──────────────────────────
    console.log('🏷️  Seeding brands...');
    const brandMap = {};

    for (const name of BRANDS) {
      const { rows: [b] } = await client.query(
        'INSERT INTO brands (name) VALUES ($1) ON CONFLICT DO NOTHING RETURNING id',
        [name]
      );
      brandMap[name] = b?.id || (await client.query('SELECT id FROM brands WHERE name = $1', [name])).rows[0].id;
    }
    console.log(`   ✅ ${Object.keys(brandMap).length} brands\n`);

    // ── Seed Real Products ───────────────────
    console.log('🛒 Seeding real products...');
    let productCount = 0;
    let skippedCount = 0;

    for (const p of REAL_PRODUCTS) {
      const categoryId = categoryMap[p.category];
      const brandId = brandMap[p.brand];
      if (!categoryId || !brandId) {
        console.warn(`   ⚠️  Skipping ${p.name}: category="${p.category}" or brand="${p.brand}" not found`);
        skippedCount++;
        continue;
      }
      const mrp = p.mrp || Math.round(p.price * (1.15 + Math.random() * 0.2) * 100) / 100;
      const dietaryTags = p.dietary_tags || [];
      await client.query(
        `INSERT INTO products (name, category_id, brand_id, price, mrp, unit, stock_qty, dietary_tags)
         SELECT $1::text, $2, $3, $4, $5, $6, $7, $8
         WHERE NOT EXISTS (
           SELECT 1 FROM products WHERE LOWER(name) = LOWER($1::text)
         )`,
        [p.name, categoryId, brandId, p.price, mrp, p.unit, Math.floor(Math.random() * 200) + 50, dietaryTags]
      );
      productCount++;
    }
    console.log(`   ✅ ${productCount} real products seeded (${skippedCount} skipped)\n`);

    // ── Seed Synthetic Products ──────────────
    console.log('🧪 Generating synthetic products...');
    const syntheticProducts = generateSyntheticProducts(categoryMap, brandMap);
    let synthCount = 0;
    for (const p of syntheticProducts) {
      await client.query(
        `INSERT INTO products (name, category_id, brand_id, price, mrp, unit, stock_qty)
         SELECT $1::text, $2, $3, $4, $5, $6, $7
         WHERE NOT EXISTS (
           SELECT 1 FROM products WHERE LOWER(name) = LOWER($1::text)
         )`,
        [p.name, p.category_id, p.brand_id, p.price, p.mrp, p.unit, Math.floor(Math.random() * 200) + 20]
      );
      synthCount++;
    }
    console.log(`   ✅ ${synthCount} synthetic products\n`);

    // ── Seed Dark Stores ─────────────────────
    console.log('🏪 Seeding dark stores...');
    for (const store of DARK_STORES) {
      await client.query(
        `INSERT INTO dark_stores (name, lat, lng, service_radius_km)
         VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
        [store.name, store.lat, store.lng, store.service_radius_km]
      );
    }
    console.log(`   ✅ ${DARK_STORES.length} dark stores (Bangalore)\n`);

    // ── Seed Admin User ──────────────────────
    console.log('👤 Seeding admin user...');
    await client.query(
      `INSERT INTO users (phone, email, password_hash, name, role)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (phone) DO UPDATE
       SET email = EXCLUDED.email,
           password_hash = EXCLUDED.password_hash,
           name = EXCLUDED.name,
           role = EXCLUDED.role`,
      ['9999999999', 'admin@freshcart.local', demoPasswordHash, 'Admin', 'admin']
    );
    console.log('   ✅ Admin user (phone: 9999999999)\n');

    // ── Seed test user with address ──────────
    console.log('👤 Seeding test user...');
    const { rows: [testUser] } = await client.query(
      `INSERT INTO users (phone, email, password_hash, name)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (phone) DO UPDATE
       SET email = EXCLUDED.email,
           password_hash = EXCLUDED.password_hash,
           name = EXCLUDED.name
       RETURNING id`,
      ['9876543210', 'customer@freshcart.local', demoPasswordHash, 'Test User']
    );
    await client.query(
      `INSERT INTO addresses (user_id, label, lat, lng, full_address, is_default)
       VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING`,
      [testUser.id, 'Home', 12.9352, 77.6140, 'HSR Layout, Bangalore 560102', true]
    );
    console.log('   ✅ Test user (phone: 9876543210) with address\n');

    // ── Seed Reviews ─────────────────────────
    console.log('⭐ Seeding synthetic reviews...');
    const reviewCount = await generateSyntheticReviews(client, testUser.id);
    console.log(`   ✅ ${reviewCount} reviews\n`);

    // ── Seed Synthetic Users & Orders ────────
    console.log('Seeding synthetic users and order patterns...');
    const syntheticUserCount = await seedSyntheticUsers(client, demoPasswordHash);
    console.log(`   OK ${syntheticUserCount} synthetic users with repeat-order history\n`);

    console.log('Seeding Pramarsha demo personas...');
    await seedPramarshaDemoUsers(client, demoPasswordHash);
    console.log('   OK Pramarsha demo personas\n');

    // ── Refresh Product Scores ────────────────
    console.log('Refreshing product scores...');
    const scoreCount = await refreshProductScores(client);
    console.log(`   OK ${scoreCount} product scores\n`);
    await ensureCatalogCompatibility(client);
    await bustCatalogCache();

    const { rows: [{ count }] } = await client.query('SELECT COUNT(*) FROM products');
    console.log(`\n🎉 Seed complete! Total products: ${count}`);

  } finally {
    client.release();
    await pool.end();
  }
}

async function seedSyntheticUsers(client, passwordHash) {
  const { rows: products } = await client.query(`
    SELECT p.id, p.price::float AS price, p.category_id
    FROM products p
    WHERE p.stock_qty > 0
    ORDER BY p.id
  `);

  const byCategory = products.reduce((acc, product) => {
    acc[product.category_id] ||= [];
    acc[product.category_id].push(product);
    return acc;
  }, {});
  const categoryIds = Object.keys(byCategory);
  if (!categoryIds.length) return 0;

  for (let i = 1; i <= SYNTHETIC_USER_COUNT; i++) {
    const phone = `88000${String(i).padStart(5, '0')}`;
    const email = `demo.user.${String(i).padStart(3, '0')}@freshcart.local`;
    const { rows: [user] } = await client.query(
      `INSERT INTO users (phone, email, password_hash, name)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (phone) DO UPDATE
       SET email = EXCLUDED.email,
           password_hash = EXCLUDED.password_hash,
           name = EXCLUDED.name
       RETURNING id`,
      [phone, email, passwordHash, `Demo User ${i}`]
    );

    await client.query(
      `INSERT INTO addresses (user_id, label, lat, lng, full_address, is_default)
       SELECT $1, 'Home', $2, $3, $4, true
       WHERE NOT EXISTS (
         SELECT 1 FROM addresses WHERE user_id = $1 AND label = 'Home'
       )`,
      [
        user.id,
        12.90 + ((i % 40) * 0.003),
        77.58 + ((i % 35) * 0.003),
        `Demo Address ${i}, Bangalore`,
      ]
    );

    const { rows: [{ order_count: orderCount }] } = await client.query(
      'SELECT COUNT(*)::int AS order_count FROM orders WHERE user_id = $1',
      [user.id]
    );
    if (orderCount > 0) continue;

    const preferredCategory = Number(categoryIds[i % categoryIds.length]);
    const categoryProducts = byCategory[preferredCategory] || products;
    const orderIndexes = [0, 1, 2, 3].slice(0, 3 + (i % 2));

    for (const orderIndex of orderIndexes) {
      const picked = [
        categoryProducts[(i + orderIndex) % categoryProducts.length],
        categoryProducts[(i + orderIndex + 3) % categoryProducts.length],
        products[(i * 7 + orderIndex) % products.length],
      ].filter(Boolean);
      const total = picked.reduce((sum, product) => sum + Number(product.price), 0);
      const { rows: [address] } = await client.query(
        'SELECT id FROM addresses WHERE user_id = $1 AND is_default = true LIMIT 1',
        [user.id]
      );
      const { rows: [store] } = await client.query(
        'SELECT id FROM dark_stores WHERE is_active = true ORDER BY id LIMIT 1'
      );
      const { rows: [order] } = await client.query(
        `INSERT INTO orders (user_id, address_id, dark_store_id, status, total, payment_method, created_at)
         VALUES ($1, $2, $3, 'delivered', $4, 'cod', NOW() - ($5::int || ' days')::interval)
         RETURNING id`,
        [user.id, address.id, store.id, total.toFixed(2), orderIndex * 7 + (i % 7)]
      );

      for (const product of picked) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, qty, price_at_purchase)
           VALUES ($1, $2, 1, $3)`,
          [order.id, product.id, product.price]
        );
      }
    }
  }

  return SYNTHETIC_USER_COUNT;
}

function pickProducts(products, words, limit = 4) {
  const needles = words.map(word => word.toLowerCase());
  return products
    .filter(product => needles.some(word => product.name.toLowerCase().includes(word)))
    .slice(0, limit);
}

function orderTimestamp(weeksAgo, dayOffset, hour) {
  const date = new Date();
  date.setDate(date.getDate() - (weeksAgo * 7));
  const currentDay = date.getDay();
  date.setDate(date.getDate() - ((currentDay - dayOffset + 7) % 7));
  date.setHours(hour, 15, 0, 0);
  return date;
}

async function seedPramarshaOrder(client, userId, products, createdAt) {
  if (!products.length) return;
  const total = products.reduce((sum, product) => sum + Number(product.price), 0);
  const { rows: [address] } = await client.query(
    'SELECT id FROM addresses WHERE user_id = $1 AND is_default = true LIMIT 1',
    [userId]
  );
  const { rows: [store] } = await client.query(
    'SELECT id FROM dark_stores WHERE is_active = true ORDER BY id LIMIT 1'
  );
  const { rows: [order] } = await client.query(
    `INSERT INTO orders (user_id, address_id, dark_store_id, status, total, payment_method, created_at)
     VALUES ($1, $2, $3, 'delivered', $4, 'cod', $5)
     RETURNING id`,
    [userId, address.id, store.id, total.toFixed(2), createdAt]
  );

  for (const product of products) {
    await client.query(
      `INSERT INTO order_items (order_id, product_id, qty, price_at_purchase)
       VALUES ($1, $2, 1, $3)`,
      [order.id, product.id, product.price]
    );
  }
}

async function seedPramarshaDemoUsers(client, passwordHash) {
  const { rows: products } = await client.query(`
    SELECT id, name, price::float AS price
    FROM products
    WHERE stock_qty > 0
    ORDER BY id
  `);

  const personas = [
    {
      name: 'Aditi Rao',
      email: 'aditi.rao@freshcart.local',
      phone: '8811100001',
      words: ['Atta', 'Toor Dal', 'Toned Milk', 'Paneer'],
      count: 10,
      day: 0,
      hour: 10,
    },
    {
      name: 'Rohan Mehta',
      email: 'rohan.mehta@freshcart.local',
      phone: '8811100002',
      words: ['Chips', 'Coca-Cola', 'Noodles', 'Namkeen'],
      count: 8,
      day: 3,
      hour: 19,
    },
    {
      name: 'Priya Nair',
      email: 'priya.nair@freshcart.local',
      phone: '8811100003',
      words: ['Milk', 'Rice', 'Soap', 'Coffee', 'Juice', 'Tomato'],
      count: 18,
      day: 2,
      hour: 23,
    },
    {
      name: 'Kabir Sheikh',
      email: 'kabir.sheikh@freshcart.local',
      phone: '8811100004',
      words: ['Milk', 'Bread'],
      count: 1,
      day: 5,
      hour: 21,
    },
    {
      name: 'Meera Iyer',
      email: 'meera.iyer@freshcart.local',
      phone: '8811100005',
      words: ['Rice', 'Atta', 'Oil', 'Detergent'],
      count: 6,
      day: 6,
      hour: 11,
    },
  ];

  for (const persona of personas) {
    const { rows: [user] } = await client.query(
      `INSERT INTO users (phone, email, password_hash, name)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (phone) DO UPDATE
       SET email = EXCLUDED.email,
           password_hash = EXCLUDED.password_hash,
           name = EXCLUDED.name
       RETURNING id`,
      [persona.phone, persona.email, passwordHash, persona.name]
    );

    await client.query(
      `INSERT INTO addresses (user_id, label, lat, lng, full_address, is_default)
       SELECT $1, 'Home', 12.9352, 77.6140, $2, true
       WHERE NOT EXISTS (
         SELECT 1 FROM addresses WHERE user_id = $1 AND label = 'Home'
       )`,
      [user.id, `${persona.name} Demo Address, Bangalore`]
    );

    const { rows: [{ order_count: orderCount }] } = await client.query(
      'SELECT COUNT(*)::int AS order_count FROM orders WHERE user_id = $1',
      [user.id]
    );
    if (orderCount > 0) continue;

    const picks = pickProducts(products, persona.words, 4);
    for (let i = 0; i < persona.count; i++) {
      const rotated = picks.length
        ? picks.slice(i % picks.length).concat(picks.slice(0, i % picks.length)).slice(0, Math.min(4, picks.length))
        : products.slice(i, i + 3);
      await seedPramarshaOrder(client, user.id, rotated, orderTimestamp(i, persona.day, persona.hour));
    }
  }
}

async function ensureCatalogCompatibility(client) {
  await client.query(`
    UPDATE products
    SET pack_size_value = NULLIF(substring(unit FROM '([0-9]+(?:\\.[0-9]+)?)'), '')::numeric
    WHERE pack_size_value IS NULL
  `).catch(() => {});

  await client.query(`
    UPDATE products
    SET search_vector = to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(unit, ''))
    WHERE search_vector IS NULL
  `).catch(() => {});
}

async function bustCatalogCache() {
  if (!process.env.REDIS_URL) return;
  try {
    const Redis = (await import('ioredis')).default;
    const redis = new Redis(process.env.REDIS_URL);
    const keys = await redis.keys('catalog:*');
    if (keys.length) await redis.del(keys);
    await redis.quit();
  } catch {
    // Cache busting is best effort during seed.
  }
}

async function refreshProductScores(client) {
  await client.query(`
    UPDATE reviews
    SET sentiment_score = CASE
      WHEN rating >= 5 THEN 0.85
      WHEN rating = 4 THEN 0.45
      WHEN rating = 3 THEN 0.05
      WHEN rating = 2 THEN -0.35
      ELSE -0.75
    END
    WHERE sentiment_score IS NULL OR sentiment_score = 0
  `);

  const { rowCount } = await client.query(`
    INSERT INTO product_scores (product_id, weighted_rating, sentiment_avg, sales_velocity, final_score)
    WITH catalog_mean AS (
      SELECT COALESCE(AVG(rating), 4.0) AS c FROM reviews
    ),
    product_stats AS (
      SELECT
        p.id AS product_id,
        COUNT(r.id)::numeric AS v,
        COALESCE(AVG(r.rating), (SELECT c FROM catalog_mean)) AS r_avg,
        COALESCE(AVG(r.sentiment_score), 0.35) AS sentiment_avg,
        COALESCE(SUM(CASE WHEN o.created_at >= NOW() - INTERVAL '30 days' THEN oi.qty ELSE 0 END), 0)::numeric AS sales_velocity
      FROM products p
      LEFT JOIN reviews r ON r.product_id = p.id
      LEFT JOIN order_items oi ON oi.product_id = p.id
      LEFT JOIN orders o ON o.id = oi.order_id
      GROUP BY p.id
    ),
    scored AS (
      SELECT
        product_id,
        (((v / (v + 10.0)) * r_avg) + ((10.0 / (v + 10.0)) * (SELECT c FROM catalog_mean))) AS weighted_rating,
        sentiment_avg,
        sales_velocity
      FROM product_stats
    ),
    maxes AS (
      SELECT GREATEST(MAX(sales_velocity), 1) AS max_velocity FROM scored
    )
    SELECT
      product_id,
      weighted_rating::numeric(5,4),
      sentiment_avg::numeric(5,4),
      sales_velocity::numeric(10,4),
      (
        0.5 * (weighted_rating / 5.0)
        + 0.3 * ((sentiment_avg + 1.0) / 2.0)
        + 0.2 * (sales_velocity / (SELECT max_velocity FROM maxes))
      )::numeric(6,4)
    FROM scored
    ON CONFLICT (product_id) DO UPDATE
    SET weighted_rating = EXCLUDED.weighted_rating,
        sentiment_avg = EXCLUDED.sentiment_avg,
        sales_velocity = EXCLUDED.sales_velocity,
        final_score = EXCLUDED.final_score,
        updated_at = NOW()
  `);

  return rowCount;
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
