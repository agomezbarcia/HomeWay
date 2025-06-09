### MULTI STAGE BUILD  #####
############################

### VUEJS BUILD ########
FROM node:20.5.0-alpine AS VUEJS
# ARGS variables
ARG PROJECT_ACRONYM
# Environment variables for production
ENV FRONTEND_BASEPATH=/
ENV BACKEND_URI=/api
ENV TZ=Europe/Madrid

# Create app directory
WORKDIR /usr/src/frontend
# Copy repo to workspace
COPY . ./
# If you are building your code for production
RUN export NODE_OPTIONS=--openssl-legacy-provider && npm cache clean --force && npm install && npm run build


# ### NGINX BUILD ########
# # Base image
FROM nginx:1.25.2-alpine
# Copy webpage from VUEJS step
COPY --from=VUEJS /usr/src/frontend/dist /var/www/html
COPY ./.build/nginx/default.conf /etc/nginx/conf.d
# Modify permissions to avois errors
RUN chmod -R 777 /var/www/html