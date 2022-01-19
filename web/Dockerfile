ARG DMT_VERSION=v0.10.1
FROM mariner.azurecr.io/dmt/web:${DMT_VERSION} as base
ARG AUTH_ENABLED=0
ARG REDIRECT_URI=http://localhost:9000
# Azure AD requires a scope.
ARG AUTH_SCOPE=""
ARG CLIENT_ID=""
ARG TENANT_ID=""
ENV REACT_APP_AUTH_SCOPE=$AUTH_SCOPE
ENV REACT_APP_AUTH=$AUTH_ENABLED
ENV REACT_APP_AUTH_CLIENT_ID=$CLIENT_ID
ENV REACT_APP_AUTH_TENANT=$TENANT_ID
ENV REACT_APP_TOKEN_ENDPOINT=https://login.microsoftonline.com/${REACT_APP_AUTH_TENANT}/oauth2/v2.0/token
ENV REACT_APP_AUTH_ENDPOINT=https://login.microsoftonline.com/${REACT_APP_AUTH_TENANT}/oauth2/v2.0/authorize
ENV REACT_APP_LOGOUT_ENDPOINT=https://login.microsoftonline.com/${REACT_APP_AUTH_TENANT}/oauth2/logout
ENV REACT_APP_AUTH_REDIRECT_URI=$REDIRECT_URI
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