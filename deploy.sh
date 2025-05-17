#!/bin/bash

# Name for image and container
IMAGE_NAME="zendalona"
CONTAINER_NAME="zendalona-ui"
PORT_OUT=3000
PORT_IN=5173

echo "📦 Building Docker image..."
docker build -t $IMAGE_NAME .

# Stop and remove existing container if running
if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
  echo "🛑 Stopping existing container..."
  docker stop $CONTAINER_NAME
fi

if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
  echo "🧹 Removing existing container..."
  docker rm $CONTAINER_NAME
fi

echo "🚀 Starting new container..."
docker run -d --name $CONTAINER_NAME -p $PORT_OUT:$PORT_IN $IMAGE_NAME

echo "✅ Deployed successfully!"
echo "🔗 Visit: http://localhost:$PORT_OUT"

