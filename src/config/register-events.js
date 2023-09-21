const InputEvent = {
  Keyboard: 0,
  Mouse: 1,
  MouseWheel: 2,
  Touch: 3,
  ButtonClick: 4,
  Gamepad: 5
};


export function sendClickEvent(channel, videoPlayer, elementId) {
  let data = new DataView(new ArrayBuffer(3));
  data.setUint8(0, InputEvent.ButtonClick);
  data.setInt16(1, elementId, true);
  videoPlayer && videoPlayer.sendMsg(channel, data.buffer);
}
