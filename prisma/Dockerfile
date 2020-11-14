FROM node:14-alpine
RUN echo $DATABASE_URL

# Create app directory
WORKDIR /app

# Install @prisma/cli for the migration
RUN npm install -g @prisma/cli@2.11 --unsafe-perm

# Copy schema and migration folder
ADD ./ ./prisma/

CMD [ "prisma", "migrate", "up", "--experimental"]
