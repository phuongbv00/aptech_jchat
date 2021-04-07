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