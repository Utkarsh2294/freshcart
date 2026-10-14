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
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD node -e "fetch('http://localhost:4000/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["sh", "-c", "node scripts/migrate.js && node backend/src/server.js"]
