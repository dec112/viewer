import CommonUtilities from "../utilities/CommonUtilities"
import DeepAssign from "deep-assign";

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

    static getConfig() {
        return ConfigService.getInstance().getConfig();
    }

    constructor(internalConfig, externalConfig, client) {
        this.internalConfig = internalConfig;
        this.externalConfig = externalConfig;

        this.config = null;

        this.setClient(client);
    }

    setClient(client) {
        this.config = CommonUtilities.deepCopy(this.internalConfig);
        DeepAssign(this.config, this.externalConfig);

        if (client) {
            DeepAssign(this.config, this.externalConfig.clients[client]);
        }

        delete this.config.clients;

        return this.getConfig();
    }

    getConfig() {
        return this.config;
    }
}

export default ConfigService