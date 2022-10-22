FROM node:16.13.1-alpine

WORKDIR /app

ARG WS_ENDPOINT
ARG WS_PORT

# to resolve dependencies
ENV PATH /app/node_modules/.bin:$PATH

# download all dependencies
COPY package.json ./
COPY package-lock.json ./

RUN npm ci

# copy all the source files
COPY . ./

# create an .env file with the hosts in it
RUN echo "WS_ENDPOINT=$WS_ENDPOINT" > .env
RUN echo "WS_PORT=$WS_PORT" >> .env

# start the application
CMD ["npm", "start"]