FROM node:latest

WORKDIR /cloud-services-frontend

COPY . ./

RUN npm install

RUN npm run build

FROM nginx:latest AS reverse-proxy

RUN apt-get update -y && apt-get upgrade -y
RUN apt-get install -y certbot python3-certbot-nginx

COPY --from=0 /cloud-services-frontend/dist/ /usr/share/nginx/html/
COPY --from=0 /cloud-services-frontend/aquesa.conf /etc/nginx/conf.d/aquesa.conf
# COPY --from=0 /cloud-services-frontend/default /etc/nginx/sites-enabled/default

EXPOSE 80 443