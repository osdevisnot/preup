FROM node:alpine

RUN apk update && apk add --no-cache git && \
  rm -rf /tmp/* /var/lib/apt/lists/* /var/cache/apk/*

RUN git config --global user.email "preup@gmail.com"
RUN git config --global user.name "preup"

WORKDIR /app

COPY . .

RUN npm install --quiet --production --only=production
RUN npm link --quiet --production --only=production

CMD [ "preup" ]