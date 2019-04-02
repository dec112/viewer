class DebugService {
  static INSTANCE;

  isDebug = false;

  constructor(isDebug) {
    this.isDebug = isDebug;
  }

  static initialize(isDebug) {
    if (!DebugService.INSTANCE)
      DebugService.INSTANCE = new DebugService(isDebug);
  }

  static getInstance() {
    return DebugService.INSTANCE;
  }

  should() {
    return this.isDebug;
  }

  log(msg) {
    if (this.should())
      console.log(msg);
  }

  info(msg) {
    if (this.should())
      console.info(msg);
  }
}

export default DebugService