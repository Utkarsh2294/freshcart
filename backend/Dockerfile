FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY backend/package.json backend/
COPY frontend/package.json frontend/
COPY scripts/package.json scripts/
RUN npm ci --workspace=frontend --workspace=shared --include-workspace-root
COPY design/ design/
COPY shared/ shared/
COPY frontend/ frontend/
ARG VITE_VAPID_PUBLIC_KEY=
ENV VITE_VAPID_PUBLIC_KEY=$VITE_VAPID_PUBLIC_KEY
RUN npm run build --workspace=frontend

FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY backend/package.json backend/
COPY scripts/package.json scripts/
RUN npm ci --omit=dev --workspace=backend --workspace=shared --workspace=scripts --include-workspace-root
COPY shared/ shared/
COPY backend/ backend/
COPY scripts/ scripts/
COPY --from=build /app/frontend/dist frontend/dist/
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD node -e "fetch('http://localhost:'+(process.env.PORT||4000)+'/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["sh", "-c", "node scripts/migrate.js && node scripts/bootstrap.js && node backend/src/server.js"]
