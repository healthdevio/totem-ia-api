###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM --platform=linux/x86_64 node:18 as development

# Create app directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
COPY --chown=node:node package*.json ./

RUN apt-get update
RUN apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
# Install app dependencies using the `npm ci` command instead of `npm install`
RUN npm ci

# Bundle app source
COPY --chown=node:node . .
COPY --chown=node:node prisma .
COPY --chown=node:node config .
# COPY --chown=node:node .env ./

# Use the node user from the image (instead of the root user)
USER node

###################
# BUILD FOR PRODUCTION
###################

FROM --platform=linux/x86_64 node:18 As build

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

# In order to run `npm run build` we need access to the Nest CLI which is a dev dependency. In the previous development stage we ran `npm ci` which installed all dependencies, so we can copy over the node_modules directory from the development image
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .
COPY --chown=node:node prisma .
COPY --chown=node:node config .

#GENERATE PRISMA FILES
RUN npx prisma generate

# Run the build command which creates the production bundle
RUN npm run build

# Set NODE_ENV environment variable
ENV NODE_ENV production

# Running `npm ci` removes the existing node_modules directory and passing in --only=production ensures that only the production dependencies are installed. This ensures that the node_modules directory is as optimized as possible
RUN apt-get update
RUN apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
RUN npm ci --only=production && npm cache clean --force

USER node

###################
# PRODUCTION
###################

FROM --platform=linux/x86_64 node:18 As production

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY --chown=node:node --from=build /usr/src/app/prisma prisma 
COPY --chown=node:node --from=build /usr/src/app/config config 
COPY --chown=node:node --from=build /usr/src/app/config ./dist/config 

# COPY --chown=node:node .env ./

RUN npx prisma generate

# Start the server using the production build
CMD [ "node", "dist/main.js" ]
