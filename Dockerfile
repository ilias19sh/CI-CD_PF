FROM node:22
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/ 

RUN npm install
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
RUN npx prisma generate  

COPY . .

EXPOSE 3000
CMD [ "sh", "-c", "npx prisma migrate deploy && node app.js" ]