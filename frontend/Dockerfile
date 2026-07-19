FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY frontend/package.json frontend/
RUN npm ci --workspace=frontend --workspace=shared --include-workspace-root
COPY shared/ shared/
COPY frontend/ frontend/
EXPOSE 5173
CMD ["npm", "run", "dev", "--workspace=frontend", "--", "--host"]
