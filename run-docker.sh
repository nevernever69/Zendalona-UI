#!/bin/bash

# Script to build and run the Zendalona Chatbot UI in a Docker container

# Exit on any error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker and try again."
    exit 1
fi

print_status "Docker is installed"

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_error ".env file not found. Please create a .env file with your Firebase configuration."
    exit 1
fi

print_status ".env file found"

# Check if the image already exists
IMAGE_NAME="zendalona-chatbot-ui"
if docker image inspect "$IMAGE_NAME" &> /dev/null; then
    print_warning "Docker image $IMAGE_NAME already exists"
    read -p "Do you want to rebuild the image? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Building Docker image..."
        docker build -t "$IMAGE_NAME" .
    else
        print_status "Using existing Docker image"
    fi
else
    print_status "Building Docker image..."
    docker build -t "$IMAGE_NAME" .
fi

# Stop and remove existing container if it's running
if docker ps -a --format '{{.Names}}' | grep -q "^zendalona-chatbot-ui$"; then
    print_warning "Container zendalona-chatbot-ui already exists"
    if docker ps --format '{{.Names}}' | grep -q "^zendalona-chatbot-ui$"; then
        print_status "Stopping existing container..."
        docker stop zendalona-chatbot-ui
    fi
    print_status "Removing existing container..."
    docker rm zendalona-chatbot-ui
fi

# Run the container
print_status "Starting container..."
docker run -d \
  --name zendalona-chatbot-ui \
  --env-file .env \
  -p 7000:80 \
  --restart unless-stopped \
  "$IMAGE_NAME"

print_status "Container started successfully!"

# Wait a moment for the container to initialize
sleep 3

# Check if container is running
if docker ps --format '{{.Names}}' | grep -q "^zendalona-chatbot-ui$"; then
    print_status "Application is running on http://localhost:8080"
    print_status "You can check the logs with: docker logs zendalona-chatbot-ui"
else
    print_error "Container failed to start. Check the logs with: docker logs zendalona-chatbot-ui"
    exit 1
fi
