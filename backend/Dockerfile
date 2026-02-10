# Use Node.js LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Initialize DB (if strictly needed on build, but better on start)
# RUN node src/database/init-db.js 

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
