import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';
import { expand } from 'dotenv-expand';

// Load the .env file manually for the Prisma CLI
const env = dotenv.config();
expand(env);

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    //Now this will definitely have a value
    url: process.env.DATABASE_URL,
  },
  migrations: {
    //This tells Prisma: "Use 'tsx' to run the seed file"
    seed: 'npx tsx prisma/seed.ts',
  },
});