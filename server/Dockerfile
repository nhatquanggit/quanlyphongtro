FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY nest-cli.json tsconfig*.json ./
COPY src ./src
COPY be.mjs ./

RUN npm run build

EXPOSE 3000 3001

CMD ["npm", "run", "start:prod"]