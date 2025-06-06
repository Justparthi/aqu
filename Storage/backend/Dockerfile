FROM node:latest

WORKDIR /cloud-services-backend

COPY . ./

RUN npm install

EXPOSE 3000

ENTRYPOINT [ "npm", "run", "dev" ]
