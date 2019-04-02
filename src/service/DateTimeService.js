// TODO: avoid this import by implementing everything here
import DateTimeUtilities from '../utilities/DateTimeUtilities';
import LanguageService from './LanguageService';

class DateTimeService {
  static INSTANCE = new DateTimeService();

  static getInstance() {
    return DateTimeService.INSTANCE;
  }

  toDateTime(date) {
    return DateTimeUtilities.toDateTime(date, LanguageService.getInstance().getCurrentLanguage());
  }
}

export default DateTimeService