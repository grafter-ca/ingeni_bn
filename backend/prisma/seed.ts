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

  // 1. CLEAN existing data (Order matters: Child tables first)
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

  // 2. Wrap everything in a transaction
  await prisma.$transaction(async (tx) => {
    
    // CREATE VENDOR USER
    const vendorUser = await tx.user.create({
      data: {
        name: 'Kigali Central Vendor',
        email: 'vendor@localstore.rw',
        emailVerified: true,
        role: 'VENDOR',
        password: commonPassword,
      },
    });

    // CREATE VENDOR PROFILE (Required for Products)
    const vendorProfile = await tx.vendor.create({
      data: {
        storeName: 'Kigali Central Store',
        userId: vendorUser.id,
      }
    });
    console.log(`👤 Vendor Profile created: ${vendorProfile.id}`);

    // CREATE CATEGORIES
    const categoriesData = [
      { name: 'Food & Groceries', image: 'https://unsplash.com' },
      { name: 'Fresh Produce', image: 'https://unsplash.com' },
      { name: 'Household Essentials', image: 'https://unsplash.com' },
      { name: 'Personal Care & Hygiene', image: 'https://unsplash.com' },
      { name: 'Agriculture & Farming', image: 'https://unsplash.com' },
      { name: 'Baby & Mother Care', image: 'https://unsplash.com' },
      { name: 'Electronics & Accessories', image: 'https://unsplash.com' },
      { name: 'Clothing & Textiles', image: 'https://unsplash.com' },
      { name: 'Building & Hardware', image: 'https://unsplash.com' },
      { name: 'Health & Pharmacy', image: 'https://unsplash.com' },
    ];

    const categoryMap: Record<string, string> = {};
    for (const c of categoriesData) {
      const cat = await tx.category.create({ data: c });
      categoryMap[c.name] = cat.id;
    }
    console.log('📂 Categories created');

    // CREATE PRODUCTS LIST
    const productsToCreate = [
        { title: 'White Rice (5kg)', price: 4500, description: 'Premium quality.', images: ['https://unsplash.com'], cat: 'Food & Groceries' },
        { title: 'Cooking Oil (2L)', price: 3200, description: 'Pure sunflower oil.', images: ['https://unsplash.com'], cat: 'Food & Groceries' },
        { title: 'Sugar (2kg)', price: 2100, description: 'Refined white sugar.', images: ['https://unsplash.com'], cat: 'Food & Groceries' },
        { title: 'Maize Flour (2kg)', price: 1800, description: 'Finely ground.', images: ['https://unsplash.com'], cat: 'Food & Groceries' },
        { title: 'Soya Beans (1kg)', price: 1200, description: 'High-protein.', images: ['https://unsplash.com'], cat: 'Food & Groceries' },
        { title: 'Fresh Tomatoes (1kg)', price: 800, description: 'Ripe farm tomatoes.', images: ['https://unsplash.com'], cat: 'Fresh Produce' },
        { title: 'Bananas (Bunch)', price: 1000, description: 'Sweet local bananas.', images: ['https://unsplash.com'], cat: 'Fresh Produce' },
        { title: 'Sweet Potatoes (2kg)', price: 1200, description: 'Nutritious tubers.', images: ['https://unsplash.com'], cat: 'Fresh Produce' },
        { title: 'Avocados (3pcs)', price: 900, description: 'Creamy Hass avocados.', images: ['https://unsplash.com'], cat: 'Fresh Produce' },
        { title: 'Laundry Detergent', price: 1500, description: 'Stain-removing powder.', images: ['https://unsplash.com'], cat: 'Household Essentials' },
        { title: 'Charcoal (10kg)', price: 3500, description: 'Hardwood charcoal.', images: ['https://unsplash.com'], cat: 'Household Essentials' },
        { title: 'Solar Lantern', price: 12000, description: 'Bright LED lamp.', images: ['https://unsplash.com'], cat: 'Household Essentials' },
        { title: 'Bar Soap (3-pack)', price: 900, description: 'Multipurpose soap.', images: ['https://unsplash.com'], cat: 'Personal Care & Hygiene' },
        { title: 'Toothpaste (75ml)', price: 1200, description: 'Fluoride protection.', images: ['https://unsplash.com'], cat: 'Personal Care & Hygiene' },
        { title: 'Maize Seeds (1kg)', price: 3500, description: 'High-yield seeds.', images: ['https://unsplash.com'], cat: 'Agriculture & Farming' },
        { title: 'Garden Hoe', price: 4500, description: 'Steel tool.', images: ['https://unsplash.com'], cat: 'Agriculture & Farming' },
        { title: 'Fertilizer (25kg)', price: 18000, description: 'NPK 17-17-17.', images: ['https://unsplash.com'], cat: 'Agriculture & Farming' },
        { title: 'Baby Diapers (20pk)', price: 5500, description: 'Soft & absorbent.', images: ['https://unsplash.com'], cat: 'Baby & Mother Care' },
        { title: 'Feeding Bottle', price: 2500, description: 'BPA-free.', images: ['https://unsplash.com'], cat: 'Baby & Mother Care' },
        { title: 'Phone Charger USB-C', price: 3500, description: 'Fast charging.', images: ['https://unsplash.com'], cat: 'Electronics & Accessories' },
        { title: 'Wired Earphones', price: 2500, description: 'Stereo sound.', images: ['https://unsplash.com'], cat: 'Electronics & Accessories' },
        { title: 'Power Bank', price: 15000, description: '10k mAh.', images: ['https://unsplash.com'], cat: 'Electronics & Accessories' },
        { title: 'Kitenge Fabric', price: 4500, description: '2 yards print.', images: ['https://unsplash.com'], cat: 'Clothing & Textiles' },
        { title: 'Rain Boots', price: 6500, description: 'Rubber boots.', images: ['https://unsplash.com'], cat: 'Clothing & Textiles' },
        { title: 'Cement (50kg)', price: 16000, description: 'Portland cement.', images: ['https://unsplash.com'], cat: 'Building & Hardware' },
        { title: 'Roofing Nails', price: 1800, description: 'Galvanized.', images: ['https://unsplash.com'], cat: 'Building & Hardware' },
        { title: 'First Aid Kit', price: 8500, description: 'Basic medical.', images: ['https://unsplash.com'], cat: 'Health & Pharmacy' },
        { title: 'Mosquito Net', price: 5500, description: 'Long-lasting net.', images: ['https://unsplash.com'], cat: 'Health & Pharmacy' }
    ];

    // Bulk create products with the mapped vendorId and categoryId
    await tx.product.createMany({
      data: productsToCreate.map(p => ({
        title: p.title,
        price: p.price,
        description: p.description,
        images: p.images,
        categoryId: categoryMap[p.cat],
        vendorId: vendorProfile.id // Now correctly linked
      }))
    });

    console.log('✅ All data seeded successfully!');
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
