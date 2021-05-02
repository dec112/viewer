import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import * as Actions from "../../actions";
import classNames from 'classnames';
import style from './Overview.module.css';
import PropTypes from "prop-types";
import Messages from "../../i18n/Messages";
import { sort } from "../../utilities/ArrayUtilities";
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { CALL } from '../../constant/Routes';
import { PACKAGE } from '../../config/config';
import ServerService from '../../service/ServerService';
import InfoTable from '../../components/InfoTable/InfoTable';
import { LocalizationService} from '../../service/LocalizationService';
import DateTimeService from '../../service/DateTimeService';
import { CALL_ID, REUSE_SESSION, API_KEY, SESSION_KEY } from '../../constant/QueryParam';
import { getQueryString, getCalledService } from '../../utilities';
import { getInstance as getNoficationService } from '../../service/NotificationService';
import Snackbar from '../../components/Snackbar/Snackbar';
import * as CallState from '../../constant/CallState';

class Overview extends Component {

    static propTypes = {
        call: PropTypes.object,
        navbar: PropTypes.object,
        selectCall: PropTypes.func,
        setCallsInitialized: PropTypes.func,
    };

    constructor() {
        super();

        this.intl = LocalizationService.getInstance();
        this.serverService = ServerService.getInstance();
        this.dateTimeService = DateTimeService.getInstance();
        this.notificationService = getNoficationService();

        this.state = {
            callId: "",
            isNotificationServiceActive: this.notificationService.isActive(),
        };
    }

    componentDidMount() {
        if (!this.props.call.callsInitialized) {
            this.props.setCallsInitialized(true);
            this.serverService.getCalls();
        }
    }

    openCall(call) {
        // this is necessary as we only want to fetch CallReplays on demand
        this.serverService.selectCall(call.callId);
        this.props.selectCall(call);
        this.props.history.push(CALL);
    }

    handleCallClick = (call) => {
        this.openCall(call);
    }

    getState(call) {
        const { formatMessage } = this.intl;

        if (call.isReplay)
            return formatMessage(Messages.callReplay);

        const callState = call.stateId;
        if (callState) {
            return formatMessage(Messages[CallState.toI18nKey(callState)]);
        }
        return "";
    }

    getActiveCalls() {
        let calls = this.props.call.all.filter(x =>
            (x.isActive || x.isReplay) && !x.isTest
        );
        return sort(calls, x => x.created, true);;
    }

    handleOpenCallClick = () => {
        window.open(this.getQueryString(this.state.callId));
    };

    handleCallIdChange = (evt) => {
        this.setState({ callId: evt.target.value });
    };

    isCallIdValid = () => {
        const { callId } = this.state;

        return callId && callId.length > 0
    };

    getQueryString = (callId) => {
        const urlObj = {};

        // we take existing paramters into account
        new URL(window.location.href).searchParams.forEach((val, key) => {
            urlObj[key] = val;
        });

        urlObj[CALL_ID] = callId;

        // this is just to ensure that we don't add the "reuse_session" paramter
        // if there is an already existing "api_key" (v1) or "session" (v2)
        // as it is impossible to reuse the session, as it is not saved to storage, if those parameters are specified
        // yeah, you might argue that this logic does not belong here
        // but at least for now, it will stay here, ok?
        if (!urlObj[API_KEY] && !urlObj[SESSION_KEY])
            urlObj[REUSE_SESSION] = true;

        return getQueryString(urlObj);
    }

    getCallIdInputClass = () => {
        // this can be used for callId validations
        // the function still exsits due to some previous validations being done here
        return '';
    }

    onNotificationCheckboxChange = async (evt) => {
        const newState = evt.target.checked;
        await this.notificationService.setActive(newState);

        const isActive = this.notificationService.isActive();
        this.setState({
            isNotificationServiceActive: isActive,
        });

        // if user want's to activate it but browser actually denies it
        // show a message
        if (newState === true && isActive === false) {
            debugger;
            const id = Messages['notification.missingPermission'];
            const msg = this.intl.formatMessage(id);
            Snackbar.error(msg);
        }
    }

    render() {
        const { formatMessage } = this.intl;

        return (<div className={classNames('container-fluid', style.Container)}>
            {this.props.navbar}
            <div className="panel panel-success">
                <div className="panel-heading">{formatMessage(Messages.emergencyCallsPanelHeader)}</div>
                <div className="panel-body">
                    <table className={classNames("table", style.Table)}>
                        <thead>
                            <tr>
                                <th>{formatMessage(Messages.service)}</th>
                                <th>{formatMessage(Messages.callerName)}</th>
                                <th>{formatMessage(Messages.callTime)}</th>
                                <th>{formatMessage(Messages.callIdentifier)}</th>
                                <th>{formatMessage(Messages.callState)}</th>
                                <th className={style.Center}>{formatMessage(Messages.newTab)}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.getActiveCalls().map((call) => {
                                const replayClass = call.isReplay ? style.IsReplay : null;

                                return (
                                    <tr
                                        className={classNames(style.CallRow, replayClass)}
                                        key={call.callId}>
                                        {/* 
                                        oh gosh, it is so ugly to see so many event handlers 
                                        but as there are nested click handlers, I think this is the only correct solution
                                        */}
                                        <td onClick={() => this.handleCallClick(call)}>{getCalledService(call, this.intl)}</td>
                                        <td onClick={() => this.handleCallClick(call)}>{call.callerName}</td>
                                        <td onClick={() => this.handleCallClick(call)}>{this.dateTimeService.toDateTime(call.created)}</td>
                                        <td onClick={() => this.handleCallClick(call)}>{call.callId}</td>
                                        <td onClick={() => this.handleCallClick(call)}>{this.getState(call)}</td>
                                        <td className={style.Center}>
                                            <a
                                                href={this.getQueryString(call.callId)}
                                                // we need referrer details, as otherwise our session might be erased
                                                // eslint-disable-next-line react/jsx-no-target-blank
                                                target="_blank">
                                                <span className="glyphicon glyphicon-new-window" />
                                            </a>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="row">
                <div className="col-md-8">
                    <div className="panel panel-info">
                        <div className="panel-heading">{formatMessage(Messages.searchCallIdPanelHeader)}</div>
                        <div className="panel-body">
                            <div className={classNames("input-group", this.getCallIdInputClass())}>
                                <input type="text" className={classNames("form-control")}
                                    value={this.state.callId}
                                    onChange={this.handleCallIdChange}
                                    placeholder={formatMessage(Messages.searchCallId)} />
                                <span className={"input-group-btn"}>
                                    <button onClick={this.handleOpenCallClick}
                                        disabled={!this.isCallIdValid()}
                                        className={"btn btn-default"}
                                        type="button">{formatMessage(Messages.openCall)}</button>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="panel panel-info">
                        <div className="panel-heading">{formatMessage(Messages.notifications)}</div>
                        <div className="panel-body">
                            <p>
                                {formatMessage(Messages['notification.info.line1'])}<br />
                                {formatMessage(Messages['notification.info.line2'])}<br />
                                {formatMessage(Messages['notification.info.line3'])}
                            </p>
                            <div className="checkbox">
                                <label>
                                    <input
                                        type="checkbox"
                                        onChange={(evt) => this.onNotificationCheckboxChange(evt)}
                                        checked={this.state.isNotificationServiceActive}
                                    />{formatMessage(Messages[`notification.status.${this.state.isNotificationServiceActive ? 'active' : 'inactive'}`])}</label>
                            </div>
                        </div>
                    </div>
                    <InfoTable
                        title={`${formatMessage(Messages.appName)} ${formatMessage(Messages.information)}`}
                        className={'panel-default'}
                        data={{
                            [formatMessage(Messages.version)]: PACKAGE.version,
                            [formatMessage(Messages.server)]: this.serverService.connection.url,
                            'Navigator': navigator.userAgent,
                        }} />
                </div>
            </div>
        </div>);
    }
}

export default withRouter(connect(model => ({
    call: model.call,
}), dispatch => bindActionCreators(Actions, dispatch))(Overview));
