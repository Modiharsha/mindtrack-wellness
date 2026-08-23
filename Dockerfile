FROM node:20-slim

WORKDIR /app

# Environment variables needed at build and runtime
ENV NODE_ENV=production
ENV PORT=5000
ENV DATABASE_URL="file:./dev.db"
ENV JWT_SECRET="mindtrack_wellness_production_secret_key_2026"

# Install OpenSSL for Prisma engine compatibility
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy all source files
COPY . .

# Install dependencies (including build tools like typescript/vite), generate Prisma client, seed DB, and build frontend
RUN npm install --include=dev
RUN cd server && npm install --include=dev && npx prisma generate && npx prisma db push --accept-data-loss && npx tsx prisma/seed.ts
RUN cd client && npm install --include=dev && npm run build

EXPOSE 5000

CMD ["npm", "run", "start"]
