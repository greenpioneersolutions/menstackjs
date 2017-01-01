FROM ubuntu:latest
MAINTAINER GreenPioneer
# Install Utilities
RUN apt-get update -q
# RUN apt-get install -yqq wget aptitude htop vim git traceroute dnsutils curl ssh sudo tree tcpdump nano psmisc gcc make build-essential libfreetype6 libfontconfig libkrb5-dev
RUN apt-get install -yqq wget vim git curl ssh build-essential

# Install NodeJS
RUN curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
RUN sudo apt-get install -yq nodejs

# Install Menstackjs Prerequisites
RUN npm install --quiet -g  bower mocha pm2 mongo-express nodemon node-inspector

RUN mkdir /opt/menstackjs
WORKDIR /opt/menstackjs

# Copies the local package.json file to the container
# and utilities docker container cache to not needing to rebuild
# and install node_modules/ everytime we build the docker, but only
# when the local package.json file changes.
# Install npm packages
ADD package.json /opt/menstackjs/package.json
RUN npm install --quiet

# Share local directory on the docker container
ADD . /opt/menstackjs

# Machine cleanup
RUN npm cache clean
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Set development environment as default
ENV NODE_ENV development

# Ports generic
EXPOSE 80:80
EXPOSE 443:443

# Port 3000 for Menstackjs server
EXPOSE 3000:3000

# Port 5858 for node debug
EXPOSE 5858:5858

# Port 35729 for livereload
EXPOSE 35729:35729

# Run Menstackjs server
CMD ["npm", "start"]
