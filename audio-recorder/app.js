// https://www.twilio.com/blog/mediastream-recording-api

window.addEventListener('DOMContentLoaded', () => {
  const getMicButton = document.getElementById('get-mic-button');
  const recordButton = document.getElementById('record-button');
  const recordings = document.querySelector('.recordings');

  if ('MediaRecorder' in window) {
    // everything is good, let's go ahead
    getMicButton.addEventListener('click', async () => {
      getMicButton.setAttribute('hidden', 'hidden');

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        console.log(stream);

        const mimeType = 'audio/webm';
        let chunks = [];
        const recorder = new MediaRecorder(stream, { type: mimeType });

        recorder.addEventListener('dataavailable', (event) => {
          if (typeof event.data === 'undefined') return;
          if (event.data.size === 0) return;
          chunks.push(event.data);
        });

        recorder.addEventListener('stop', () => {
          const recording = new Blob(chunks, {
            type: mimeType,
          });
          renderRecording(recording, recordings);
          chunks = [];
        });

        recordButton.removeAttribute('hidden');
        recordButton.addEventListener('click', () => {
          if (recorder.state === 'inactive') {
            recorder.start();
            recordButton.innerText = '멈춤';
          } else {
            recorder.stop();
            recordButton.innerText = '녹음';
          }
        });
      } catch {
        alert(
          'You denied access to the microphone so this demo will not work.'
        );
      }
    });
  } else {
    alert(
      "Sorry, your browser doesn't support the MediaRecorder API, so this demo will not work."
    );
  }
});

function renderRecording(blob, list) {
  const blobUrl = URL.createObjectURL(blob);
  const li = document.createElement('li');
  const audio = document.createElement('audio');
  const anchor = document.createElement('a');
  anchor.setAttribute('href', blobUrl);
  const now = new Date();
  anchor.setAttribute(
    'download',
    `recording-${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${now.getDay().toString().padStart(2, '0')}--${now
      .getHours()
      .toString()
      .padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now
      .getSeconds()
      .toString()
      .padStart(2, '0')}.webm`
  );
  anchor.innerText = 'Download';
  audio.setAttribute('src', blobUrl);
  audio.setAttribute('controls', 'controls');
  li.appendChild(audio);
  li.appendChild(anchor);
  list.appendChild(li);
}
