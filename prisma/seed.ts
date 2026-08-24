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

  // CLEAN in safe order (respect FK constraints)
  await prisma.$transaction([
    prisma.productImage.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.product.deleteMany(),
    prisma.vendor.deleteMany(),
    prisma.category.deleteMany(),
    prisma.user.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.verification.deleteMany(),
  ]);

  console.log('🗑️ Database cleared');

  const commonPassword = await hash('Pass@1234', 10);

  await prisma.$transaction(async (tx) => {
    // =========================
    // VENDOR USER
    // =========================
    const vendorUser = await tx.user.create({
      data: {
        name: 'Kigali Central Vendor',
        email: 'vendor@localstore.rw',
        emailVerified: true,
        role: 'vendor',
        password: commonPassword,
      },
    });

    const vendor = await tx.vendor.create({
      data: {
        storeName: 'Kigali Central Store',
        userId: vendorUser.id,
      },
    });

    console.log('👤 Vendor created');

    // =========================
    // CATEGORIES
    // =========================
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

    // =========================
    // PRODUCTS (FIXED: no images array directly)
    // =========================
    const products = [
      {
        title: 'White Rice (5kg)',
        price: 4500,
        description: 'Long-grain premium rice.',
        images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=500'],
        cat: 'Food & Groceries',
      },
      {
        title: 'Cooking Oil (2L)',
        price: 3200,
        description: 'Refined sunflower oil.',
        images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=500'],
        cat: 'Food & Groceries',
      },
      {
        title: 'Fresh Tomatoes (1kg)',
        price: 800,
        description: 'Farm-fresh red tomatoes.',
        images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=500'],
        cat: 'Fresh Produce',
      },
      {
        title: 'Laundry Detergent',
        price: 1500,
        description: 'Deep clean powder.',
        images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=500'],
        cat: 'Household Essentials',
      },
      {
        title: 'Power Bank (10k mAh)',
        price: 18000,
        description: 'Dual port charging.',
        images: ['https://images.unsplash.com/photo-1609592806457-99d4ad4b894d?q=80&w=500'],
        cat: 'Electronics & Accessories',
      },
    ];

    for (const p of products) {
      const product = await tx.product.create({
        data: {
          title: p.title,
          price: p.price,
          description: p.description,
          categoryId: categoryMap[p.cat],
          vendorId: vendor.id,
          slug: `${p.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
          stock: 100,
        },
      });

      // ✅ FIX: create ProductImage properly
      await tx.productImage.create({
        data: {
          url: p.images[0],
          productId: product.id,
        },
      });
    }

    console.log('📦 Products created');

    // =========================
    // USERS
    // =========================
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

    console.log('👥 Users created');

    console.log('✅ Seed completed successfully!');
  }, { timeout: 20000 });
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });