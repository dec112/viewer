import { StorageKey } from "../constant";
import Messages from "../i18n/Messages";
import { LocalizationService } from "./LocalizationService";
import { StorageService } from "./StorageService";

class NotificationService {
  public static INSTANCE: NotificationService;

  private _isActive: boolean = false;

  constructor(
    public storage: StorageService,
    public localization: LocalizationService,
  ) {
    this._isActive = this.hasPermission() && this.storage.getItem(StorageKey.NOTIFICATION_ACTIVE) === 'true';
  }

  private requestPermission = async () => {
    if (!this.isSupported())
      return undefined;

    return Notification.requestPermission();
  }

  private hasPermission = (): boolean => this.isSupported() && Notification.permission === 'granted';

  isSupported = (): boolean => {
    return 'Notification' in window;
  }

  isActive = () => this._isActive;

  setActive = async (active: boolean) => {
    if (!this.isSupported())
      return;

    this._isActive = active;

    if (active && !this.hasPermission()) {
      await this.requestPermission();
      this._isActive = active && this.hasPermission();
    }

    this.storage.setItem(StorageKey.NOTIFICATION_ACTIVE, this._isActive ? 'true' : 'false');
  }

  send = async (options?: NotificationOptions) => {
    if (!this.isActive())
      return;

    return new Notification(this.localization.formatMessage(Messages.appName) as string, options);
  }
}

export const getInstance = () => NotificationService.INSTANCE;
export const initialize = (
  storage: StorageService,
  localization: LocalizationService,
) => {
  if (!NotificationService.INSTANCE) {
    NotificationService.INSTANCE = new NotificationService(
      storage,
      localization,
    );
  }

  return NotificationService.INSTANCE;
}