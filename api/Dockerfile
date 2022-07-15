FROM node:16.14

WORKDIR /api

COPY package*.json /api/

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]