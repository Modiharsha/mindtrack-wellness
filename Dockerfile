FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd server && npm install
RUN cd client && npm install

# Copy source code
COPY . .

# Generate Prisma and push DB seed
RUN cd server && npx prisma generate && npx prisma db push --accept-data-loss && npx tsx prisma/seed.ts

# Build frontend client
RUN cd client && npm run build

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000
ENV DATABASE_URL="file:./dev.db"

CMD ["npm", "run", "start"]
