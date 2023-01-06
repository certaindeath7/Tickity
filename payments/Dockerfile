FROM node:alpine

WORKDIR /app
COPY package.json .
RUN npm install --only=prod && npm install typescript@4.6.2
COPY . .

CMD ["npm", "start"]
