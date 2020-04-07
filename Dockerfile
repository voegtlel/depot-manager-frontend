FROM node:alpine as builder

ARG CONFIGURATION=production

RUN apk update && apk add --no-cache make git
COPY . /app
WORKDIR /app
RUN cd /app && \
    npm set progress=false && \
    npm install && \
    npm run build --configuration=${CONFIGURATION}

# STEP 2 build a small nginx image with static website
FROM nginx:alpine
## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*
## From 'builder' copy website to default nginx public folder
COPY --from=builder /app/dist /usr/share/nginx/html
# Additional startup stuff
ADD docker/nginx_default_with_api.conf.template /etc/nginx/conf.d/default.conf.template
ADD docker/nginx_default.conf /etc/nginx/conf.d/default.conf
ADD src/env.js.template /usr/share/nginx/html/env.js.template
ADD docker/startup.sh /bin/startup.sh
EXPOSE 80
CMD ["sh", "/bin/startup.sh"]
