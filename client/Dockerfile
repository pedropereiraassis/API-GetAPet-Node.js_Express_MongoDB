FROM node:16.14

WORKDIR /client

COPY package*.json /client/

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]