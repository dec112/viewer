class SessionStorageService {

  static SESSON_STORAGE = window.sessionStorage;

  static INSTANCE = new SessionStorageService();

  static getInstance() {
    return SessionStorageService.INSTANCE;
  }

  static getItem(key) {
    return this.SESSON_STORAGE.getItem(key);
  }

  static setItem(key, value) {
    this.SESSON_STORAGE.setItem(key, value);
  }

  static removeItem(key) {
    this.SESSON_STORAGE.removeItem(key);
  }
}

export default SessionStorageService;
