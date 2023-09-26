import * as Logger from "../config/logger.js";

export class SendVideo {
    constructor(localVideoElement) {
        this.localVideo = localVideoElement;
    }

    /**
     * @param {MediaTrackConstraints} audioSource
     */
    async startLocalVideo(audioSource) {
        try {
            const constraints = {
                audio: { deviceId: audioSource ? { exact: audioSource } : undefined }
            };

            const localStream = await navigator.mediaDevices.getUserMedia(constraints);
            this.localVideo.srcObject = localStream;
            await this.localVideo.play();
        } catch (err) {
            Logger.error(`mediaDevice.getUserMedia() error:${err}`);
        }
    }

    /**
     * @returns {MediaStreamTrack[]}
     */
    getLocalTracks() {
        return this.localVideo.srcObject.getTracks();
    }
}