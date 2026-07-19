FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY backend/package.json backend/
RUN npm ci --workspace=backend --workspace=shared --include-workspace-root
COPY shared/ shared/
COPY backend/ backend/
EXPOSE 4000
CMD ["node", "backend/src/server.js"]
