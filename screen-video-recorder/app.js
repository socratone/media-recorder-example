// https://dev.to/antopiras89/using-the-mediastream-web-api-to-record-screen-camera-and-audio-1c4n

let stream = null;
let recorder = null;

// 녹음 장치 설정
const getdiviceButton = document.getElementById('get-device-button');
getdiviceButton.addEventListener('click', async () => {
  stream = await getStream();
});

// 녹음
const recordButton = document.getElementById('record-button');
recordButton.addEventListener('click', () => {
  if (stream) {
    console.log('recording...');
    recordStream(stream);
  }
});

// 녹음 중지
const recordStopButton = document.getElementById('record-stop-button');
recordStopButton.addEventListener('click', stopRecording);

async function getStream() {
  const screenStream = await getScreenStreamByUserDevice();
  const audioStream = await getAudioStreamByUserDevice();

  const stream = new MediaStream([
    ...screenStream.getTracks(),
    ...audioStream.getTracks(),
  ]);
  return stream;
}

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
  const mediaConstraints = {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 44100,
    },
    video: false,
  };

  const audioStream = await navigator.mediaDevices.getUserMedia(
    mediaConstraints
  );
  return audioStream;
}

async function recordStream(stream) {
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

    const anchor = document.createElement('a');
    anchor.setAttribute('href', blobUrl);
    anchor.setAttribute('download', `new-video.webm`);
    anchor.innerText = 'Download';

    const list = document.querySelector('.recordings');
    list.append(anchor);
  };

  recorder.start(200);
}

function stopRecording() {
  console.log('stop recording!');
  recorder.stream.getTracks().forEach((track) => track.stop());
}
