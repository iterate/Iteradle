# ---- Build Stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies for building native modules
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Check which directory exists and create a symlink to standardize the path
RUN if [ -d "build" ]; then \
      echo "Using build directory" && ln -s build output; \
    elif [ -d "dist" ]; then \
      echo "Using dist directory" && ln -s dist output; \
    else \
      echo "Neither build nor dist directory found!" && exit 1; \
    fi

# ---- Production Stage ----
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/output /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
