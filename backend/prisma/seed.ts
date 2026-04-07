import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { expand } from 'dotenv-expand';
import { hash } from 'bcryptjs';

const env = dotenv.config();
expand(env);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  // 1. CLEAN existing data
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.product.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  console.log('🗑️  Cleared existing data');

  const commonPassword = await hash('Pass@1234', 10);

  // 2. Extended timeout to 15 seconds (15000ms) to prevent P2028
  await prisma.$transaction(async (tx) => {
    
    // CREATE VENDOR USER
    const vendorUser = await tx.user.create({
      data: {
        name: 'Kigali Central Vendor',
        email: 'vendor@localstore.rw',
        emailVerified: true,
        role: 'vendor',
        password: commonPassword,
      },
    });

    // CREATE VENDOR PROFILE
    const vendorProfile = await tx.vendor.create({
      data: {
        storeName: 'Kigali Central Store',
        userId: vendorUser.id,
      }
    });
    console.log(`👤 Vendor Profile created: ${vendorProfile.id}`);

    // 3. CATEGORIES with specific high-quality links
    const categoriesData = [
      { name: 'Food & Groceries', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600' },
      { name: 'Fresh Produce', image: 'https://images.unsplash.com/photo-1542223189-67a03fa0f0bd?q=80&w=600' },
      { name: 'Household Essentials', image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?q=80&w=600' },
      { name: 'Personal Care & Hygiene', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600' },
      { name: 'Agriculture & Farming', image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=600' },
      { name: 'Baby & Mother Care', image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=600' },
      { name: 'Electronics & Accessories', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=600' },
      { name: 'Clothing & Textiles', image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=600' },
      { name: 'Building & Hardware', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600' },
      { name: 'Health & Pharmacy', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600' },
    ];

    const categoryMap: Record<string, string> = {};
    for (const c of categoriesData) {
      const cat = await tx.category.create({ data: c });
      categoryMap[c.name] = cat.id;
    }
    console.log('📂 Categories created');

    // 4. PRODUCTS with specific product matches
    const productsToCreate = [
        // Food & Groceries
        { title: 'White Rice (5kg)', price: 4500, description: 'Long-grain premium rice.', images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=500'], cat: 'Food & Groceries' },
        { title: 'Cooking Oil (2L)', price: 3200, description: 'Refined sunflower oil.', images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=500'], cat: 'Food & Groceries' },
        { title: 'Sugar (2kg)', price: 2100, description: 'Fine white sugar.', images: ['https://images.unsplash.com/photo-1581448670520-73b3282ee434?q=80&w=500'], cat: 'Food & Groceries' },
        { title: 'Spaghetti (500g)', price: 1200, description: 'Quality durum wheat pasta.', images: ['https://images.unsplash.com/photo-1551462147-37885abb3e4a?q=80&w=500'], cat: 'Food & Groceries' },
        { title: 'Soya Beans (1kg)', price: 1200, description: 'Rich in protein.', images: ['https://images.unsplash.com/photo-1550949986-941113c51bd7?q=80&w=500'], cat: 'Food & Groceries' },

        // Fresh Produce
        { title: 'Fresh Tomatoes (1kg)', price: 800, description: 'Farm-fresh red tomatoes.', images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=500'], cat: 'Fresh Produce' },
        { title: 'Ripe Bananas', price: 1200, description: 'Sweet yellow bananas.', images: ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=500'], cat: 'Fresh Produce' },
        { title: 'Green Bell Peppers', price: 900, description: 'Crispy and fresh.', images: ['https://images.unsplash.com/photo-1566184050574-c5807ebc7bdd?q=80&w=500'], cat: 'Fresh Produce' },
        { title: 'Red Onions (1kg)', price: 1500, description: 'Strong flavored onions.', images: ['https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?q=80&w=500'], cat: 'Fresh Produce' },

        // Household
        { title: 'Laundry Detergent', price: 1500, description: 'Deep clean powder.', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=500'], cat: 'Household Essentials' },
        { title: 'Charcoal Bag (10kg)', price: 4000, description: 'Long-burning charcoal.', images: ['https://images.unsplash.com/photo-1612690669207-fed642192c40?q=80&w=500'], cat: 'Household Essentials' },
        { title: 'Solar Lantern', price: 12000, description: 'Durable solar LED lamp.', images: ['https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=500'], cat: 'Household Essentials' },

        // Personal Care
        { title: 'Bar Soap (3-pack)', price: 900, description: 'Gentle on skin.', images: ['https://images.unsplash.com/photo-1600857062241-98e5dba7f025?q=80&w=500'], cat: 'Personal Care & Hygiene' },
        { title: 'Toothpaste (100ml)', price: 1500, description: 'Fluoride protection.', images: ['https://images.unsplash.com/photo-1559304822-9eb2813c9844?q=80&w=500'], cat: 'Personal Care & Hygiene' },

        // Agriculture
        { title: 'Maize Seeds (1kg)', price: 3500, description: 'Improved seed variety.', images: ['https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?q=80&w=500'], cat: 'Agriculture & Farming' },
        { title: 'Steel Garden Hoe', price: 4500, description: 'Heavy duty steel.', images: ['https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=500'], cat: 'Agriculture & Farming' },
        { title: 'Organic Fertilizer', price: 15000, description: '25kg Nutrient rich.', images: ['https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?q=80&w=500'], cat: 'Agriculture & Farming' },

        // Baby
        { title: 'Premium Diapers', price: 6500, description: 'Size 3, 24 pieces.', images: ['https://images.unsplash.com/photo-1544126592-807daf21565c?q=80&w=500'], cat: 'Baby & Mother Care' },
        { title: 'Baby Feeding Bottle', price: 2500, description: 'Anti-colic 250ml.', images: ['https://images.unsplash.com/photo-1559440668-f9906649e37c?q=80&w=500'], cat: 'Baby & Mother Care' },

        // Electronics
        { title: 'Fast Phone Charger', price: 3500, description: 'USB-C compatible.', images: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=500'], cat: 'Electronics & Accessories' },
        { title: 'Wired Earphones', price: 2500, description: 'Deep bass sound.', images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=500'], cat: 'Electronics & Accessories' },
        { title: 'Power Bank (10k mAh)', price: 18000, description: 'Dual port charging.', images: ['https://images.unsplash.com/photo-1609592806457-99d4ad4b894d?q=80&w=500'], cat: 'Electronics & Accessories' },

        // Clothing
        { title: 'Kitenge Print Fabric', price: 5000, description: '6 yards traditional.', images: ['https://images.unsplash.com/photo-1520006403993-4fd2d795b4b2?q=80&w=500'], cat: 'Clothing & Textiles' },
        { title: 'Heavy Rain Boots', price: 7500, description: 'Rubber waterproof.', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=500'], cat: 'Clothing & Textiles' },

        // Building
        { title: 'Portland Cement', price: 16500, description: '50kg construction grade.', images: ['https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?q=80&w=500'], cat: 'Building & Hardware' },
        { title: 'Galvanized Nails', price: 1800, description: '1kg mixed sizes.', images: ['https://images.unsplash.com/photo-1567361808960-dec9cb578182?q=80&w=500'], cat: 'Building & Hardware' },
        { title: 'Paint Roller Set', price: 4500, description: '3 pieces with tray.', images: ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=500'], cat: 'Building & Hardware' },

        // Health
        { title: 'Travel First Aid Kit', price: 8500, description: 'Emergency basics.', images: ['https://images.unsplash.com/photo-1603398938378-e54eab446dde?q=80&w=500'], cat: 'Health & Pharmacy' },
        { title: 'Treated Mosquito Net', price: 5500, description: 'Family size net.', images: ['https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=500'], cat: 'Health & Pharmacy' },
        { title: 'Hand Sanitizer (500ml)', price: 3000, description: '70% alcohol gel.', images: ['https://images.unsplash.com/photo-1584483766114-2cea6facdf57?q=80&w=500'], cat: 'Health & Pharmacy' }
    ];

    for (const p of productsToCreate) {
      await tx.product.create({
        data: {
          title: p.title,
          price: p.price,
          description: p.description,
          images: p.images,
          categoryId: categoryMap[p.cat],
          vendorId: vendorProfile.id 
        }
      });
    }

    // 5. ADDITIONAL USERS
    await tx.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@localstore.rw',
        emailVerified: true,
        role: 'admin',
        password: commonPassword,
      },
    });

    await tx.user.create({
      data: {
        name: 'Jean Pierre',
        email: 'jeanpierre@gmail.com',
        emailVerified: true,
        role: 'user',
        password: commonPassword,
      },
    });

    console.log('✅ All data seeded successfully!');
  }, {
    timeout: 15000 // Extended timeout here
  });
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });