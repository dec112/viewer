class LocalizationProvider {
    static PROVIDER = null;

    static formatMessage(message, options){
        return LocalizationProvider.PROVIDER.formatMessage(message, options);
    }

    static formatDate(date, options){
        return LocalizationProvider.PROVIDER.formatDate(date, options);
    }
}

export default LocalizationProvider;
