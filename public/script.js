const video = document.getElementById("user-video");
const state = { media: null, mediaRecorder: null };
const startBtn = document.getElementById("start-button");
const stopBtn = document.getElementById("stop-button");
const RTPL_link=document.getElementById('rtmp-link');
const socket = io();

// Start Button: Start MediaRecorder and send video data
startBtn.addEventListener("click", async() => {
  // console.log(RTPL_link.value);
  
  const res= await fetch("/api/rtpl",{
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({RTPL_link:RTPL_link.value }),
  })

  if(!res.ok){
    alert('Error')
  }
  const data=await res.json()
   
  if (!state.media) {
    console.error("No media available.");
    return;
  }

  state.mediaRecorder = new MediaRecorder(state.media, {
    audioBitsPerSecond: 128000,
    videoBitsPerSecond: 2500000,
    mimeType: "video/webm", // Ensure compatibility
  });

  state.mediaRecorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      try {
        console.log("Sending video data...");
        socket.emit("binary-video-data", event.data);
      } catch (error) {
        console.error("Error sending video data:", error);
      }
    }
  };

  state.mediaRecorder.start(33); // Trigger dataavailable every 33ms (approx. 30fps)
  console.log("Recording started...");
});

// Stop Button: Stop MediaRecorder
stopBtn.addEventListener("click", () => {
  if (state.mediaRecorder && state.mediaRecorder.state !== "inactive") {
    state.mediaRecorder.stop();
    socket.off('binary-video-data')
    socket.close();
    console.log("Recording stopped.");
  } else {
    console.warn("No recording in progress to stop.");
  }
});



// Load Event: Initialize Media Stream
window.addEventListener("load", async () => {
  try {
    const media = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    state.media = media;
    video.srcObject = media;
    console.log("Media stream initialized.");
  } catch (err) {
    console.error("Error accessing media devices:", err);
  }
});

// Handle socket disconnection
socket.on("disconnect", () => {
  console.warn("Socket disconnected. Stopping recording...");
  if (state.mediaRecorder && state.mediaRecorder.state !== "inactive") {
    state.mediaRecorder.stop();
  }
});
