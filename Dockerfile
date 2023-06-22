FROM node:16.14.2-alpine3.15
ENV MONGO_URI=mongodb://gday:gdaybot@mongo:27017/
# Dependencies for Canvas
RUN apk add --no-cache build-base g++ libpng libpng-dev jpeg-dev pango-dev cairo-dev giflib-dev python3
RUN mkdir -p /usr/src/gday
WORKDIR /usr/src/gday
COPY package.json /usr/src/gday
RUN npm i
COPY . /usr/src/gday
CMD ["npm", "run", "dev"]