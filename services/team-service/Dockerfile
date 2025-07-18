FROM node:24-alpine

WORKDIR /team

COPY package*.json ./
RUN npm install
RUN npm install typescript --save-dev

COPY . .
RUN npm run build

EXPOSE 9001
CMD ["npm", "run", "start:prod"]