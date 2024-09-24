
FROM node:20.10.0-alpine AS build
 
WORKDIR /app
 
COPY package.json ./
COPY package-lock.json ./
RUN npm install --legacy-peer-deps
RUN npm install -g @angular/cli
 
COPY . .
RUN ng build --configuration production
 
FROM nginx:alpine
 
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
 
EXPOSE 80
 
CMD ["nginx", "-g", "daemon off;"]