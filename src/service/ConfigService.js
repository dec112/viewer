import * as CommonUtilities from "../utilities/CommonUtilities"
import { tryGet } from "../utilities";

class ConfigService {

    static INSTANCE;

    static initialize(internalConfig, externalConfig, client) {
        if (!ConfigService.INSTANCE)
            ConfigService.INSTANCE = new ConfigService(internalConfig, externalConfig, client);

        return ConfigService.getInstance();
    }

    static getInstance() {
        return ConfigService.INSTANCE;
    }

    static get(...path) {
        return ConfigService.getInstance().get(...path);
    }

    constructor(internalConfig, externalConfig, client) {
        this.internalConfig = internalConfig;
        this.externalConfig = externalConfig;

        this.serverConfig = null;
        this.config = null;
        this.client = null;

        this.setClient(client);
    }

    get(...path) {
        return tryGet(this.getConfig(), ...path);
    }

    mergeConfig() {
        this.config = CommonUtilities.deepCopy(this.internalConfig);
        this.config = CommonUtilities.deepAssign(this.config, this.externalConfig);

        if (this.serverConfig)
            this.config = CommonUtilities.deepAssign(this.config, this.serverConfig);

        const { client } = this;
        if (client) {
            const extConf = this.externalConfig;

            if (extConf.clients) {
                const extClientConf = extConf.clients[client];

                if (extClientConf)
                    this.config = CommonUtilities.deepAssign(this.config, extClientConf);
            }

        }

        delete this.config.clients;

        return this.getConfig();
    }

    setClient(client) {
        this.client = client;
        return this.mergeConfig();
    }

    setServerConfig(config) {
        this.serverConfig = config;
        this.mergeConfig();
    }

    getConfig() {
        return this.config;
    }
}

export default ConfigService