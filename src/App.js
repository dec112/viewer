import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { LocalizationService} from "./service/LocalizationService";
import * as Actions from "./actions";
import PropTypes from "prop-types";
import ServerService from "./service/ServerService.ts";
import MainGrid from "./views/MainGrid/MainGrid";
import ModalDialog from './components/ModalDialog/ModalDialog'
import Snackbar from "./components/Snackbar/Snackbar";
import style from './App.module.css';
import UrlUtilities from "./utilities/UrlUtilities";
import Overview from "./views/Overview/Overview";
import { ConnectorState, ConnectorStateReason} from "./constant/ConnectorState";
import Login from "./views/Login/Login";
import { CenteredView } from './views/CenteredView/CenteredView';
import ConfigService from './service/ConfigService';
import AudioService from './service/AudioService';
import AudioFile from './constant/AudioFile';
import Messages from './i18n/Messages'
import Navbar from './components/Navbar/Navbar';
import { HOME, CALL } from './constant/Routes';
import {
    Switch,
    Route,
    withRouter,
} from "react-router-dom";
import { ServerMessage } from './constant';
import { ResponseErrorReason } from './mappers';
import { SSLWarning } from './components/SSLWarning';
import { getInstance as getNotificationService } from './service/NotificationService';

class DEC112 extends Component {

    static propTypes = {
        localization: PropTypes.object,
        urlParameter: PropTypes.object,
        call: PropTypes.object,
        selectCall: PropTypes.func,
        setCurrentUserLanguage: PropTypes.func,
        setUrlParameter: PropTypes.func,
        setLoggedIn: PropTypes.func,
        loginState: PropTypes.object,

        /* real props */
        callId: PropTypes.string,
        reuseSession: PropTypes.bool,
    };

    constructor() {
        super();
        this.configService = ConfigService.getInstance();
        this.localizationService = LocalizationService.getInstance();
        this.audioService = new AudioService(AudioFile.NOTIFICATION);
        this.notificationService = getNotificationService();

        this.state = {
            hasDirectlyStartedWithCall: false,
        }
    }

    async componentWillMount() {
        const query = UrlUtilities.getUrlParameter(window.location.search);
        this.props.setUrlParameter(query);
        if (!this.props.localization.currentUserLanguage) {
            this.props.setCurrentUserLanguage(this.localizationService.getCurrentLanguage());
        }

        // default routing
        this.goHome(true);

        // handle logout on tab close
        window.onbeforeunload = () => this.serverService.close();
    }

    async componentDidMount() {
        await this.initializeCommunication();
    }

    componentDidUpdate() {
        const { call, callId } = this.props;
        const { hasDirectlyStartedWithCall } = this.state;

        if (!!callId && this.isLoggedIn() && hasDirectlyStartedWithCall === false) {
            const c = call.all.find(x => x.callId === callId);

            if (c) {
                this.props.selectCall(c);
                this.goTo(CALL);
                this.setState({
                    hasDirectlyStartedWithCall: true,
                });
            }
        }
    }

    initializeCommunication = async () => {
        const { formatMessage } = this.localizationService;
        const serv = this.serverService = ServerService.getInstance();
        serv.addStatusChangedListener((status, reason) => {
            switch (status) {
                case ConnectorState.OPEN:
                    break;
                case ConnectorState.ERROR:
                    ModalDialog.alert(formatMessage(Messages['connectionState.error']));
                    break;
                case ConnectorState.CLOSED:
                    if (reason === ConnectorStateReason.UNEXPECTED) {
                        this.handleLogout();
                        ModalDialog.alert(formatMessage(Messages['connectionState.closed']));
                    }
                    break;
                default:
                    ModalDialog.alert(formatMessage(Messages['connectionstate.unknown']));
            }
        });

        serv.addLoginChangedListener(this.handleLoginChange);
        serv.addNewCallListener(this.handleNewCall);
        serv.addErrorListener(this.handleError);
        serv.addMessageListener(this.handleServerMessage);

        const { callId, reuseSession } = this.props;
        // if there is a callId and we should not reuse the last session
        // (ergo, viewer is started by a border trigger)
        // we do want to restore our connection with config data
        // as we don't want to rely on what's in the storage
        const useConfigEndpoint = !!(callId && reuseSession !== true);

        try {
            await serv.tryRestoreConnection(useConfigEndpoint);
        } catch {
            /* we need to catch this error, otherwise we'll have an uncaught promise */
            /* real error handling is done within the error callback of ServerService */
        }
    }

    goTo = (path, overwrite = false) => this.props.history[overwrite ? 'replace' : 'push'](path);
    goHome = (overwrite) => this.goTo(HOME, overwrite);

    getLocaleMessages = () => this.localizationService.getMessages();
    getSelectedCall = () => this.props.call.selected;
    getActiveCalls() {
        let calls = [];
        
        if(this.props.call && this.props.call.all) {
            calls = this.props.call.all.filter(call => call.isActive);
        }

        return calls;
    }

    isLoggedIn = () => this.props.loginState.loggedIn;

    // isAlertMode is true if no call is selected, or if there is at least one unselected call still available
    // CallReplays must not be taken into account
    isAlertMode = () => {
        const selectedCall = this.getSelectedCall();
        return this.getActiveCalls()
            .filter(
                call => call !== selectedCall &&
                    !call.isReplay &&
                    !call.isTest
            ).length > 0;
    }

    handleLoginChange = (isAuthenticated) => {
        // yeah, i know, we check twice if user isAuthenticated
        // but we have to issue subscribeCalls before setting logged in state
        // as otherwise, react will re-render before and view "Overview" will trigger a "getCalls" server requst
        // but as we want to do a subscribe calls BEFORE getting calls, we have to check twice here
        if (isAuthenticated)
            this.serverService.subscribeCalls();

        this.props.setLoggedIn(isAuthenticated);

        if (!isAuthenticated)
            return;

        const { callId } = this.props;

        if (callId) {
            this.serverService.subscribeAndGetCall(callId);
            this.goTo(CALL, true);
        }
        else {
            this.goHome();
        }
    };

    handleNewCall = (call) => {
        if (call.isTest) {
            return;
        }

        this.audioService.replay();

        this.notificationService.send({
            body: this.localizationService.formatMessage(Messages['notification.incomingCall']),
            requireInteraction: true,
            vibrate: true,
        });
    };

    handleLogout = async () => {
        if (!this.isLoggedIn())
            return;

        await this.serverService.logout();
        this.props.setLoggedIn(false);

        this.serverService.close();
    }

    handleError = (responseError) => {
        let { reason, message } = responseError;
        if (reason === ResponseErrorReason.UNAUTHORIZED && !message) {
            message = this.localizationService.formatMessage(Messages.unauthorizedRequest);
        }

        Snackbar.error(message);
    }

    handleServerMessage = (message, data) => {
        const { formatMessage } = this.localizationService

        switch (message) {
            case ServerMessage.TRIGGER_EXECUTED:
                Snackbar.success(formatMessage(Messages.manualTriggerExecuted, {
                    id: data.id,
                }));
                break;
            default:
        }
    }

    handleNavBackClick = () => {
        this.goHome();
        this.props.selectCall(null);
    }

    getNavigation = (showBackIcon = false) => {
        return (
            <Navbar
                onLogout={this.handleLogout}
                onBackClick={this.handleNavBackClick}
                showBackIcon={showBackIcon}
                isAlertMode={this.isAlertMode()} />
        );
    }

    render() {
        let children;

        const { formatMessage } = this.localizationService;
        const { callId, call } = this.props;

        // display loading screen as long as this specific call is not loaded
        if (callId && !call.all.find(x => x.callId === callId)) {
            if (this.isLoggedIn()) {
                children = (
                    <CenteredView>
                        <h1>{formatMessage(Messages.appName)}</h1>
                        <p>{formatMessage(Messages.callLoading, { id: callId })}...</p>
                    </CenteredView>
                );
            }
            else {
                children = (
                    <CenteredView>
                        <h1>{formatMessage(Messages.appName)}</h1>
                    </CenteredView>
                )
            }
        }
        else if (this.isLoggedIn()) {
            children = (
                <Switch>
                    <Route path={CALL}>
                        <MainGrid navbar={this.getNavigation(true)} />
                    </Route>
                    <Route path={HOME}>
                        <Overview navbar={this.getNavigation()} />
                    </Route>
                </Switch>
            )
        }
        else
            children = (
                <Login />
            )

        return (
            <div className={style.RootContent}>
                <SSLWarning />
                {children}
                <ModalDialog />
                <Snackbar />
            </div>
        );
    }
}

export default withRouter(connect(model => ({
    localization: model.localization,
    conversation: model.conversation,
    basicInformation: model.basicInformation,
    urlParameter: model.urlParameter,
    mapData: model.mapData,
    call: model.call,
    loginState: model.loginState,
}), dispatch => bindActionCreators(Actions, dispatch))(DEC112));
