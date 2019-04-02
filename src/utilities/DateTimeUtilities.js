class DateTimeUtilities {
  static toDateTime(date, locale) {
    if (!date)
      return '';

    if (!(date instanceof Date))
      date = DateTimeUtilities.parse(date);

    return date.toLocaleString(locale);
  }

  static parse(dateString) {
    return new Date(dateString);
  }

}

export default DateTimeUtilities