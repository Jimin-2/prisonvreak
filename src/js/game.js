import { SendVideo } from "./sendvideo.js";
import { getServerConfig, getRTCConfiguration } from "../config/config.js";
import { createDisplayStringArray } from "../config/stats.js";
import { VideoPlayer } from "../config/videoplayer.js";
import { RenderStreaming } from "../config/renderstreaming.js";
import { Signaling, WebSocketSignaling } from "../config/signaling.js";
import {sendClickEvent} from "../config/register-events.js";

/** @type {Element} */
let playButton;
/** @type {RenderStreaming} */
let renderstreaming;
/** @type {boolean} */
let useWebSocket;

const localVideo = document.getElementById('localVideo');
const playerDiv = document.getElementById('player');

/** @type {SendVideo} */
let sendVideo = new SendVideo(localVideo);
let channel;
const connectionId = document.getElementById("connectionId").textContent;
let audioDevice;

const codecPreferences = document.getElementById('codecPreferences');
const supportsSetCodecPreferences = window.RTCRtpTransceiver &&
    'setCodecPreferences' in window.RTCRtpTransceiver.prototype;
const messageDiv = document.getElementById('message');
messageDiv.style.display = 'none';
const lockMouseCheck = document.getElementById('lockMouseCheck');
const videoPlayer = new VideoPlayer();

setup();

window.document.oncontextmenu = function () {
  return false;     // cancel default menu
};

window.addEventListener('beforeunload', async () => {
  if(!renderstreaming)
    return;
  await renderstreaming.stop();
}, true);

async function setup() {
  const res = await getServerConfig();
  useWebSocket = res.useWebSocket;
  setUpInputSelect();
  await sendVideo.startLocalVideo(audioDevice);
  showCodecSelect();
  showPlayButton();
  onClickPlayButton();
}

function showPlayButton() {
  if (!document.getElementById('playButton')) {
    const elementPlayButton = document.createElement('img');
    elementPlayButton.id = 'playButton';
    elementPlayButton.src = '/img/Play.png';
    elementPlayButton.alt = 'Start Streaming';
    playButton = document.getElementById('player').appendChild(elementPlayButton);
    playButton.addEventListener('click', onClickPlayButton);
  }
}

function onClickPlayButton() {
  playButton.style.display = 'none';

  // add video player
  videoPlayer.createPlayer(playerDiv, lockMouseCheck);
  setupRenderStreaming();

  const cctv_1 = document.getElementById('CCTV-1');
  // playerDiv.appendChild(cctv_1);
  cctv_1.addEventListener("click", function () {
    sendClickEvent(channel, videoPlayer, 1);
  });

  const cctv_2 = document.getElementById('CCTV-2');
  // playerDiv.appendChild(cctv_2);
  cctv_2.addEventListener("click", function () {
    sendClickEvent(channel, videoPlayer, 2);
  });

  const cctv_3= document.getElementById('CCTV-3');
  // playerDiv.appendChild(cctv_3);
  cctv_3.addEventListener("click", function () {
    sendClickEvent(channel, videoPlayer, 3);
  });

  const cctv_4= document.getElementById('CCTV-4');
  // playerDiv.appendChild(cctv_4);
  cctv_4.addEventListener("click", function () {
    sendClickEvent(channel, videoPlayer, 4);
  });

  const cctv_5= document.getElementById('CCTV-5');
  // playerDiv.appendChild(cctv_5);
  cctv_5.addEventListener("click", function () {
    sendClickEvent(channel, videoPlayer, 5);
  });

  const cctv_6= document.getElementById('CCTV-6');
  cctv_6.addEventListener("click", function () {
    sendClickEvent(channel, videoPlayer, 6);
  });

  const sabotage= document.getElementById('sabotage');
  sabotage.addEventListener("click", function () {
    sendClickEvent(channel, videoPlayer, 7);
  });

  const opendoor= document.getElementById('opendoor');
  opendoor.addEventListener("click", function () {
    sendClickEvent(channel, videoPlayer, 8);
  });

}

async function setupRenderStreaming() {
  codecPreferences.disabled = true;

  const signaling = useWebSocket ? new WebSocketSignaling() : new Signaling();
  const config = getRTCConfiguration();
  renderstreaming = new RenderStreaming(signaling, config);
  renderstreaming.onConnect = onConnect;
  renderstreaming.onDisconnect = onDisconnect;
  renderstreaming.onTrackEvent = (data) => {
    const direction = data.transceiver.direction;
    console.log(direction);
    if (direction == "sendrecv" || direction == "recvonly") {
      videoPlayer.addTrack(data.track);
    }
  };
  renderstreaming.onGotOffer = setCodecPreferences;

  await renderstreaming.start();
  await renderstreaming.createConnection(connectionId);
}

function onConnect() {
  channel = renderstreaming.createDataChannel();
  console.log(channel);
  const tracks = sendVideo.getLocalTracks();
  for (const track of tracks) {
    renderstreaming.addTransceiver(track, { direction: 'sendonly' });
  }
  showStatsMessage();
}

async function onDisconnect(connectionId) {
  clearStatsMessage();
  messageDiv.style.display = 'block';
  messageDiv.innerText = `Disconnect peer on ${connectionId}.`;

  await renderstreaming.stop();
  renderstreaming = null;
  videoPlayer.deletePlayer();
  if (supportsSetCodecPreferences) {
    codecPreferences.disabled = false;
  }
  deleteRoom(connectionId);
  showPlayButton();
  setTimeout(()=>{
    document.location.href='/';
  },1000);
}

function setCodecPreferences() {
  /** @type {RTCRtpCodecCapability[] | null} */
  let selectedCodecs = null;
  if (supportsSetCodecPreferences) {
    const preferredCodec = codecPreferences.options[codecPreferences.selectedIndex];
    if (preferredCodec.value !== '') {
      const [mimeType, sdpFmtpLine] = preferredCodec.value.split(' ');
      const { codecs } = RTCRtpSender.getCapabilities('video');
      const selectedCodecIndex = codecs.findIndex(c => c.mimeType === mimeType && c.sdpFmtpLine === sdpFmtpLine);
      const selectCodec = codecs[selectedCodecIndex];
      selectedCodecs = [selectCodec];
    }
  }
  if (selectedCodecs == null) {
    return;
  }
  const transceivers = renderstreaming.getTransceivers().filter(t => t.receiver.track.kind === "video");
  if (transceivers && transceivers.length > 0) {
    transceivers.forEach(t => t.setCodecPreferences(selectedCodecs));
  }
}

function showCodecSelect() {
  if (!supportsSetCodecPreferences) {
    messageDiv.style.display = 'block';
    messageDiv.innerHTML = `Current Browser does not support <a href="https://developer.mozilla.org/en-US/docs/Web/API/RTCRtpTransceiver/setCodecPreferences">RTCRtpTransceiver.setCodecPreferences</a>.`;
    return;
  }

  const codecs = RTCRtpSender.getCapabilities('video').codecs;
  codecs.forEach(codec => {
    if (['video/red', 'video/ulpfec', 'video/rtx'].includes(codec.mimeType)) {
      return;
    }
    const option = document.createElement('option');
    option.value = (codec.mimeType + ' ' + (codec.sdpFmtpLine || '')).trim();
    option.innerText = option.value;
    codecPreferences.appendChild(option);
  });
  codecPreferences.disabled = false;
}

/** @type {RTCStatsReport} */
let lastStats;
/** @type {number} */
let intervalId;

function showStatsMessage() {
  intervalId = setInterval(async () => {
    if (renderstreaming == null) {
      return;
    }

    const stats = await renderstreaming.getStats();
    if (stats == null) {
      return;
    }

    const array = createDisplayStringArray(stats, lastStats);
    if (array.length) {
      messageDiv.style.display = 'block';
      messageDiv.innerHTML = array.join('<br>');
    }
    lastStats = stats;
  }, 1000);
}

function clearStatsMessage() {
  if (intervalId) {
    clearInterval(intervalId);
  }
  lastStats = null;
  intervalId = null;
  messageDiv.style.display = 'none';
  messageDiv.innerHTML = '';
}
async function setUpInputSelect() {
  const deviceInfos = await navigator.mediaDevices.enumerateDevices();

  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    if (deviceInfo.kind === 'audioinput') {
      audioDevice = deviceInfo.deviceId;
      console.log(audioDevice);
      break;
    }
  }
}

function deleteRoom(connectionId){
  fetch('/deleteRoom', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ connectionId: connectionId })
  });
}

window.onbeforeunload = function () {
  fetch('/deleteRoom', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ connectionId: connectionId }),
    keepalive : true
  });
  return '';
}