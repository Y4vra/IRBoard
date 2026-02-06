FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
# --host allows it to listen to traefik
CMD ["npm", "run", "dev", "--", "--host"] 