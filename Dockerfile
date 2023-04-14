# ---- Base Node ----
FROM node:14 AS base
WORKDIR /app
COPY package*.json ./

# ---- Dependencies ----
FROM base AS dependencies
RUN npm ci

# ---- Development ----
FROM base AS development
RUN npm install -g tini
RUN npm install
COPY . .
RUN npm run build
ARG PORT=3000
ENV PORT=${PORT}
EXPOSE ${PORT}
ENTRYPOINT [ "tini", "--" ]
CMD ["npm", "run", "start:dev"]

# ---- Release ----
FROM base AS release
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=development /app/dist ./dist
ARG PORT=3000
ENV PORT=${PORT}
EXPOSE ${PORT}
CMD ["npm", "run", "start:prod"]
