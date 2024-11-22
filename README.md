# YouTube Streaming Software

## Overview
This project enables live streaming to YouTube using **FFmpeg**, **Socket.IO**, **Docker**, and **Node.js**. It provides a simple setup for broadcasting video content directly to your YouTube channel.

## Prerequisites
Before you begin, ensure you have the following installed:

- **Docker**
- **Node.js**
- **FFmpeg**
- **YouTube account** with live streaming enabled

## Installation

### Step 1: Clone the repository
First, clone the project repository to your local machine:

```bash
git clone https://github.com/ABHI-Theq/StreamYard-Clone.git
cd youtube-streaming-software
```

Step 2: Build the Docker image
Next, build the Docker image for the project:

```bash
docker build -t streamyard-clone .
```

Step 3: Run the Docker container
Run the Docker container using the following command:

```bash
docker run -p 3000:3000 youtube-streaming
```
Usage
Step 1: Start the server
Navigate to the project directory and start the server:

```bash
npm start
```

Features
Real-time video streaming to YouTube
Socket.IO integration for real-time communication
Dockerized for easy deployment
Contributing
Contributions are welcome! Here's how you can contribute to the project:
