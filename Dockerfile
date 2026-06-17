FROM node:20-alpine

WORKDIR /src

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 5000

CMD [ "npm" , "start" ]