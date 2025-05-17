FROM node:18

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code and .env
COPY . .
COPY .env .env

# Expose the port used by the app
EXPOSE 3000

# Run the app
CMD ["npm", "run", "dev"]
