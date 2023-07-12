FROM node:20-alpine

WORKDIR /app

COPY . .

ENV NODE_ENV production
ENV SKIP_ENV_VALIDATION 1

RUN npm ci

RUN npm run build

CMD npm start
