/**
 * Generate synthetic products to pad the catalog across all 20 categories.
 * Produces realistic variants of existing brands with plausible pack sizes.
 * Aligned with the Indian Quick-Commerce Master Catalog (20 categories).
 */

const VARIANTS = {
  // ── 1. Dairy, Bread & Eggs ─────────────────────────────────────────────────
  'Milk': [
    { names: ['Amul Taaza 1L', 'Mother Dairy Full Cream 1L', 'Nestlé a+ Toned Milk 1L', 'Amul Lactose Free Milk', 'Nandini Toned Milk'], brand: 'Amul', units: ['1 L', '500 ml', '200 ml'] },
  ],
  'Curd & Yogurt': [
    { names: ['Nestlé a+ Probiotic Dahi', 'Mother Dairy Mishti Doi', 'Epigamia Greek Yogurt Mango', 'Epigamia Greek Yogurt Blueberry', 'Gowardhan Dahi'], brand: 'Mother Dairy', units: ['400 g', '200 g', '1 kg'] },
  ],
  'Paneer & Cheese': [
    { names: ['Amul Processed Cheese Block', 'Britannia Cheese Cubes', 'Go Cheese Spread Classic', 'Amul Mozzarella Block', 'Milky Mist Cottage Cheese'], brand: 'Amul', units: ['200 g', '500 g'] },
  ],
  'Butter & Ghee': [
    { names: ['Amul Butter 500g', 'Britannia Butter', 'Patanjali Cow Ghee 1L', 'Gowardhan Ghee', '24 Mantra Organic Ghee'], brand: 'Amul', units: ['100 g', '500 g'] },
  ],
  'Bread': [
    { names: ['Britannia Whole Wheat Bread', 'English Oven Multigrain', 'Modern Healthy Start Multigrain', 'Bonn Whole Wheat'], brand: 'Britannia', units: ['400 g', '200 g'] },
  ],
  'Ice Cream': [
    { names: ['Amul Chocolate Ice Cream', 'Amul Strawberry Ice Cream', "Kwality Wall's Feast Choco Bar", 'Vadilal Kesar Badam Ice Cream', 'Havmor Mango Ice Cream'], brand: 'Amul', units: ['500 ml', '1 L'] },
  ],

  // ── 2. Fruits & Vegetables ─────────────────────────────────────────────────
  'Fresh Fruits': [
    { names: ['Grapes Green', 'Grapes Black', 'Orange Nagpur', 'Pomegranate', 'Guava', 'Pineapple', 'Kiwi', 'Strawberry', 'Sapota Chiku', 'Sweet Lime Mosambi', 'Custard Apple', 'Lychee'], brand: 'Fresho', units: ['1 kg', '500 g', '250 g'] },
  ],
  'Fresh Vegetables': [
    { names: ['Capsicum Red', 'Capsicum Yellow', 'Brinjal', 'Lady Finger Bhindi', 'Cauliflower', 'Cabbage', 'Carrot', 'Beetroot', 'Radish', 'Mushroom Button', 'Sweet Corn', 'Peas Green', 'Cucumber', 'Bottle Gourd Lauki', 'Ridge Gourd', 'Bitter Gourd'], brand: 'Fresho', units: ['500 g', '1 kg', '250 g'] },
  ],
  'Leafy Greens': [
    { names: ['Methi Leaves', 'Amaranth Leaves Chaulai', 'Curry Leaves', 'Mint Leaves Pudina'], brand: 'Fresho', units: ['100 g', '250 g'] },
  ],
  'Exotic Vegetables': [
    { names: ['Baby Corn', 'Cherry Tomato', 'Iceberg Lettuce', 'Celery', 'Asparagus'], brand: 'Fresho', units: ['200 g', '500 g'] },
  ],

  // ── 3. Staples ─────────────────────────────────────────────────────────────
  'Atta & Flours': [
    { names: ['Aashirvaad Multigrain Atta 10kg', 'Pillsbury Chakki Fresh 10kg', 'Patanjali Maida 1kg', 'Fortune Besan 1kg', '24 Mantra Organic Atta'], brand: 'Aashirvaad', units: ['1 kg', '5 kg', '10 kg'] },
  ],
  'Rice': [
    { names: ['Daawat Basmati Rice Extra Long', 'Kohinoor Rozana Basmati', 'Fortune Extra Long Basmati', 'Lal Qilla Premium Basmati', 'Amira Basmati Rice', 'India Gate Classic Basmati'], brand: 'India Gate', units: ['1 kg', '5 kg', '10 kg'] },
  ],
  'Dals & Pulses': [
    { names: ['Tata Sampann Masoor Dal', 'Tata Sampann Rajma Red', 'Fortune Moong Dal Yellow', '24 Mantra Organic Toor Dal', 'Organic Tattva Urad Dal'], brand: 'Tata Sampann', units: ['500 g', '1 kg'] },
  ],
  'Oils': [
    { names: ['Saffola Active Oil', 'Fortune Rice Bran Oil', 'Sundrop Heart Oil', 'Gemini Refined Sunflower Oil', 'Patanjali Groundnut Oil'], brand: 'Fortune', units: ['1 L', '2 L', '5 L'] },
  ],
  'Sooji & Poha': [
    { names: ['Aashirvaad Sooji Coarse', 'Fortune Bansi Poha Thick', 'Bansi Thin Poha', 'Fortune Maida'], brand: 'Aashirvaad', units: ['500 g', '1 kg'] },
  ],

  // ── 4. Masala & Spices ─────────────────────────────────────────────────────
  'Turmeric & Chilli': [
    { names: ['Tata Sampann Turmeric Powder', 'Badshah Haldi Powder', 'Aachi Chilli Powder', 'Everest Red Chilli Powder', 'MDH Kashmiri Chilli Powder'], brand: 'MDH', units: ['100 g', '200 g', '500 g'] },
  ],
  'Masala Blends': [
    { names: ['MDH Chaat Masala', 'Everest Kitchen King Masala', 'Badshah Garam Masala', 'Catch Garam Masala', 'Aachi Rasam Powder'], brand: 'MDH', units: ['50 g', '100 g', '200 g'] },
  ],
  'Ready Mix Masala': [
    { names: ['MDH Rajma Masala', 'Everest Sambar Masala', 'Badshah Butter Chicken Masala', 'Catch Paneer Masala', 'MDH Dal Makhani Masala'], brand: 'MDH', units: ['50 g', '100 g'] },
  ],

  // ── 5. Breakfast & Spreads ─────────────────────────────────────────────────
  'Jams & Spreads': [
    { names: ["Kissan's Pineapple Jam", 'Kissan Strawberry Jam', "Hershey's Chocolate Spread", "Mala's Mixed Fruit Jam"], brand: 'Kissan', units: ['200 g', '500 g'] },
  ],
  'Cereals & Oats': [
    { names: ["Kellogg's Muesli Nut Delight", "Bagrry's Fruit & Nut Muesli", 'Saffola Masala Oats Veggie Twist', 'Quaker Masala Oats'], brand: "Kellogg's", units: ['250 g', '500 g', '1 kg'] },
  ],

  // ── 6. Snacks & Namkeen ────────────────────────────────────────────────────
  'Chips & Crisps': [
    { names: ["Lay's American Style Cream & Onion", "Lay's Spanish Tomato Tango", 'Bingo Tedhe Medhe', 'Uncle Chipps Spicy Treat', 'Balaji Green Chilli Chips', 'Pringles Original', 'Pringles Sour Cream'], brand: "Lay's", units: ['30 g', '52 g', '90 g', '175 g'] },
  ],
  'Namkeen & Mixtures': [
    { names: ["Haldiram's Mast Masala Mix", "Haldiram's Peanuts Salted", 'Bikaji Khatta Meetha Mix', 'Bikano Chaat Chaska', 'Balaji Farali Chevdo', 'Aliva Multigrain Crackers'], brand: "Haldiram's", units: ['150 g', '200 g', '400 g'] },
  ],
  'Instant Noodles': [
    { names: ['Maggi Masala Noodles 4-pack', 'Yippee Power Up Masala', "Ching's Desi Chinese Schezwan", 'Top Ramen Curry Noodles', 'Patanjali Atta Noodles'], brand: 'Maggi', units: ['70 g', '280 g'] },
  ],

  // ── 7. Biscuits & Bakery ────────────────────────────────────────────────────
  'Glucose & Marie Biscuits': [
    { names: ['Parle-G Gold Biscuits', 'Britannia Tiger Glucose', 'Sunfeast Glucose Biscuits', 'Priyagold Classic Cream'], brand: 'Parle', units: ['100 g', '200 g', '250 g'] },
  ],
  'Cream Biscuits & Cookies': [
    { names: ['Oreo Double Stuf', 'McVities Hobnobs', 'Parle Hide & Seek Bourbon', 'Sunfeast Yumfills Choco', 'ITC Dark Fantasy Choco Fills', 'Britannia Nutrichoice Digestive'], brand: 'Britannia', units: ['100 g', '150 g', '200 g', '300 g'] },
  ],

  // ── 8. Tea, Coffee & Health Drinks ─────────────────────────────────────────
  'Tea': [
    { names: ['Tata Tea Agni', 'Society Masala Tea', 'Girnar Kadak Masala Tea', 'Taj Mahal Premium Tea', 'Wagh Bakri Masala Chai'], brand: 'Tata Tea', units: ['250 g', '500 g', '1 kg'] },
  ],
  'Coffee': [
    { names: ['Nescafé Gold Blend', 'Bru Gold Instant Coffee', 'Continental Premium Instant Coffee', 'Blue Tokai Vienna Blend', 'Davidoff Café Crème'], brand: 'Nescafé', units: ['50 g', '100 g', '200 g'] },
  ],
  'Malt & Health Drinks': [
    { names: ['Horlicks Junior Chocolate', 'Bournvita Little Champs', 'Boost Chocolate Malt Drink 1kg', 'Complan Nutrigro Badam Kheer'], brand: 'Horlicks', units: ['200 g', '500 g', '1 kg'] },
  ],

  // ── 9. Cold Drinks, Juices & Water ─────────────────────────────────────────
  'Soft Drinks': [
    { names: ['Coca-Cola 2L', 'Pepsi 2L', 'Mountain Dew', '7UP Lemon Lime', 'Thums Up 1.25L', 'Maaza Mango Drink', 'Frooti Fresh N Juicy'], brand: 'Coca-Cola', units: ['250 ml', '750 ml', '1.25 L', '2 L'] },
  ],
  'Fruit Juices': [
    { names: ['Tropicana Mango Juice', 'Tropicana Apple Juice', 'Real Grape Juice', 'Paper Boat Jaljeera', 'Paper Boat Rose Sharbat', 'Minute Maid Pulpy Orange', 'B Natural Pomegranate Juice'], brand: 'Tropicana', units: ['200 ml', '1 L'] },
  ],
  'Packaged Water': [
    { names: ['Bisleri 500ml Pack of 6', 'Kinley 500ml', 'Aquafina 500ml', 'Himalayan Natural Mineral Water'], brand: 'Bisleri', units: ['500 ml', '1 L', '2 L'] },
  ],

  // ── 10. Chocolates & Dry Fruits ────────────────────────────────────────────
  'Chocolates': [
    { names: ['Cadbury Gems', 'Cadbury Perk', 'Cadbury Munch', 'Amul Dark Chocolate 55%', 'Amul Fruit & Nut Chocolate', 'Nestlé Milkybar', 'Snickers Bar'], brand: 'Cadbury', units: ['13 g', '40 g', '55 g', '150 g'] },
  ],
  'Dry Fruits': [
    { names: ['Nutraj Mixed Nuts', 'Happilo Almonds California 250g', 'Farmley Pistachios', 'Tulsi Raisins Green', 'Borges Walnuts', 'Happilo Medjool Dates'], brand: 'Happilo', units: ['100 g', '250 g', '500 g'] },
  ],

  // ── 11. Bath & Body ────────────────────────────────────────────────────────
  'Bath Soap': [
    { names: ['Cinthol Classic Soap', 'Dove Intense Moisture Soap', 'Nivea Creme Soft Soap', 'Lux Strawberry & Cream Soap', 'Pears Oil Clear Soap', 'Palmolive Naturals Almond Soap'], brand: 'Dove', units: ['75 g', '100 g', '125 g'] },
  ],
  'Body Wash': [
    { names: ['Dove Men+Care Body Wash', 'Lux Soft Rose Body Wash', 'Nivea Oil Nutrimix Body Wash', 'Palmolive Luminous Oils Body Wash'], brand: 'Dove', units: ['200 ml', '250 ml', '500 ml'] },
  ],

  // ── 12. Oral Care ──────────────────────────────────────────────────────────
  'Toothpaste': [
    { names: ['Colgate Sensitive Toothpaste', 'Sensodyne Rapid Relief', 'Close-Up Deep Action Red Hot', 'Pepsodent 2in1 Gum Care', 'Patanjali Dant Kanti Advanced'], brand: 'Colgate', units: ['50 g', '100 g', '150 g', '200 g'] },
  ],

  // ── 13. Hair & Skin Care ───────────────────────────────────────────────────
  'Shampoo': [
    { names: ['TRESemmé Keratin Smooth Shampoo', 'Sunsilk Strong & Long Shampoo', 'Head & Shoulders Anti-Dandruff', 'Pantene Pro-V Long & Strong', 'Dove Dryness Care Shampoo'], brand: 'Dove', units: ['90 ml', '180 ml', '340 ml', '650 ml'] },
  ],
  'Face Wash': [
    { names: ['Clean & Clear Foaming Face Wash', 'Garnier Men Oil Control Face Wash', 'Himalaya Purifying Neem Face Wash', "Pond's Men Energy Charge Face Wash", 'Nivea Men Deep Clean Face Wash'], brand: 'Himalaya', units: ['50 g', '100 g', '150 g'] },
  ],
  'Body Lotion': [
    { names: ['Nivea Total Body Lotion', 'Parachute Advansed Jasmine Body Lotion', "Pond's Flawless Radiance", 'Vaseline Cocoa Radiant Body Lotion', 'Himalaya Cocoa Butter Lotion'], brand: 'Nivea', units: ['100 ml', '200 ml', '400 ml'] },
  ],

  // ── 14. Feminine Hygiene ───────────────────────────────────────────────────
  'Sanitary Pads': [
    { names: ['Nua Ultra Nights', 'Stayfree Advanced Ultra Thin', 'Sofy Extra Large Wings', 'Carefree Sportz Liners', 'Nua Ultra Thin Pads'], brand: 'Nua', units: ['6 pcs', '15 pcs', '30 pcs'] },
  ],

  // ── 15. Baby Care ──────────────────────────────────────────────────────────
  'Diapers': [
    { names: ['Pampers Baby Dry L', 'Pampers Pants XL', 'Huggies Wonder Pants L', 'MamyPoko Extra Absorb L', 'Supples Baby Pants L', 'Sirona Premium Diapers L'], brand: 'Pampers', units: ['28 pcs', '44 pcs', '56 pcs'] },
  ],
  'Baby Food & Formula': [
    { names: ['Cerelac Wheat Apple Banana', 'Cerelac Rice Wheat 800g', 'NAN Pro 1 Infant Formula', 'Similac Advance 400g'], brand: 'Cerelac', units: ['400 g', '800 g'] },
  ],
  'Baby Toiletries': [
    { names: ["Johnson's Baby Wash", 'Himalaya Baby Soap', "Johnson's Baby Lotion", 'Sebamed Baby Body Lotion', 'Himalaya Baby Oil'], brand: "Johnson's", units: ['100 ml', '200 ml'] },
  ],

  // ── 16. Laundry ────────────────────────────────────────────────────────────
  'Detergents': [
    { names: ['Surf Excel Quick Wash 4kg', 'Ariel Matic Front Load 4kg', 'Tide Plus Detergent 4kg', 'Wheel Active 4kg', 'Rin Bar Detergent', 'Ghadi Wheel Detergent Powder'], brand: 'Surf Excel', units: ['500 g', '1 kg', '2 kg', '4 kg'] },
  ],
  'Fabric Softener': [
    { names: ['Comfort Morning Fresh', 'Comfort Sunrise Fabric Softener', 'Surf Excel Fabric Conditioner'], brand: 'Comfort', units: ['200 ml', '500 ml', '1 L'] },
  ],

  // ── 17. Home Cleaning ─────────────────────────────────────────────────────
  'Dishwash': [
    { names: ['Vim Anti-Bacterial Bar', 'Pril Ultra Grease-Cut Dish Liquid', 'Exo Dish Shine Bar', 'Vim Dishwash Gel 750ml'], brand: 'Vim', units: ['200 g', '500 ml', '750 ml'] },
  ],
  'Toilet Cleaners': [
    { names: ['Harpic Active 6 500ml', 'Domex Ultra Thick Bleach', 'Sanifresh Shine'], brand: 'Harpic', units: ['500 ml', '1 L'] },
  ],
  'Floor Cleaners': [
    { names: ['Lizol Pine Fresh', 'Lizol Lavender', 'Domex Multipurpose Cleaner', 'Colin Bathroom Cleaner'], brand: 'Lizol', units: ['500 ml', '1 L', '2 L'] },
  ],

  // ── 18. Kitchen Supplies ───────────────────────────────────────────────────
  'Tissue Paper': [
    { names: ['Origami Toilet Roll 6 pack', 'Premier Kitchen Towel', 'Origami All Purpose Wipes'], brand: 'Origami', units: ['100 pulls', '200 pulls'] },
  ],

  // ── 19. Pet Care ───────────────────────────────────────────────────────────
  'Dog Food': [
    { names: ['Pedigree Adult Dog Food Mutton & Rice', 'Pedigree Junior Dog Food', 'Drools Focus Adult Salmon Dog Food', 'Royal Canin Mini Adult Dog Food', 'Purepet Real Chicken & Rice'], brand: 'Pedigree', units: ['1.2 kg', '3 kg', '6 kg'] },
  ],
  'Cat Food': [
    { names: ['Whiskas Junior Kitten Food', 'Whiskas Tuna in Jelly Pouch', 'Purepet Cat Food Tuna', 'Royal Canin Kitten Food'], brand: 'Whiskas', units: ['500 g', '1.2 kg', '3 kg'] },
  ],

  // ── 20. Pooja & Festive ────────────────────────────────────────────────────
  'Agarbatti & Dhoop': [
    { names: ['Cycle Sandalwood Agarbatti', 'Mangaldeep Chandan', 'Hem Sandal Incense', 'Zed Black Mogra Agarbatti', 'Cycle Loban Dhoop Sticks'], brand: 'Cycle', units: ['20 sticks', '100 sticks', '200 sticks'] },
  ],
  'Camphor & Wicks': [
    { names: ['Cycle Camphor Tablets 100g', 'Patanjali Kapoor Tablets', 'Local Cotton Wicks Pack'], brand: 'Cycle', units: ['25 g', '50 g', '100 g'] },
  ],
};

const PRICE_RANGES = {
  // Dairy, Bread & Eggs
  'Milk': [18, 75], 'Curd & Yogurt': [22, 100], 'Paneer & Cheese': [60, 300],
  'Butter & Ghee': [45, 600], 'Cream': [35, 120], 'Buttermilk & Flavoured Milk': [15, 60],
  'Bread': [30, 75], 'Eggs': [55, 200], 'Ice Cream': [30, 350],
  // Fruits & Vegetables
  'Fresh Fruits': [30, 350], 'Fresh Vegetables': [12, 120],
  'Leafy Greens': [10, 50], 'Exotic Vegetables': [35, 150], 'Herbs & Seasonings': [8, 45],
  // Staples
  'Atta & Flours': [40, 600], 'Rice': [60, 900], 'Dals & Pulses': [50, 280],
  'Oils': [100, 700], 'Sugar & Salt': [20, 80], 'Sooji & Poha': [30, 90],
  // Masala & Spices
  'Turmeric & Chilli': [40, 180], 'Coriander & Cumin': [35, 120],
  'Whole Spices': [30, 150], 'Masala Blends': [45, 200], 'Ready Mix Masala': [40, 160],
  // Breakfast & Spreads
  'Jams & Spreads': [90, 400], 'Peanut Butter & Honey': [150, 600],
  'Ketchup & Sauces': [60, 250], 'Cereals & Oats': [100, 600],
  // Snacks & Namkeen
  'Chips & Crisps': [10, 100], 'Namkeen & Mixtures': [50, 500],
  'Popcorn': [30, 150], 'Instant Noodles': [12, 80],
  // Biscuits & Bakery
  'Glucose & Marie Biscuits': [10, 60], 'Cream Biscuits & Cookies': [25, 200],
  // Tea, Coffee & Health Drinks
  'Tea': [80, 600], 'Coffee': [100, 800], 'Malt & Health Drinks': [200, 900],
  // Drinks
  'Soft Drinks': [20, 120], 'Fruit Juices': [25, 200],
  'Packaged Water': [10, 40], 'Energy Drinks': [90, 200],
  // Chocolates & Dry Fruits
  'Chocolates': [10, 400], 'Dry Fruits': [80, 800],
  // Personal Care
  'Bath Soap': [25, 120], 'Body Wash': [100, 500],
  'Toothpaste': [40, 250], 'Toothbrush': [40, 200],
  'Hair Oil': [80, 400], 'Shampoo': [80, 600],
  'Face Wash': [60, 300], 'Body Lotion': [100, 500], 'Skin Care': [80, 500],
  // Feminine Hygiene
  'Sanitary Pads': [80, 300],
  // Baby Care
  'Diapers': [200, 900], 'Baby Food & Formula': [200, 700], 'Baby Toiletries': [80, 400],
  // Laundry
  'Detergents': [50, 700], 'Fabric Softener': [80, 400],
  // Home Cleaning
  'Dishwash': [30, 250], 'Floor Cleaners': [80, 400],
  'Toilet Cleaners': [60, 250], 'Surface & Glass Cleaners': [60, 200],
  // Kitchen Supplies
  'Foils & Wraps': [60, 250], 'Garbage Bags': [50, 200], 'Tissue Paper': [40, 200],
  // Pet Care
  'Dog Food': [150, 2500], 'Cat Food': [150, 2000],
  // Pooja & Festive
  'Agarbatti & Dhoop': [30, 200], 'Camphor & Wicks': [25, 120],
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
        for (const unit of group.units) {
          const price = Math.max(5, Math.round(randomPrice(minP, maxP) * 100) / 100);
          const mrp = Math.round(price * (1.08 + Math.random() * 0.25) * 100) / 100;
          products.push({
            name: `${name} ${unit}`,
            category_id: categoryId,
            brand_id: brandId,
            price,
            mrp,
            unit,
          });
        }
      }
    }
  }

  return products;
}
