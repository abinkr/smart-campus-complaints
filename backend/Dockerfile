FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund
RUN apk add --no-cache openssl

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src
COPY instrument.mjs ./
COPY pm2.config.cjs ./

ENV NODE_ENV=production

EXPOSE 5000

USER node

CMD ["sh", "-c", "npm run prisma:deploy && exec node src/server.js"]
