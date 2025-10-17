FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json docusaurus.config.ts sidebars.ts ./
COPY blog ./blog
COPY docs ./docs
COPY src ./src
COPY static ./static

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "start", "--", "--host", "0.0.0.0"]
