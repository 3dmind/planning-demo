FROM node:14-alpine

# Create app directory
WORKDIR /app

# Install @prisma/cli for the migration
RUN npm install -g @prisma/cli@2.13.1 --unsafe-perm

# Copy schema and migration folder
ADD ./ ./prisma/

CMD ["prisma", "db", "push", "--skip-generate", "--preview-feature"]
