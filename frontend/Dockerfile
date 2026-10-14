FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY frontend/package.json frontend/
RUN npm ci --workspace=frontend --workspace=shared --include-workspace-root
COPY design/ design/
COPY shared/ shared/
COPY frontend/ frontend/
ARG VITE_API_URL=/api
ARG VITE_SOCKET_URL=
ARG VITE_VAPID_PUBLIC_KEY=
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
ENV VITE_VAPID_PUBLIC_KEY=$VITE_VAPID_PUBLIC_KEY
RUN npm run build --workspace=frontend

FROM nginx:1.27-alpine
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://localhost/ >/dev/null || exit 1
