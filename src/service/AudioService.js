import DebugService from "./DebugService";

class AudioService {
  audio;

  constructor(fileName) {
    this.audio = new Audio(fileName);
  }

  play() {
    try {
      this.audio.play();
    } catch (e) {
      // happens if user hasn't interacted with the document
      DebugService.getInstance().error('Audio playback is not possible on this device. Interaction with document is required first.');
    }
  }

  pause() {
    this.audio.pause();
  }

  stop() {
    this.pause();
    this.audio.currentTime = 0.0;
  }

  replay() {
    this.stop();
    this.play();
  }
}

export default AudioService;