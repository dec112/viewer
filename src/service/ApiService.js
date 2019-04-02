import SessionItemKey from "../constant/SessionItemKey";
import SessionStorageService from "./SessionStorageService";
import UrlUtilities from '../utilities/UrlUtilities'
import QueryParam from '../constant/QueryParam';

class ApiService {

    static INSTANCE;

    static initialize(locationObject) {
        if(!ApiService.INSTANCE)
            ApiService.INSTANCE = new ApiService(locationObject);

        return ApiService.getInstance();
    }

    static getInstance() {
        return ApiService.INSTANCE;
    }

    constructor(locationObject) {
        const urlParams = UrlUtilities.getUrlParameter(locationObject.search);
        if (urlParams[QueryParam.API_KEY])
            this.key = decodeURIComponent(urlParams[QueryParam.API_KEY]);
        else
            this.key = SessionStorageService.getItem(SessionItemKey.API_KEY);
    }

    hasKey() {
        return !!this.key;
    }

    getKey() {
        return this.key;
    }

    setKey(apiKey) {
        this.key = apiKey;
        SessionStorageService.setItem(SessionItemKey.API_KEY, apiKey);
    }

    removeKey(apiKey) {
        if(this.key === apiKey || apiKey === undefined || apiKey === null) {
            this.key = undefined;
            SessionStorageService.removeItem(SessionItemKey.API_KEY);
        }
    }
}

export default ApiService;
