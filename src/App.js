import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { IntlProvider, addLocaleData } from 'react-intl';
import enLocaleData from 'react-intl/locale-data/en';
import deLocalData from 'react-intl/locale-data/de';
import LocalizationService from "./service/LocalizationService";
import * as Actions from "./actions";
import PropTypes from "prop-types";
import LanguageService from "./service/LanguageService";
import WebsocketService from "./service/WebsocketService";
import MainGrid from "./components/MainGrid/MainGrid";
import ModalDialog from './components/ModalDialog/ModalDialog'
import Snackbar from "./components/Snackbar/Snackbar";
import Localization from "./components/LocalizationProvider/Localization";
import style from './App.css';
import UrlUtilities from "./utilities/UrlUtilities";
import Overview from "./components/Overview/Overview";
import WebsocketStatus from "./constant/WebsocketStatus";
import MessageState from "./constant/MessageState";
import QueryParam from './constant/QueryParam';
import Login from "./components/Login/Login";
import ApiService from "./service/ApiService";
import NavigationService from "./service/NavigationService";
import ConfigService from './service/ConfigService';
import AudioService from './service/AudioService';
import AudioFile from './constant/AudioFile';
import Messages from './i18n/Messages'

class DEC112 extends Component {

    static propTypes = {
        localization: PropTypes.object,
        conversation: PropTypes.object,
        urlParameter: PropTypes.object,
        basicInformation: PropTypes.arrayOf(PropTypes.object),
        mapData: PropTypes.object,
        calls: PropTypes.object,
        setCurrentUserLanguage: PropTypes.func,
        setUrlParameter: PropTypes.func,
        setMessage: PropTypes.func,
        setMessages: PropTypes.func,
        setData: PropTypes.func,
        addLocation: PropTypes.func,
        addCall: PropTypes.func,
        setLoggedIn: PropTypes.func,
        loginState: PropTypes.object,
        setMessageState: PropTypes.func,
    };
    
    constructor() {
        super();
        this.apiService = ApiService.getInstance();
        this.configService = ConfigService.getInstance();
        this.localizationService = LocalizationService.getInstance();
        this.languageService = LanguageService.getInstance();
        this.navigationService = NavigationService.getInstance();
        this.audioService = new AudioService(AudioFile.NOTIFICATION);
        addLocaleData([...deLocalData, ...enLocaleData]);
    }

    componentWillMount() {
        const query = UrlUtilities.getUrlParameter(window.location.search);
        this.props.setUrlParameter(query);
        if (!this.props.localization.currentUserLanguage) {
            this.props.setCurrentUserLanguage(this.languageService.getCurrentLanguage());
        }

        if (this.apiService.hasKey()) {
            this.initializeCommunication(query[QueryParam.CALL_ID], this.apiService.getKey());
        }
    }

    initializeCommunication(callId, apiKey) {
        // fallback to config if necessary
        if (!apiKey)
            apiKey = this.configService.getConfig().apiKey

        this.websocketService = WebsocketService.getInstance();
        this.websocketService.connect(apiKey);
        this.websocketService.onStatusChange((status) => {
            switch (status) {
                case WebsocketStatus.OPEN:
                    // seems that this key is a good one, let's set it to our service
                    this.setLoggedIn(apiKey);

                    if (callId) {
                        this.websocketService.subscribeCall(callId);
                    }
                    else {
                        this.websocketService.getCalls();
                    }
                    break;
                case WebsocketStatus.ERORR:
                    ModalDialog.alert(Messages['connectionState.error']);
                    this.apiService.removeKey(apiKey);
                    break;
                default:
                    break;
            }
        });
        this.websocketService.onMessage(this.handleOnMessage);
        this.websocketService.onNewCall(this.handleNewCall);
        this.websocketService.onMessageStateChange(this.handleMessageStateChange);
    }

    getMessages() {
        return this.localizationService.getMessages(this.props.localization.currentUserLanguage);
    }

    getActiveCalls() {
        let calls = [];
        
        if(this.props.calls && this.props.calls.calls) {
            calls = this.props.calls.calls.filter(message => 
                message.getState() !== MessageState.CLOSED_BY_CALLER
                && message.getState() !== MessageState.CLOSED_BY_CENTER
                && message.getState() !== MessageState.CLOSED_BY_SYSTEM);
        }
        
        return calls;
    }

    hasCallIdUrlParameter() {
        return Object.keys(this.props.urlParameter).length > 0 && this.props.urlParameter[QueryParam.CALL_ID];
    }

    setLoggedIn(apiKey) {
        this.configService.setClient(apiKey);

        if(apiKey) {
            this.apiService.setKey(apiKey);
        }
        else 
            this.apiService.removeKey();
        
        this.props.setLoggedIn(!!apiKey);
    }

    isLoggedIn() {
        return this.props.loginState.loggedIn;
    }

    isAlertMode() {
        return this.hasActiveCalls();
    }

    handleMessageStateChange = (message) => {
        this.props.setMessageState(message.getCallId(), message.getState());
    };

    hasActiveCalls() {
        return this.getActiveCalls().length > 0;
    }

    handleOnMessage = (messages) => {
        if (!Array.isArray(messages)) {
            messages = [messages];
        }

        this.props.setMessage(messages);
        
        let locs = [];
        let hasBasicInformation = this.props.basicInformation.length > 0;
        for (let message of messages) {
            if (!hasBasicInformation) {
                let data = message.getData();
                
                if (data.length > 0) {
                    this.props.setData(data);
                    hasBasicInformation = true;
                }
            }
            
            locs = locs.concat(message.getLocations());
        }

        this.props.addLocation(locs);
    };

    handleNewCall = (call) => {
        this.props.addCall(call);
        this.audioService.replay();
    };

    handleSendMessage = (message, callId) => {
        this.websocketService.send(message, callId);
    };

    handleEndCall = (callId) => {
        this.websocketService.endCall(callId);
        this.navigationService.removeQuery();
    };

    handleSetLoggedIn = (userName, password) => {
        this.initializeCommunication(null, userName);
    };

    handleCallClick = (callId, newTab) => {
        let query = `${QueryParam.CALL_ID}=${callId}`;

        if (newTab === true) {
            this.navigationService.openCurrent(query);
        } else {
            this.navigationService.appendQuery(query);
        }
    };

    handleLogout = () => {
        this.setLoggedIn(false);
    }

    handleNavTitleClick = () => {
        this.navigationService.removeQuery();
    }

    renderMain() {
        if (this.hasCallIdUrlParameter()) {
            return (<MainGrid locations={this.props.mapData.locations}
                              onSendMessage={this.handleSendMessage}
                              onEndCall={this.handleEndCall}
                              onLogout={this.handleLogout}
                              onNavTitleClick={this.handleNavTitleClick}
                              additionalInformation={this.props.basicInformation}
                              conversation={this.props.conversation}
                              isAlertMode={this.isAlertMode()}/>);
        }
        return (<Overview   calls={this.getActiveCalls()} 
                            onCallClick={this.handleCallClick}
                            onLogout={this.handleLogout}
                            onNavTitleClick={this.handleNavTitleClick}
                            isAlertMode={this.isAlertMode()}/>);
    }

    render() {
        return (
            <IntlProvider key={this.props.localization.currentUserLanguage}
                locale={this.props.localization.currentUserLanguage}
                messages={this.getMessages()}>
                <div className={style.RootContent}>
                    <Localization />
                    {this.isLoggedIn() ?
                        this.renderMain()
                        : <Login onSetLoggedIn={this.handleSetLoggedIn} />}
                    <ModalDialog />
                    <Snackbar />
                </div>
            </IntlProvider>
        );
    }
}

export default connect(model => ({
    localization: model.localization,
    conversation: model.conversation,
    basicInformation: model.basicInformation,
    urlParameter: model.urlParameter,
    mapData: model.mapData,
    calls: model.calls,
    loginState: model.loginState,
}), dispatch => bindActionCreators(Actions, dispatch))(DEC112);
