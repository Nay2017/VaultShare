FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
# Install deps including legacy fix
RUN npm install --legacy-peer-deps
COPY . .
# Ensure the public folder exists for static files
RUN mkdir -p public
EXPOSE 5000
CMD [ "node", "index.js" ]