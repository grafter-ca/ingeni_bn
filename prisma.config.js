import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';
import { expand } from 'dotenv-expand';
const env = dotenv.config();
expand(env);
export default defineConfig({
    schema: './prisma/schema.prisma',
    datasource: {
        url: process.env.DATABASE_URL,
        directUrl: process.env.DIRECT_URL,
    },
    migrations: {
        seed: 'npx tsx prisma/seed.ts',
    },
});
//# sourceMappingURL=prisma.config.js.map