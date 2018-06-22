# base image
FROM pelias/baseimage

# change working dir
ENV WORKDIR /code/pelias/fuzzy-tester
WORKDIR ${WORKDIR}

# install npm dependencies
COPY ./package.json ${WORKDIR}
RUN npm install

# add code from local checkout
ADD . ${WORKDIR}

# run tests
RUN npm test

# set entrypoint
ENTRYPOINT [ "./bin/fuzzy-tester" ]