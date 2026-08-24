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
    await prisma.verification.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    console.log('🗑️  Cleared existing data');
    const categories = await Promise.all([
        prisma.category.create({
            data: {
                name: 'Food & Groceries',
                image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
            },
        }),
        prisma.category.create({
            data: {
                name: 'Fresh Produce',
                image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400',
            },
        }),
        prisma.category.create({
            data: {
                name: 'Household Essentials',
                image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400',
            },
        }),
        prisma.category.create({
            data: {
                name: 'Personal Care & Hygiene',
                image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
            },
        }),
        prisma.category.create({
            data: {
                name: 'Agriculture & Farming',
                image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400',
            },
        }),
        prisma.category.create({
            data: {
                name: 'Baby & Mother Care',
                image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400',
            },
        }),
        prisma.category.create({
            data: {
                name: 'Electronics & Accessories',
                image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
            },
        }),
        prisma.category.create({
            data: {
                name: 'Clothing & Textiles',
                image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
            },
        }),
        prisma.category.create({
            data: {
                name: 'Building & Hardware',
                image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
            },
        }),
        prisma.category.create({
            data: {
                name: 'Health & Pharmacy',
                image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
            },
        }),
    ]);
    const [foodGroceries, freshProduce, householdEssentials, personalCare, agriculture, babyMother, electronics, clothing, building, health,] = categories;
    console.log(`✅ Created ${categories.length} categories`);
    const products = [
        {
            title: 'White Rice (5kg)',
            price: 4500,
            description: 'Premium quality white rice, ideal for daily meals. Sourced from local farmers.',
            images: [
                'https://images.unsplash.com/photo-1536304993881-ff86e0c9b589?w=400',
                'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
            ],
            categoryId: foodGroceries.id,
        },
        {
            title: 'Cooking Oil (2L)',
            price: 3200,
            description: 'Pure sunflower cooking oil. Perfect for frying, sautéing, and baking.',
            images: [
                'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400',
            ],
            categoryId: foodGroceries.id,
        },
        {
            title: 'Sugar (2kg)',
            price: 2100,
            description: 'Refined white sugar for everyday cooking and beverages.',
            images: [
                'https://images.unsplash.com/photo-1559561853-08451507a534?w=400',
            ],
            categoryId: foodGroceries.id,
        },
        {
            title: 'Maize Flour (2kg)',
            price: 1800,
            description: 'Finely ground maize flour. A staple for ugali and porridge across households.',
            images: [
                'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
            ],
            categoryId: foodGroceries.id,
        },
        {
            title: 'Soya Beans (1kg)',
            price: 1200,
            description: 'High-protein soya beans. Great for cooking or processing into soya milk.',
            images: [
                'https://images.unsplash.com/photo-1612257416648-8f2f3a0f8d8a?w=400',
            ],
            categoryId: foodGroceries.id,
        },
        {
            title: 'Fresh Tomatoes (1kg)',
            price: 800,
            description: 'Farm-fresh ripe tomatoes. Delivered directly from local farmers to your door.',
            images: [
                'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400',
                'https://images.unsplash.com/photo-1546470427-1ec6e777fcab?w=400',
            ],
            categoryId: freshProduce.id,
        },
        {
            title: 'Bananas (bunch)',
            price: 1000,
            description: 'Sweet ripe bananas, a bundle of about 10-12 fingers. Great for snacking.',
            images: [
                'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400',
            ],
            categoryId: freshProduce.id,
        },
        {
            title: 'Sweet Potatoes (2kg)',
            price: 1200,
            description: 'Orange-flesh sweet potatoes, nutritious and delicious. Locally grown.',
            images: [
                'https://images.unsplash.com/photo-1596097635121-14b38c5f8e4a?w=400',
            ],
            categoryId: freshProduce.id,
        },
        {
            title: 'Avocados (3 pieces)',
            price: 900,
            description: 'Creamy ripe Hass avocados. Rich in healthy fats, perfect for salads or spreading.',
            images: [
                'https://images.unsplash.com/photo-1601039641847-7857b994d704?w=400',
            ],
            categoryId: freshProduce.id,
        },
        {
            title: 'Laundry Detergent (1kg)',
            price: 1500,
            description: 'Powerful laundry detergent. Removes tough stains and leaves clothes fresh.',
            images: [
                'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
            ],
            categoryId: householdEssentials.id,
        },
        {
            title: 'Charcoal (10kg bag)',
            price: 3500,
            description: 'Quality hardwood charcoal for cooking. Burns long and produces minimal smoke.',
            images: [
                'https://images.unsplash.com/photo-1612690669207-fed642192c40?w=400',
            ],
            categoryId: householdEssentials.id,
        },
        {
            title: 'Candles (pack of 10)',
            price: 1000,
            description: 'Long-lasting household candles. Essential for power outages in both urban and rural areas.',
            images: [
                'https://images.unsplash.com/photo-1602192509154-0b900ee1f851?w=400',
            ],
            categoryId: householdEssentials.id,
        },
        {
            title: 'Plastic Jerry Can (20L)',
            price: 2500,
            description: 'Durable food-grade plastic jerry can for water storage. Essential for rural households.',
            images: [
                'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400',
            ],
            categoryId: householdEssentials.id,
        },
        {
            title: 'Bar Soap (pack of 3)',
            price: 900,
            description: 'Multipurpose bar soap for bathing and washing. Gentle on skin.',
            images: [
                'https://images.unsplash.com/photo-1600857062241-98e5dba7f025?w=400',
            ],
            categoryId: personalCare.id,
        },
        {
            title: 'Toothpaste (75ml)',
            price: 1200,
            description: 'Fluoride toothpaste for cavity protection and fresh breath.',
            images: [
                'https://images.unsplash.com/photo-1559304822-9eb2813c9844?w=400',
            ],
            categoryId: personalCare.id,
        },
        {
            title: 'Sanitary Pads (pack of 8)',
            price: 1500,
            description: 'Comfortable and absorbent sanitary pads for women. Available to all communities.',
            images: [
                'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
            ],
            categoryId: personalCare.id,
        },
        {
            title: 'Maize Seeds (1kg)',
            price: 3500,
            description: 'High-yield certified maize seeds. Drought-tolerant variety suitable for Rwandan climate.',
            images: [
                'https://images.unsplash.com/photo-1602513445027-42c7f75d44c0?w=400',
            ],
            categoryId: agriculture.id,
        },
        {
            title: 'Garden Hoe',
            price: 4500,
            description: 'Heavy-duty steel garden hoe with a strong wooden handle. Essential farming tool.',
            images: [
                'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
            ],
            categoryId: agriculture.id,
        },
        {
            title: 'Fertilizer NPK (25kg)',
            price: 18000,
            description: 'Balanced NPK fertilizer to boost crop yields. Suitable for beans, maize, and vegetables.',
            images: [
                'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=400',
            ],
            categoryId: agriculture.id,
        },
        {
            title: 'Baby Diapers (pack of 20)',
            price: 5500,
            description: 'Soft and absorbent baby diapers. Keeps baby dry and comfortable all day.',
            images: [
                'https://images.unsplash.com/photo-1584515933487-779824d29309?w=400',
            ],
            categoryId: babyMother.id,
        },
        {
            title: 'Baby Feeding Bottle',
            price: 2500,
            description: 'BPA-free baby feeding bottle with anti-colic nipple. Safe for newborns.',
            images: [
                'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400',
            ],
            categoryId: babyMother.id,
        },
        {
            title: 'Solar Lantern',
            price: 12000,
            description: 'Rechargeable solar-powered LED lantern. Perfect for areas with unreliable electricity.',
            images: [
                'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400',
                'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400',
            ],
            categoryId: electronics.id,
        },
        {
            title: 'Phone Charger (USB-C)',
            price: 3500,
            description: 'Universal USB-C fast charger. Compatible with most modern smartphones.',
            images: [
                'https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=400',
            ],
            categoryId: electronics.id,
        },
        {
            title: 'Torch / Flashlight',
            price: 2500,
            description: 'Bright LED torch with long battery life. Essential for rural homes and power cuts.',
            images: [
                'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400',
            ],
            categoryId: electronics.id,
        },
        {
            title: 'Kitenge Fabric (2 yards)',
            price: 4500,
            description: 'Colorful African print kitenge fabric. Ideal for dresses, wraps, and traditional wear.',
            images: [
                'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400',
            ],
            categoryId: clothing.id,
        },
        {
            title: 'Rubber Rain Boots',
            price: 6500,
            description: 'Waterproof rubber boots. Essential for farmers and rural workers during rainy season.',
            images: [
                'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
            ],
            categoryId: clothing.id,
        },
        {
            title: 'Roofing Nails (1kg)',
            price: 1800,
            description: 'Galvanized roofing nails, rust-resistant and durable for all weather conditions.',
            images: [
                'https://images.unsplash.com/photo-1567361808960-dec9cb578182?w=400',
            ],
            categoryId: building.id,
        },
        {
            title: 'Cement (50kg bag)',
            price: 16000,
            description: 'High-strength Portland cement for construction and repairs.',
            images: [
                'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
            ],
            categoryId: building.id,
        },
        {
            title: 'Oral Rehydration Salts (ORS) x10',
            price: 1500,
            description: 'WHO-standard ORS sachets for treating dehydration from diarrhea or illness.',
            images: [
                'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
            ],
            categoryId: health.id,
        },
        {
            title: 'Mosquito Net (double size)',
            price: 5500,
            description: 'LLIN treated mosquito net. Protects against malaria-carrying mosquitoes.',
            images: [
                'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
            ],
            categoryId: health.id,
        },
        {
            title: 'First Aid Kit',
            price: 8500,
            description: 'Basic first aid kit with bandages, antiseptic, plasters, and scissors. A must for every home.',
            images: [
                'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400',
            ],
            categoryId: health.id,
        },
    ];
    await prisma.product.createMany({ data: products });
    console.log(`✅ Created ${products.length} products`);
    const adminPassword = await hash('Admin@1234', 10);
    const userPassword = await hash('User@1234', 10);
    const admin = await prisma.user.create({
        data: {
            name: 'Admin User',
            email: 'admin@localstore.rw',
            emailVerified: true,
            role: 'ADMIN',
            password: adminPassword,
            phone: '+250788000001',
            country: 'Rwanda',
            accounts: {
                create: {
                    accountId: 'admin-account',
                    providerId: 'credentials',
                    password: adminPassword,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            },
        },
    });
    const regularUser = await prisma.user.create({
        data: {
            name: 'Jean Pierre',
            email: 'jeanpierre@gmail.com',
            emailVerified: true,
            role: 'USER',
            password: userPassword,
            phone: '+250788000002',
            country: 'Rwanda',
            accounts: {
                create: {
                    accountId: 'user-account',
                    providerId: 'credentials',
                    password: userPassword,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            },
        },
    });
    console.log(`✅ Created admin: ${admin.email}`);
    console.log(`✅ Created user:  ${regularUser.email}`);
    console.log('\n🎉 Seed completed successfully!');
    console.log('-----------------------------------');
    console.log('Admin login:  admin@localstore.rw  |  Admin@1234');
    console.log('User login:   jeanpierre@gmail.com |  User@1234');
    console.log('-----------------------------------');
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map