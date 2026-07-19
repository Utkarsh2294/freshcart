import pg from 'pg';
import bcrypt from 'bcryptjs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { generateSyntheticProducts } from './generateSyntheticProducts.js';
import { generateSyntheticReviews } from './generateSyntheticReviews.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://freshcart:freshcart_pass@localhost:5432/freshcart';

// ── Category data ────────────────────────────────────────
const CATEGORIES = [
  { name: 'Fruits & Vegetables', icon_url: '/icons/fruits.svg', children: [
    { name: 'Fresh Fruits' }, { name: 'Fresh Vegetables' }, { name: 'Herbs & Seasonings' },
  ]},
  { name: 'Dairy & Eggs', icon_url: '/icons/dairy.svg', children: [
    { name: 'Milk' }, { name: 'Curd & Yogurt' }, { name: 'Cheese' }, { name: 'Eggs' }, { name: 'Butter & Cream' },
  ]},
  { name: 'Snacks & Branded Foods', icon_url: '/icons/snacks.svg', children: [
    { name: 'Chips & Crisps' }, { name: 'Biscuits & Cookies' }, { name: 'Namkeen & Mixtures' }, { name: 'Chocolates' }, { name: 'Instant Noodles' },
  ]},
  { name: 'Beverages', icon_url: '/icons/beverages.svg', children: [
    { name: 'Soft Drinks' }, { name: 'Juices' }, { name: 'Tea & Coffee' }, { name: 'Water' }, { name: 'Energy Drinks' },
  ]},
  { name: 'Staples', icon_url: '/icons/staples.svg', children: [
    { name: 'Rice' }, { name: 'Atta & Flours' }, { name: 'Dals & Pulses' }, { name: 'Oils' }, { name: 'Sugar & Salt' },
  ]},
  { name: 'Personal Care', icon_url: '/icons/personal.svg', children: [
    { name: 'Shampoo' }, { name: 'Soaps & Body Wash' }, { name: 'Toothpaste' }, { name: 'Skin Care' },
  ]},
  { name: 'Home Care', icon_url: '/icons/home.svg', children: [
    { name: 'Detergents' }, { name: 'Dishwash' }, { name: 'Floor Cleaners' },
  ]},
];

// ── Brand data ───────────────────────────────────────────
const BRANDS = [
  'Amul', 'Mother Dairy', 'Nestle', 'Britannia', 'Parle', 'ITC', 'Haldiram\'s',
  'Lays', 'Kurkure', 'Cadbury', 'Maggi', 'Tata', 'Aashirvaad', 'Fortune',
  'Saffola', 'Tropicana', 'Real', 'Coca-Cola', 'Pepsi', 'Red Bull',
  'Dettol', 'Dove', 'Colgate', 'Surf Excel', 'Vim', 'Harpic',
  'Fresho', 'BB Royal', 'Organic Tattva', 'Paper Boat',
];

// ── Real products from Section 6 of blueprint ────────────
const REAL_PRODUCTS = [
  // Fruits & Vegetables
  { name: 'Banana', category: 'Fresh Fruits', brand: 'Fresho', price: 40, unit: '1 kg' },
  { name: 'Apple Red', category: 'Fresh Fruits', brand: 'Fresho', price: 180, unit: '1 kg' },
  { name: 'Onion', category: 'Fresh Vegetables', brand: 'Fresho', price: 35, unit: '1 kg' },
  { name: 'Tomato', category: 'Fresh Vegetables', brand: 'Fresho', price: 28, unit: '1 kg' },
  { name: 'Potato', category: 'Fresh Vegetables', brand: 'Fresho', price: 32, unit: '1 kg' },
  { name: 'Green Chilli', category: 'Herbs & Seasonings', brand: 'Fresho', price: 15, unit: '100 g' },
  { name: 'Coriander Leaves', category: 'Herbs & Seasonings', brand: 'Fresho', price: 12, unit: '100 g' },
  { name: 'Fresh Paneer', category: 'Cheese', brand: 'Mother Dairy', price: 90, unit: '200 g' },
  { name: 'Tomato Puree', category: 'Fresh Vegetables', brand: 'Fresho', price: 45, unit: '200 ml' },
  // Dairy & Eggs
  { name: 'Amul Taaza Toned Milk', category: 'Milk', brand: 'Amul', price: 24, unit: '500 ml' },
  { name: 'Amul Gold Full Cream Milk', category: 'Milk', brand: 'Amul', price: 32, unit: '500 ml' },
  { name: 'Mother Dairy Cow Milk', category: 'Milk', brand: 'Mother Dairy', price: 28, unit: '500 ml' },
  { name: 'Amul Masti Dahi', category: 'Curd & Yogurt', brand: 'Amul', price: 30, unit: '400 g' },
  { name: 'Amul Cheese Slices', category: 'Cheese', brand: 'Amul', price: 120, unit: '200 g' },
  { name: 'Fresho Farm Eggs', category: 'Eggs', brand: 'Fresho', price: 72, unit: '6 pcs' },
  { name: 'Amul Butter', category: 'Butter & Cream', brand: 'Amul', price: 56, unit: '100 g' },
  { name: 'Amul Fresh Cream', category: 'Butter & Cream', brand: 'Amul', price: 75, unit: '250 ml' },
  // Snacks & Branded
  { name: 'Lays Classic Salted', category: 'Chips & Crisps', brand: 'Lays', price: 20, unit: '52 g' },
  { name: 'Kurkure Masala Munch', category: 'Chips & Crisps', brand: 'Kurkure', price: 20, unit: '80 g' },
  { name: 'Britannia Good Day', category: 'Biscuits & Cookies', brand: 'Britannia', price: 30, unit: '200 g' },
  { name: 'Parle-G', category: 'Biscuits & Cookies', brand: 'Parle', price: 10, unit: '80 g' },
  { name: 'Haldiram\'s Aloo Bhujia', category: 'Namkeen & Mixtures', brand: 'Haldiram\'s', price: 85, unit: '200 g' },
  { name: 'Cadbury Dairy Milk', category: 'Chocolates', brand: 'Cadbury', price: 40, unit: '50 g' },
  { name: 'Cadbury 5 Star', category: 'Chocolates', brand: 'Cadbury', price: 20, unit: '40 g' },
  { name: 'Maggi 2-Minute Noodles', category: 'Instant Noodles', brand: 'Maggi', price: 14, unit: '70 g' },
  // Beverages
  { name: 'Coca-Cola', category: 'Soft Drinks', brand: 'Coca-Cola', price: 40, unit: '750 ml' },
  { name: 'Pepsi', category: 'Soft Drinks', brand: 'Pepsi', price: 40, unit: '750 ml' },
  { name: 'Tropicana Orange Juice', category: 'Juices', brand: 'Tropicana', price: 90, unit: '1 L' },
  { name: 'Real Mixed Fruit Juice', category: 'Juices', brand: 'Real', price: 99, unit: '1 L' },
  { name: 'Paper Boat Aam Panna', category: 'Juices', brand: 'Paper Boat', price: 30, unit: '200 ml' },
  { name: 'Tata Tea Gold', category: 'Tea & Coffee', brand: 'Tata', price: 160, unit: '250 g' },
  { name: 'Nestle Nescafe Classic', category: 'Tea & Coffee', brand: 'Nestle', price: 195, unit: '100 g' },
  { name: 'Red Bull Energy Drink', category: 'Energy Drinks', brand: 'Red Bull', price: 115, unit: '250 ml' },
  // Staples
  { name: 'Aashirvaad Atta', category: 'Atta & Flours', brand: 'Aashirvaad', price: 249, unit: '5 kg' },
  { name: 'Fortune Chakki Fresh Atta', category: 'Atta & Flours', brand: 'Fortune', price: 235, unit: '5 kg' },
  { name: 'India Gate Basmati Rice', category: 'Rice', brand: 'BB Royal', price: 399, unit: '5 kg' },
  { name: 'Tata Sampann Toor Dal', category: 'Dals & Pulses', brand: 'Tata', price: 145, unit: '1 kg' },
  { name: 'Fortune Sunflower Oil', category: 'Oils', brand: 'Fortune', price: 160, unit: '1 L' },
  { name: 'Saffola Gold Oil', category: 'Oils', brand: 'Saffola', price: 185, unit: '1 L' },
  { name: 'Tata Salt', category: 'Sugar & Salt', brand: 'Tata', price: 24, unit: '1 kg' },
  { name: 'Everest Garam Masala', category: 'Sugar & Salt', brand: 'Tata', price: 95, unit: '100 g' },
  { name: 'Organic Tattva Brown Sugar', category: 'Sugar & Salt', brand: 'Organic Tattva', price: 65, unit: '500 g' },
  // Personal Care
  { name: 'Dove Shampoo', category: 'Shampoo', brand: 'Dove', price: 210, unit: '340 ml' },
  { name: 'Dettol Soap', category: 'Soaps & Body Wash', brand: 'Dettol', price: 42, unit: '75 g' },
  { name: 'Colgate MaxFresh', category: 'Toothpaste', brand: 'Colgate', price: 95, unit: '150 g' },
  { name: 'Dove Body Lotion', category: 'Skin Care', brand: 'Dove', price: 245, unit: '250 ml' },
  // Home Care
  { name: 'Surf Excel Matic', category: 'Detergents', brand: 'Surf Excel', price: 299, unit: '2 kg' },
  { name: 'Vim Dishwash Gel', category: 'Dishwash', brand: 'Vim', price: 99, unit: '500 ml' },
  { name: 'Harpic Power Plus', category: 'Floor Cleaners', brand: 'Harpic', price: 85, unit: '500 ml' },
];

// ── Dark Stores (Bangalore) ─────────────────────────────
const DARK_STORES = [
  { name: 'Freshcart Koramangala Hub', lat: 12.9352, lng: 77.6245, service_radius_km: 5 },
  { name: 'Freshcart Indiranagar Hub', lat: 12.9784, lng: 77.6408, service_radius_km: 5 },
  { name: 'Freshcart HSR Layout Hub', lat: 12.9121, lng: 77.6446, service_radius_km: 5 },
];

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

    for (const p of REAL_PRODUCTS) {
      const categoryId = categoryMap[p.category];
      const brandId = brandMap[p.brand];
      if (!categoryId || !brandId) {
        console.warn(`   ⚠️  Skipping ${p.name}: category="${p.category}" or brand="${p.brand}" not found`);
        continue;
      }
      const mrp = Math.round(p.price * (1.1 + Math.random() * 0.4) * 100) / 100;
      await client.query(
        `INSERT INTO products (name, category_id, brand_id, price, mrp, unit, stock_qty)
         SELECT $1::text, $2, $3, $4, $5, $6, $7
         WHERE NOT EXISTS (
           SELECT 1 FROM products WHERE LOWER(name) = LOWER($1::text)
         )`,
        [p.name, categoryId, brandId, p.price, mrp, p.unit, Math.floor(Math.random() * 200) + 50]
      );
      productCount++;
    }
    console.log(`   ✅ ${productCount} real products\n`);

    // ── Seed Synthetic Products ──────────────
    console.log('🧪 Generating synthetic products...');
    const syntheticProducts = generateSyntheticProducts(categoryMap, brandMap);
    for (const p of syntheticProducts) {
      await client.query(
        `INSERT INTO products (name, category_id, brand_id, price, mrp, unit, stock_qty)
         SELECT $1::text, $2, $3, $4, $5, $6, $7
         WHERE NOT EXISTS (
           SELECT 1 FROM products WHERE LOWER(name) = LOWER($1::text)
         )`,
        [p.name, p.category_id, p.brand_id, p.price, p.mrp, p.unit, Math.floor(Math.random() * 200) + 20]
      );
    }
    console.log(`   ✅ ${syntheticProducts.length} synthetic products\n`);

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

    // ── Final Count ──────────────────────────
    const { rows: [{ count }] } = await client.query('SELECT COUNT(*) FROM products');
    console.log(`\n🎉 Seed complete! Total products: ${count}`);

  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
