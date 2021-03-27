#################
# Build the app #
#################
FROM node as build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm install -g @angular/cli
RUN ng build --configuration production --output-path=/dist

################
# Run in NGINX #
################
FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /dist /usr/share/nginx/html

# When the container starts, replace the env.template.js with values from environment variables
CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env.template.js && exec nginx -g 'daemon off;'"]
