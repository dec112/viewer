class UrlUtilities {
    static getUrlParameter(url) {
        if (url.indexOf('?') > -1) {
            return url.split('?')[1].split('&')
                .map(str => {
                    let [key, value] = str.split('=');
                    return {[key]: decodeURI(value)};
                })
                .reduce((prev, curr) => Object.assign(prev, curr));
        }
        return {};
    }

    static getAbsoluteUrl(relativeUrl) {
        return window.location.origin +
            window.location.pathname +
            // remove leading slash as this is already included in pathname
            relativeUrl.slice(1);
    }
}

export default UrlUtilities;