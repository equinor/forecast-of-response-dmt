ARG DMT_VERSION=latest
ARG REDIRECT_URI=http://localhost
FROM mariner.azurecr.io/dmt/web:${DMT_VERSION} as base
ENV REACT_APP_AUTH=0
ENV REACT_APP_AUTH_REDIRECT_URI=${REDIRECT_URI}
USER 0
COPY ./actions.js /code/app/src/actions.js
COPY ./config.js /code/app/src/config.js
COPY ./custom-plugins /code/custom-plugins
RUN yarn install --frozen-lockfile

FROM base as development
CMD ["yarn", "start"]
USER 1000

FROM base as prod
RUN yarn build
WORKDIR /code/app
EXPOSE 3000
CMD ["serve", "--single", "build", "--listen", "3000"]
USER 1000