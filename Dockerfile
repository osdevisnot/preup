FROM node:9.11.2-alpine

RUN apk update && apk add --no-cache git curl python py-pip && \
  pip install --upgrade awscli && \
  apk del py-pip && \
  apk del py-setuptools && \
  rm -rf /tmp/* /var/lib/apt/lists/* /var/cache/apk/*

RUN git config --global user.email "preup@gmail.com"
RUN git config --global user.name "preup"

WORKDIR /app

COPY . .

RUN npm install --quiet --production --only=production
RUN npm link --quiet --production --only=production

CMD [ "preup" ]
