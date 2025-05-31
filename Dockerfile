FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm i

# COPY ./docker-entrypoint.sh /entrypoint.sh

# RUN chmod +x /entrypoint.sh

COPY . .

RUN npm run build

ENV SEQUELIZE_MIGRATE=ENABLE
ENV SERVICE_NAME="LOCAPAY BACKEND"

EXPOSE 8000
# ENTRYPOINT ["/entrypoint.sh"]
CMD ["npm", "run", "start:prod"]
