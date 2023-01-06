FROM node:alpine

WORKDIR /app
COPY package.json .
RUN npm install && npm install typescript@4.6.2
COPY . .

CMD ["npm", "start"]
