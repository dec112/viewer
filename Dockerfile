FROM nginx:alpine

COPY ./build /usr/share/nginx/html
COPY ./templates/nginx/* /etc/nginx/conf.d/

EXPOSE 80