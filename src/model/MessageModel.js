import DateTimeUtilities from "../utilities/DateTimeUtilities"

class MessageModel {
    constructor(builder) {
        this.texts = builder.texts;
        this.data = builder.data;
        this.timeReceived = DateTimeUtilities.parse(builder.timeReceived);
        this.timeCreated = DateTimeUtilities.parse(builder.timeCreated);
        this.locations = builder.locations.map(x => {
            return {
                timestamp: this.timeReceived,
                coords: {
                    longitude: x.lon || x.longitude,
                    latitude: x.lat || x.latitude
                },
                // rad sometimes is provided as number, sometimes as text
                // therefore a parse is used to ensure integrity
                radius: parseFloat(x.rad),
            }
        });
        this.callId = builder.callId;
        this.alternativeCallId = builder.alternativeCallId;
        this.callerUri = builder.callerUri;
        this.deviceId = builder.deviceId;
        this.origin = builder.origin;
        this.callerId = builder.callerId;
    }

    static get Builder() {
        class Builder {
            withCallerId(callerId) {
                this.callerId = callerId;
                return this;
            }

            withOrigin(origin) {
                this.origin = origin;
                return this;
            }

            withDeviceId(deviceId) {
                this.deviceId = deviceId;
                return this;
            }

            withTimeCreated(timeCreated) {
                this.timeCreated = timeCreated;
                return this;
            }

            withCallerUri(callerUri) {
                this.callerUri = callerUri;
                return this;
            }

            withAlternativeCallId(alternativeCallId) {
                this.alternativeCallId = alternativeCallId;
                return this;
            }

            withTexts(texts) {
                this.texts = texts;
                return this;
            }

            withData(data) {
                this.data = data;
                return this;
            }

            withLocations(locations) {
                this.locations = locations;
                return this;
            }

            withTimeReceived(timeReceived) {
                this.timeReceived = timeReceived;
                return this;
            }

            withCallId(callId) {
                this.callId = callId;
                return this;
            }

            build() {
                return new MessageModel(this);
            }
        }

        return Builder;
    }

    getCallerId() {
        return this.callerId;
    }

    getOrigin() {
        return this.origin;
    }

    getDeviceId() {
        return this.deviceId;
    }

    getTexts() {
        return this.texts;
    }

    getMessageText() {
        return this.texts.join("\r\n");
    }

    getData() {
        return this.data;
    }

    setData(data) {
        this.data = data;
    }

    getLocations() {
        return this.locations;
    }

    getTimeReceived() {
        return this.timeReceived;
    }

    getCallId() {
        return this.callId;
    }

    getAlternativeCallId() {
        return this.alternativeCallId;
    }

    getCallerUri() {
        return this.callerUri;
    }

    getTimeCreated() {
        return this.timeCreated;
    }
}

export default MessageModel;