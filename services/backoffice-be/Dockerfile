# Illustrative container image for the Marola "backoffice-be" unit.
# Build context is this package dir, so the unit's source maps 1:1 to its
# container. Workspace deps (@marola/*) are linked at the monorepo root in CI;
# this per-service image is a simplified build for the platform diagram.
FROM node:22-alpine
WORKDIR /app
COPY package.json ./
COPY . .
# Node 22 runs TypeScript entrypoints directly via type-stripping.
CMD ["node", "--experimental-strip-types", "src/index.ts"]
