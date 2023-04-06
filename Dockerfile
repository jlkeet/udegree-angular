# syntax=docker/dockerfile:v.1.0

FROM node:10.13.0

RUN mkdir /udegree-angular

WORKDIR /udegree-angular

RUN npm install -g @angular/cli@7.3.8
RUN npm install -g nodemon

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 4200

RUN npm run build
RUN npm rebuild node-sass

CMD ["npm", "run", "start"]

