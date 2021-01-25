FROM node:14-alpine

ENV CHECKPOINT_DISABLE=1
WORKDIR /app
COPY package.json .
COPY yarn.lock .
COPY . ./prisma/
RUN yarn install --production
CMD ["yarn", "db:migrate:reset"]
