ARG DMT_VERSION=stable
FROM mariner.azurecr.io/dmt/web:${DMT_VERSION} as base
COPY ./actions.js /code/app/src/actions.js
COPY ./config.js /code/app/src/config.js
COPY ./custom-plugins /code/custom-plugins
RUN yarn install --frozen-lockfile
ENV REACT_APP_EXPORTED_APP 1
ENV REACT_APP_EXPORTED_APP_NAME "App. Menu"

FROM base as development
CMD ["yarn", "start"]

FROM base as prod
RUN yarn build
WORKDIR /code/app
EXPOSE 3000
CMD ["serve", "--single", "build", "--listen", "3000"]
