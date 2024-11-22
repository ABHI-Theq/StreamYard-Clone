import http from "http";
import dotenv from "dotenv";
import path from "path";
import { spawn } from "child_process";
import express from "express";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.resolve("./public")));

app.get("/", (req, res) => {
  res.sendFile(path.resolve("./public/index.html"));
});

let ffmpegProcess = null;

// Route to set the RTMP link and start FFmpeg
app.post("/api/rtpl", (req, res) => {
  const rtmpLink = req.body.RTPL_link;

  if (!rtmpLink || typeof rtmpLink !== "string") {
    return res.status(400).send("Invalid RTMP link");
  }

  if (ffmpegProcess) {
    ffmpegProcess.stdin.end();
    ffmpegProcess.kill("SIGINT");
  }

  const options = [
    "-i",
    "-",
    "-c:v",
    "libx264",
    "-preset",
    "ultrafast",
    "-tune",
    "zerolatency",
    "-r",
    "25",
    "-g",
    "50",
    "-keyint_min",
    "25",
    "-crf",
    "25",
    "-pix_fmt",
    "yuv420p",
    "-sc_threshold",
    "0",
    "-profile:v",
    "main",
    "-level",
    "3.1",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-ar",
    "44100",
    "-f",
    "flv",
    `rtmp://a.rtmp.youtube.com/live2/${rtmpLink}`,
  ];

  ffmpegProcess = spawn("ffmpeg", options);

  ffmpegProcess.stdout.on("data", (data) => {
    console.log(`FFmpeg stdout: ${data}`);
  });

  ffmpegProcess.stderr.on("data", (data) => {
    console.error(`FFmpeg stderr: ${data}`);
  });

  ffmpegProcess.on("close", (code) => {
    console.log(`FFmpeg process exited with code ${code}`);
  });

  ffmpegProcess.stdin.on("error", (err) => {
    console.error("FFmpeg input stream error:", err);
  });

  res.status(200).json({ message: `RTMP link set to ${rtmpLink}` });
});

// Handle socket connections
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("binary-video-data", (stream) => {
    if (ffmpegProcess && !ffmpegProcess.killed) {
      try {
        ffmpegProcess.stdin.write(stream);
      } catch (error) {
        console.error(`Error writing to FFmpeg for ${socket.id}:`, error);
      }
    } else {
      console.error("No active FFmpeg process to handle video data.");
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down...");
  if (ffmpegProcess) {
    ffmpegProcess.stdin.end();
    ffmpegProcess.kill("SIGINT");
  }
  process.exit();
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
