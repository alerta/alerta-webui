# build stage
FROM node:lts-alpine as build-stage
ARG BASE_URL=/
RUN apk add --no-cache git
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV BASE_URL=${BASE_URL}
RUN echo "build time ${BASE_URL}"
RUN npm run build

# production stage
FROM nginx:stable-alpine as production-stage
RUN echo "run time ${BASE_URL}"
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
