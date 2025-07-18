FROM node:24-alpine

WORKDIR /task

COPY package*.json ./
RUN npm install
RUN npm install typescript --save-dev

COPY . .
RUN npm run build

EXPOSE 9003
CMD ["npm", "run", "start:prod"]