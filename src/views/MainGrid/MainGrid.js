import React, { Component } from 'react';
import classNames from 'classnames';
import style from './MainGrid.module.css';
import DataView from "../../components/DataView/DataView";
import MessageView from "../../components/MessageView/MessageView";
import MapView from "../../components/MapView/MapView";
import ConfigService from '../../service/ConfigService'
import PropTypes from "prop-types";
import { connect } from 'react-redux';
import ServerService from '../../service/ServerService.ts';
import { TriggerPanel } from '../../components/TriggerPanel';
import { LocalizationService } from '../../service';
import Messages from '../../i18n/Messages';
import Snackbar from '../../components/Snackbar/Snackbar';
import { DIDState } from '../../constant/DIDState';
import InfoTable from '../../components/InfoTable/InfoTable';

class MainGrid extends Component {

    static propTypes = {
        call: PropTypes.object,
        navbar: PropTypes.object,
    };

    constructor() {
        super();

        this.serverService = ServerService.getInstance();
        this.intl = LocalizationService.getInstance();
        this.state = {
            currentLocations: null,
        };

        const triggerConfig = ConfigService.get('triggers');
        this.triggers = !triggerConfig ? [] : triggerConfig.map(x => {
            x.title = this.intl.getTextFromLanguageObject(x.title);
            return x;
        });
    }

    getUiConfig = (...path) => ConfigService.get('ui', ...path);

    isMessageViewEnabled = () => this.getUiConfig('messageView', 'enabled');
    isMapViewEnabled = () => this.getUiConfig('mapView', 'enabled');
    isDataViewEnabled = () => this.getUiConfig('dataView', 'enabled');

    getMapInfoColumnClass = () => this.isMessageViewEnabled() ? 'col-md-6' : '';
    getMessageColumnClass = () => (this.isMapViewEnabled() || this.isDataViewEnabled()) ? 'col-md-6' : 'col-xl-12';
    getMessageOnlyCssClass = () => !this.isMapViewEnabled() && !this.isDataViewEnabled() ? style.MessageOnly : '';

    getCurrentLocations() {
        if (this.state.currentLocations)
            return this.state.currentLocations;

        return this.getLocations();
    }

    // temporary - until state management is defined
    getNameAttributeFromAdditionalProperties() {
        const data = this.getData();
        if (data) {
            const filtered = data.filter(x => x.name === 'name');

            if (filtered.length > 0)
                return filtered[0].value;
        }

        return '';
    }

    handleSetLocations = (locations) => {
        this.setState({
            // toggle - if same object was set before, set it to null
            currentLocations: locations !== this.state.currentLocations ? locations : null
        });
    }

    handleShowLatestLocations = () => {
        this.setState({
            currentLocations: null
        });
    }

    handleEndCall = () => {
        this.serverService.endCall(this.getCallId());
    };

    handleSendMessage = (call, message, uri) => {
        this.serverService.sendMessage(call.callId, message, uri);
    };

    handleTimeBarChange = (progress) => {
        // Time travelling should reset current locations
        this.handleShowLatestLocations();
        this.serverService.timeTravel(this.getCallId(), progress);
    }

    handleTargetChange = (targetUri) => {
        this.serverService.updateCall(this.getCallId(), {
            targetUri: targetUri,
        });
    }

    executeTrigger = (trigger) => {
        this.serverService.executeTrigger(trigger.id, this.getCallId());
        Snackbar.show(this.intl.formatMessage(Messages.manualTriggerRequested, {
            id: trigger.id,
        }));
    }

    isReplay = () => this.getSelectedCall().isReplay;

    getSelectedCall = () => this.props.call.selected;
    getCallId = () => this.getSelectedCall().callId;
    getMessages = () => this.getSelectedCall().messages;
    getData = () => this.getSelectedCall().data;
    getLocations = () => this.getSelectedCall().messageLocations;
    getReplayInstruction = () => this.isReplay() ? this.props.call.replays.find(x => x.callId === this.getCallId()) : undefined;

    render() {
        // This can happen, if a call is started via url query-parameter
        // View is already visible, but store is updated right afterwards
        // So there is one update, where there is no selectedCall
        if (!this.getSelectedCall())
            return null;

        const { cap, didState } = this.getSelectedCall();;
        const isDataColumnEnabled = this.isDataViewEnabled() || this.isMapViewEnabled();

        let didMsg;
        switch (didState) {
            case DIDState.CAN_NOT_RESOLVE:
                didMsg = Messages['didState.canNotResolve'];
                break;
            case DIDState.RESOLVING:
                didMsg = Messages['didState.resolving'];
                break;
            case DIDState.UNRESOLVED:
                didMsg = undefined;
                break;
            default:
                didMsg = Messages.unknown;
        }

        const data = this.getData();
        let mapMarkerTooltip = undefined;
        if (data && data._device && data._device.type) {
            const { type, name } = data._device;

            // this shows a tooltip on the main map marker
            // e.g. it can provide some additional information about IoT devices
            mapMarkerTooltip = <span>
                <strong>{type}</strong>
                {name ? <><br /> {name}</> : undefined}
            </span>;
        }

        const locations = this.getLocations();
        const civicLocation = locations.find(x => x.civic !== undefined);

        return (<div className={classNames('container-fluid', style.Column, this.getMessageOnlyCssClass())}>
            <div className={classNames('row', style.Row)}>
                {isDataColumnEnabled ?
                    <div className={classNames(this.getMapInfoColumnClass(), style.Column, style.ScrollContainer)}>
                        {this.props.navbar}
                        {(this.isMapViewEnabled()) ?
                            <MapView
                                markerTooltip={mapMarkerTooltip}
                                currentLocations={this.state.currentLocations}
                                locations={locations} /> : ''}
                        {this.triggers.length > 0 ?
                            <TriggerPanel
                                triggers={this.triggers}
                                onExecuteTrigger={this.executeTrigger}
                            />
                            : null}
                        {
                            this.isDataViewEnabled() && cap ?
                                // TODO: translate
                                <InfoTable
                                    title={"CAP-Data"}
                                    className={'panel-info'}
                                    data={cap} /> : ''
                        }
                        {
                            civicLocation ?
                                // TODO: translate
                                <InfoTable
                                    title={"Civic Location"}
                                    className={'panel-info'}
                                    data={civicLocation.civic} /> : ''
                        }
                        {
                            this.isDataViewEnabled() ?
                                <DataView
                                    placeholder={didMsg ? this.intl.formatMessage(didMsg) : null}
                                    data={data} /> : ''
                        }
                    </div> : ''
                }
                {(this.isMessageViewEnabled()) ?
                    <div className={classNames(this.getMessageColumnClass(), style.Column)}>
                        {!isDataColumnEnabled ? this.props.navbar : null}
                        <MessageView
                            onSendMessage={this.handleSendMessage}
                            onEndCall={this.handleEndCall}
                            call={this.getSelectedCall()}
                            replayInstruction={this.getReplayInstruction()}
                            onSetLocations={this.handleSetLocations}
                            onShowLatestLocations={this.handleShowLatestLocations}
                            onTimeBarChange={this.handleTimeBarChange}
                            onTargetChange={this.handleTargetChange}
                            currentLocations={this.state.currentLocations}
                        />
                    </div>
                    : ''}
            </div>
        </div>);
    }
}

export default connect(model => ({
    call: model.call,
}))(MainGrid);
