let stream = null;

const getdiviceButton = document.getElementById('get-device-button');
getdiviceButton.addEventListener('click', async () => {
  stream = await getStream();

  console.log('stream:', stream);
});

async function getStream() {
  const screenStream = await getScreenStreamByUserDevice();
  const audioStream = await getAudioStreamByUserDevice();

  const stream = new MediaStream([
    ...screenStream.getTracks(),
    ...audioStream.getTracks(),
  ]);
  return stream;
}

const recordButton = document.getElementById('record-button');
recordButton.addEventListener('click', () => {
  if (stream) {
    console.log('recording...');
    recordStream(stream);
  }
});

const recordStopButton = document.getElementById('record-stop-button');
recordStopButton.addEventListener('click', stopRecording);

// https://dev.to/antopiras89/using-the-mediastream-web-api-to-record-screen-camera-and-audio-1c4n

async function getUserMedia(mediaConstraints) {
  const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
  return stream;
}

// ------------------------------------------------------------------

async function getScreenStreamByUserDevice() {
  const mediaConstraints = {
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

async function getAudioStreamByUserDevice() {
  const options = {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 44100,
    },
    video: false,
  };

  const audioStream = await getUserMedia(options);
  return audioStream;
}

// ------------------------------------------------------------------

let recorder = null;

async function recordStream(stream) {
  // const options = {
  //   video: {
  //     width: 1280,
  //     height: 720,
  //   },
  //   audio: {
  //     echoCancellation: true,
  //     noiseSuppression: true,
  //     sampleRate: 44100,
  //   },
  // };

  // const stream = await getUserMedia(options);
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

    //
    const anchor = document.createElement('a');
    anchor.setAttribute('href', blobUrl);
    anchor.setAttribute('download', `recording.webm`);
    anchor.innerText = 'Download';
    document.body.append(anchor);
  };

  recorder.start(200);
}

// ------------------------------------------------------------------

function stopRecording() {
  console.log('stop recording!');
  recorder.stream.getTracks().forEach((track) => track.stop());
}

// ------------------------------------------------------------------
