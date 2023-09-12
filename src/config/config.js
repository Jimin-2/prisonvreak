export async function getServerConfig() {
  const protocolEndPoint = 'http://13.209.63.39:8081/config';
  const createResponse = await fetch(protocolEndPoint);
  return await createResponse.json();
}

export function getRTCConfiguration() {
  let config = {};
  config.sdpSemantics = 'unified-plan';
  config.iceServers = [{ urls: ['stun:13.209.63.39:3478'] },
    {urls: ['turn:13.209.63.39:3478?transport=tcp'],
    username: 'canpv',
    credential: 'can1234'},
    {urls: ['turn:13.209.63.39:3478?transport=udp'],
      username: 'canpv',
      credential: 'can1234'}];
  return config;
}
