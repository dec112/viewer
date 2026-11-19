FROM nginx:1.31.9-alpine

COPY ./build /usr/share/nginx/html
COPY ./templates/nginx/* /etc/nginx/conf.d/

EXPOSE 80