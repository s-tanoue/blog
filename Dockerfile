FROM node:14.5.0-alpine
RUN apk update && \
    apk add git
WORKDIR /usr/src/app