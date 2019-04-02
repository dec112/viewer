class NavigationService {

    static INSTANCE = new NavigationService();

    static getInstance() {
        return NavigationService.INSTANCE;
    }

    _getCurrentPath() {
        return window.location.pathname;
    }

    _getLocation(location, query) {
        return location + (query ? `?${query}` : '');
    }

    navigateTo(location, query) {
        window.location.href = this._getLocation(location, query);
    }

    appendQuery(query) {
        this.navigateTo(this._getLocation(this._getCurrentPath(), query));
    }

    removeQuery() {
        this.navigateTo(this._getCurrentPath());
    }

    open(location, query) {
        window.open(this._getLocation(location, query));
    }

    openCurrent(query) {
        this.open(this._getCurrentPath(), query);
    }
}

export default NavigationService;
