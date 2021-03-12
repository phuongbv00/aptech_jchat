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
RUN echo "mainFileName=\"\$(ls /usr/share/nginx/html/main*.js)\" && \
          envsubst '\$WS_ENDPOINT \$API_ENDPOINT ' < \${mainFileName} > main.tmp && \
          mv main.tmp  \${mainFileName} && nginx -g 'daemon off;'" > run.sh
ENTRYPOINT ["sh", "run.sh"]
