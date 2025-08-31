# Deployment Guide

This guide explains how to deploy the Zendalona Chatbot UI using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose (optional but recommended)

## Deployment Options

### Option 1: Using Docker Compose (Recommended)

1. Ensure the `.env` file contains your Firebase configuration (it should already be set up)

2. Build and start the application:
   ```bash
   docker-compose up -d
   ```

3. Access the application at `http://localhost`

### Option 2: Using Docker Directly

1. Build the Docker image:
   ```bash
   docker build -t zendalona-chatbot-ui .
   ```

2. Run the container with the environment file:
   ```bash
   docker run -d -p 8080:80 --env-file .env --name zendalona-chatbot-ui zendalona-chatbot-ui
   ```

3. Access the application at `http://localhost:8080`

### Option 3: Using the Deployment Scripts

1. To build and run the application:
   ```bash
   ./run-docker.sh
   ```

2. To stop and remove the application:
   ```bash
   ./stop-docker.sh
   ```

3. To view the application logs:
   ```bash
   ./logs-docker.sh
   ```

## Environment Variables

The application uses Firebase for authentication. The required environment variables are already in your `.env` file:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

## Health Check

The application includes a health check endpoint at `/health` that returns "healthy" when the service is running properly.

## Stopping the Application

If you used Docker Compose:
```bash
docker-compose down
```

If you used Docker directly:
```bash
docker stop zendalona-chatbot-ui
docker rm zendalona-chatbot-ui
```

If you used the deployment scripts:
```bash
./stop-docker.sh
```