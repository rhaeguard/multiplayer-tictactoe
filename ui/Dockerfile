FROM node:16.13.1-alpine

WORKDIR /app

ARG WS_ENDPOINT
ARG WS_PORT

# to resolve dependencies
ENV PATH /app/node_modules/.bin:$PATH

# download all dependencies
COPY package.json ./
COPY package-lock.json ./

RUN npm ci && npm install -g serve

# copy all the source files
COPY . ./

# create an .env file with the hosts in it
RUN echo "REACT_APP_WS_URL=$WS_ENDPOINT" > .env
RUN echo "REACT_APP_WS_PORT=$WS_PORT" >> .env

# start the application

# if we want to build an optimized production build
# then we should be using two lines below
RUN npm run build
CMD ["serve", "-s", "build", "-l", "3000"]
# else we can use the one below
# CMD ["npm", "run", "start"]