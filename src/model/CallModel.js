class CallModel {
    constructor(builder) {
        this.timeReceived = builder.timeReceived;
        this.callerId = builder.callerId;
        this.callId = builder.callId;
        this.alternativeCallId = builder.alternativeCallId;
        this.callerUri = builder.callerUri;
        this.state = builder.state;
    }

    static get Builder() {
        class Builders {
            withCallerId(callerId) {
                this.callerId = callerId;
                return this;
            }

            withCallId(callId) {
                this.callId = callId;
                return this;
            }

            withAlternativeCallId(alternativeCallId) {
                this.alternativeCallId = alternativeCallId;
                return this;
            }

            withCallerUri(callerUri) {
                this.callerUri = callerUri;
                return this;
            }

            withState(state) {
                this.state = state;
                return this;
            }

            withTimeReceived(timeReceived) {
                this.timeReceived = timeReceived;
                return this;
            }

            build() {
                return new CallModel(this);
            }
        }

        return Builders;
    }

    getCallerId() {
        return this.callerId;
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

    getState() {
        return this.state;
    }

    setState(state) {
        this.state = state;
    }
}

export default CallModel;