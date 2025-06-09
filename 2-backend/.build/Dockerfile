# Imagen de base alpine para que cargue lo minimo posible
FROM node:20.5.0-alpine

# Definimos unas variables de entorno iniciales
# que después sobreescribiremos desde nuestro
# docker-compose.yml
ENV API_PORT=8084
ENV TZ=Europe/Madrid
ENV API_URL_BASE_PATH=
ENV MONGO_DB_URL=mongodb://mongodb:27017/test

# Usar usuario ROOT de node y 
# modificar el espacio de trabajo
USER root
WORKDIR /home/backend

# Copiar nuestro código fuente a la
# instancia de docker
COPY . .

# Instalar las dependencias en modo produccion
# para evitar codigo innecesario
RUN npm install --production
RUN npm install express@4.21.1

# Exponemos el puerto para que sea accesible desde fuera
EXPOSE 8084

# Comando por defecto que ejecutara 
# Docker al cargar el contenedor 
CMD [ "node", "server.js" ]