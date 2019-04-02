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
}

export default UrlUtilities;