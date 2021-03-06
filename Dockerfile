FROM node:lts-alpine

LABEL maintainer="osdevisnot@gmail.com"

RUN apk update && apk add --no-cache git curl python py-pip && \
  pip install --no-cache-dir --upgrade awscli && \
  rm -rf /tmp/* ~/.npm ~/.cache/pip /var/lib/apt/lists/* /var/cache/apk/*

RUN git config --global user.email "preup@gmail.com" && \
  git config --global user.name "preup"

WORKDIR /app

COPY . .

RUN npm install --quiet --production --only=production
RUN npm link --quiet --production --only=production

CMD [ "preup" ]
