# docker container start portainer
# docker build --build-arg MAX_RECORD_COUNT=3 --build-arg COSMOS_ENDPOINT=$COSMOS_ENDPOINT --build-arg COSMOS_KEY=$COSMOS_KEY --build-arg DATABASE_ID=$DATABASE_ID --build-arg PARTITION_KEY=$PARTITION_KEY --build-arg USERS_ID=$USERS_ID --build-arg POSTS_ID=$POSTS_ID -t $ACR_NAME.azurecr.io/testapi:latest .
# docker stop testapp && docker rm testapp
# docker run -d -p 8080:8080 --name testapp --hostname testapp $ACR_NAME.azurecr.io/testapp:latest
# docker run -it -p 8080:8080 --name testapp --hostname testapp $ACR_NAME.azurecr.io/testapp:latest
# Portainer: http://192.168.10.211:9000
# TestApp:   http://192.168.10.211:8080/api-docs

ARG VERSION=14.18.0
FROM node:${VERSION}-alpine3.14

RUN apk -U upgrade &&\
  apk add --no-cache \
  bash \
  openssh \
  libstdc++ \
  ca-certificates \
  gnupg \
  curl \
  wget \
  unzip \
  tar \
  jq \
  htop \
  dos2unix \
  nano \
  mc \
  tmux && \
  rm -rf /var/cache/apk/* /tmp/* /var/tmp/*

ENV NODE_ENV=production

ARG COSMOS_ENDPOINT=""
ENV COSMOS_ENDPOINT=${COSMOS_ENDPOINT}

ARG COSMOS_KEY=""
ENV COSMOS_KEY=${COSMOS_KEY}

ARG DATABASE_ID=""
ENV DATABASE_ID=${DATABASE_ID}

ARG PARTITION_KEY=""
ENV PARTITION_KEY=${PARTITION_KEY}

ARG USERS_ID=""
ENV USERS_ID=${USERS_ID}

ARG POSTS_ID=""
ENV POSTS_ID=${POSTS_ID}

ARG MAX_RECORD_COUNT=2
ENV MAX_RECORD_COUNT=${MAX_RECORD_COUNT}

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY ["src/package.json", "src/package-lock.json*", "./"]
# COPY package.json ./

RUN npm i --production --silent
# RUN npm i

# Bundle app source
COPY ./src/ .

EXPOSE 8080

CMD [ "npm", "start" ]
