#!/bin/bash

# Script to view logs of the Zendalona Chatbot UI Docker container

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

CONTAINER_NAME="zendalona-chatbot-ui"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed."
    exit 1
fi

# Check if container exists
if docker ps -a --format '{{.Names}}' | grep -q "^$CONTAINER_NAME$"; then
    # Check if container is running
    if docker ps --format '{{.Names}}' | grep -q "^$CONTAINER_NAME$"; then
        print_status "Showing logs for container $CONTAINER_NAME..."
        docker logs -f $CONTAINER_NAME
    else
        print_warning "Container $CONTAINER_NAME exists but is not running."
        print_status "Showing last 50 lines of logs..."
        docker logs --tail 50 $CONTAINER_NAME
    fi
else
    print_error "Container $CONTAINER_NAME does not exist."
    print_status "Start the container first with: ./run-docker.sh"
    exit 1
fi