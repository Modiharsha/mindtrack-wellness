FROM node:20-slim

WORKDIR /app

# Install OpenSSL for Prisma engine compatibility
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy all source files
COPY . .

# Install dependencies and build client & database
RUN npm install --ignore-scripts
RUN cd server && npm install && npx prisma generate && npx prisma db push --accept-data-loss && npx tsx prisma/seed.ts
RUN cd client && npm install && npm run build

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000
ENV DATABASE_URL="file:./dev.db"

CMD ["npm", "run", "start"]
