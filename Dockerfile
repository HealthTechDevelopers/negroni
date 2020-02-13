# Dockerfile

FROM node:latest

ADD package.json /app/
WORKDIR /app
RUN npm install

ADD . /app

ENV _PORT=20200
RUN if [ "$PORT" ]; then export _PORT=$PORT; fi

EXPOSE $_PORT
