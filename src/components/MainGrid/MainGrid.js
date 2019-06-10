import React, { Component } from 'react';
import classNames from 'classnames';
import style from './MainGrid.module.css';
import DataView from "../DataView/DataView";
import MessageView from "../MessageView/MessageView";
import Navbar from "../Navbar/Navbar"
import MapView from "../MapView/MapView";
import ConfigService from '../../service/ConfigService'
import DateTimeService from '../../service/DateTimeService';
import Origin from '../../constant/Origin';
import PropTypes from "prop-types";
import LocalizationProvider from '../../provider/LocalizationProvider';
import Messages from '../../i18n/Messages';

class MainGrid extends Component {

    static propTypes = {
        onSendMessage: PropTypes.func,
        conversation: PropTypes.object,
        additionalInformation: PropTypes.arrayOf(PropTypes.object),
        locations: PropTypes.arrayOf(PropTypes.object),
        onEndCall: PropTypes.func,
        onLogout: PropTypes.func,
        onNavTitleClick: PropTypes.func,
        isAlertMode: PropTypes.bool,
    };

    componentWillMount() {
        this.setState({
            currentLocations: null
        });
    }

    isMessageViewEnabled() {
        return ConfigService.getConfig().ui.messageView.enabled;
    }

    isMapViewEnabled() {
        return ConfigService.getConfig().ui.mapView.enabled;
    }

    isDataViewEnabled() {
        return ConfigService.getConfig().ui.dataView.enabled;
    }

    getMapInfoColumnClass() {
        return this.isMessageViewEnabled() ? 'col-md-6' : '';
    }

    getMessageColumnClass() {
        return (this.isMapViewEnabled() || this.isDataViewEnabled()) ? 'col-md-6' : 'col-xl-12';
    }

    getMessageOnlyCssClass(){
        return !this.isMapViewEnabled() && !this.isDataViewEnabled() ? style.MessageOnly : '';
    }

    getMessageViewTitle() {
        let title = [this.getNameAttributeFromAdditionalProperties()];
        
        let latestMessage = this.props.conversation.messages.filter(x => x.origin === Origin.REMOTE)[0];
        if (latestMessage)
            title.push(LocalizationProvider.formatMessage(Messages.latestSignal, {value: DateTimeService.getInstance().toDateTime(latestMessage.timeReceived)}));

        return title;
    }

    getCurrentLocations() {
        if (this.state && this.state.currentLocations)
            return this.state.currentLocations;

        return this.props.locations;
    }

    // temporary - until state management is defined
    getNameAttributeFromAdditionalProperties(){
        if(this.props.additionalInformation) {
            const filtered = this.props.additionalInformation.filter(x=>x.name === 'name');
            
            if(filtered.length > 0)
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

    handleOnLogout = () => {
        if(this.props.onLogout) {
            this.props.onLogout();
        }
    }

    handleNavTitleClick = () => {
        if(this.props.onNavTitleClick) {
            this.props.onNavTitleClick();
        }
    }

    render() {
        return (<div className={classNames('container-fluid', style.Column, this.getMessageOnlyCssClass())}>
            <div className={classNames('row', style.Row)}>
                {(this.isDataViewEnabled() || this.isMapViewEnabled()) ?
                    <div className={classNames(this.getMapInfoColumnClass(), style.Column, style.ScrollContainer)}>
                        <Navbar
                            onLogout={this.handleOnLogout}
                            onTitleClick={this.handleNavTitleClick}
                            isAlertMode={this.props.isAlertMode} />
                        {(this.isMapViewEnabled()) ? 
                        <MapView
                            currentLocations={this.state.currentLocations}
                            locations={this.props.locations} /> : ''}
                        {(this.isDataViewEnabled()) ? 
                        <DataView 
                            additionalInformation={this.props.additionalInformation} /> : ''}
                    </div> : ''
                }
                {(this.isMessageViewEnabled()) ?
                    <div className={classNames(this.getMessageColumnClass(), style.Column)}>
                        <MessageView onSendMessage={this.props.onSendMessage}
                                     onEndCall={this.props.onEndCall}
                                     conversation={this.props.conversation}
                                     onSetLocations={this.handleSetLocations}
                                     onShowLatestLocations={this.handleShowLatestLocations}
                                     currentLocations={this.state.currentLocations}
                                     // temporary - until state management is defined
                                     title={this.getMessageViewTitle()}/>
                    </div>
                    : ''}
            </div>
        </div>);
    }
}

export default MainGrid;
