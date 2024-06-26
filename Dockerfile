FROM node:20.15-alpine
WORKDIR /app
ADD package*.json ./
ADD yarn.lock ./
ADD prisma ./
RUN yarn install
ADD . .
CMD ["sh", "-c", "yarn build && yarn start"]