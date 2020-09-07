enum LogType {
  LOG = 'log',
  INFO = 'info',
  ERROR = 'error',
};

class DebugService {
  static INSTANCE: DebugService;

  private isDebug = false;
  public forceDebug = false;

  public logList: Array<{
    type: LogType,
    message: any,
  }> = [];

  constructor(isDebug: boolean) {
    this.isDebug = isDebug;
  }

  static initialize(isDebug: boolean) {
    if (!DebugService.INSTANCE)
      DebugService.INSTANCE = new DebugService(isDebug);
  }

  static getInstance() {
    return DebugService.INSTANCE;
  }

  should() {
    return this.isDebug || this.forceDebug;
  }

  log(msg: any) {
    if (this.should()) {
      console.log(msg);
    }

    this.logList.push({
      type: LogType.LOG,
      message: msg,
    })
  }

  info(msg: any) {
    if (this.should()) {
      console.info(msg);
    }

    this.logList.push({
      type: LogType.INFO,
      message: msg,
    });
  }

  error(msg: any) {
    if (this.should()) {
      console.error(msg);
    }

    this.logList.push({
      type: LogType.ERROR,
      message: msg,
    });
  }
}

// @ts-ignore
window.DEC112Debug = {
  enable: function () {
    DebugService.getInstance().forceDebug = true;
  },
  print: function () {
    const svc = DebugService.getInstance();

    for (const log of svc.logList) {
      const { message, type } = log;

      switch (type) {
        case LogType.LOG:
          console.log(message); break;
        case LogType.INFO:
          console.info(message); break;
        case LogType.ERROR:
          console.error(message); break;
      }
    }
  },
};

export default DebugService