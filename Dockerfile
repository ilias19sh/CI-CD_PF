FROM node:22

WORKDIR /usr/src/app

# Fichiers nécessaires avant postinstall (prisma generate)
COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts

RUN npm install --omit=dev

COPY . .

RUN npx prisma generate

EXPOSE 3000

USER node

CMD ["sh", "-c", "npx prisma migrate deploy && node app.js"]
