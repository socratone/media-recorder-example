// https://dev.to/antopiras89/using-the-mediastream-web-api-to-record-screen-camera-and-audio-1c4n

async function getUserMedia(mediaConstraints) {
  const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
  return stream;
}

// ------------------------------------------------------------------

async function captureScreen() {
  let mediaConstraints = {
    video: {
      cursor: 'always',
      resizeMode: 'crop-and-scale',
    },
  };

  const screenStream = await navigator.mediaDevices.getDisplayMedia(
    mediaConstraints
  );
  return screenStream;
}

// ------------------------------------------------------------------

let recorder = null;

async function recordStream() {
  const options = {
    video: {
      width: 1280,
      height: 720,
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 44100,
    },
  };

  const stream = await getUserMedia(options);
  recorder = new MediaRecorder(stream);
  let chunks = [];

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  recorder.onstop = () => {
    const blob = new Blob(chunks, {
      type: 'video/webm;codecs=vp9',
    });

    chunks = [];
    const blobUrl = URL.createObjectURL(blob);

    console.log(blobUrl);
  };

  recorder.start(200);
}

// ------------------------------------------------------------------

function stopRecording() {
  recorder.stream.getTracks().forEach((track) => track.stop());
}

// ------------------------------------------------------------------

async function init() {
  const screenStream = await captureScreen();

  const options = {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 44100,
    },
    video: false,
  };

  const audioStream = await getUserMedia(options);

  const stream = new MediaStream([
    ...screenStream.getTracks(),
    ...audioStream.getTracks(),
  ]);
}

init();
