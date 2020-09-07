import { LocalizationService } from './LocalizationService';

class DateTimeService {
  static INSTANCE = new DateTimeService();

  static getInstance() {
    return DateTimeService.INSTANCE;
  }

  constructor() {
    this.intl = LocalizationService.getInstance();
  }

  toDateTime(date) {
    if (!date)
      return '';

    if (!(date instanceof Date))
      date = DateTimeService.parse(date);

    return date.toLocaleString(this.intl.getCurrentLanguage());
  }

  static parse(dateString) {
    return new Date(dateString);
  }
}

export default DateTimeService