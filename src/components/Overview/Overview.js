import React, { Component } from 'react';
import classNames from 'classnames';
import style from './Overview.css';
import PropTypes from "prop-types";
import LocalizationProvider from "../../provider/LocalizationProvider";
import Messages from "../../i18n/Messages";
import MessageStateQualifier from "../../constant/MessageStateQualifier";
import ArrayUtilities from "../../utilities/ArrayUtilities";
import DateTimeUtilities from '../../utilities/DateTimeUtilities'
import Navbar from "../../components/Navbar/Navbar";
import LanguageService from '../../service/LanguageService';

class Overview extends Component {

    static propTypes = {
        calls: PropTypes.array,
        onCallClick: PropTypes.func,
        onLogout: PropTypes.func,
        onNavTitleClick: PropTypes.func,
        isAlertMode: PropTypes.bool,
    };

    constructor() {
        super();
        this.state = {callId: ""};
    }

    openCall(callId, newTab) {
        if (this.props.onCallClick && callId) {
            this.props.onCallClick(callId, newTab);
        }
    }

    handleCallClick(event, callId, newTab) {
        // prevents bubbling up of event if "new tab" icon is clicked in table
        // otherwise, "onCallClick" would be triggered twice if "new tab" icon was clicked
        if (event.defaultPrevented)
            return;

        this.openCall(callId, newTab);
        event.preventDefault();
    }

    getState(callState) {
        if (callState) {
            return LocalizationProvider.formatMessage(Messages[MessageStateQualifier[callState]]);
        }
        return "";
    }

    getCalls() {
        let calls = [];
        if (this.props.calls && this.props.calls.length > 0) {
            calls = this.props.calls;
            ArrayUtilities.reverse(calls, "timeReceived");
        }
        return calls;
    }

    handleOpenCallClick = () => {
        this.openCall(this.state.callId);
    };

    handleCallIdChange = (evt) => {
        this.setState({callId: evt.target.value});
    };

    handleLogoutClick = () => {
        if(this.props.onLogout) {
            this.props.onLogout();
        }
    }

    handleNavTitleClick = () => {
        if (this.props.onNavTitleClick) {
            this.props.onNavTitleClick();
        }
    }

    render() {
        const {formatMessage} = LocalizationProvider;
        return (<div className={classNames('container-fluid', style.Container)}>
            <Navbar
                onLogout={this.handleLogoutClick}
                onTitleClick={this.handleNavTitleClick}
                isAlertMode={this.props.isAlertMode} />
            <div className="panel panel-success">
                <div className="panel-heading">{formatMessage(Messages.emergencyCallsPanelHeader)}</div>
                <div className="panel-body">
                    <table className={classNames("table", style.Table)}>
                        <thead>
                            <tr>
                                <th>{formatMessage(Messages.callIdentifier)}</th>
                                <th>{formatMessage(Messages.callTime)}</th>
                                <th>{formatMessage(Messages.callerUri)}</th>
                                <th>{formatMessage(Messages.callState)}</th>
                                <th className={style.Center}>{formatMessage(Messages.newTab)}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.getCalls().length > 0 ? this.getCalls().map((call) =>
                                <tr className={style.CallRow} 
                                    key={call.getCallId()}
                                    onClick={(event) => this.handleCallClick(event, call.getCallId(), false)}>
                                    <td>{call.getCallId()}</td>
                                    <td>{DateTimeUtilities.toDateTime(call.getTimeReceived(), LanguageService.getInstance().getCurrentLanguage())}</td>
                                    <td>{call.getCallerUri()}</td>
                                    <td>{this.getState(call.getState())}</td>
                                    <td className={style.Center}
                                        onClick={(event) => this.handleCallClick(event, call.getCallId(), true)}> 
                                        <span className="glyphicon glyphicon-new-window" />
                                    </td>
                                </tr>
                            ) : <tr></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
            <div>
                <div className="panel panel-info">
                    <div className="panel-heading">{formatMessage(Messages.searchCallIdPanelHeader)}</div>
                    <div className="panel-body">
                        <div className={"input-group"}>
                            <input type="text" className={"form-control"}
                                value={this.state.callId}
                                onChange={this.handleCallIdChange}
                                placeholder={formatMessage(Messages.searchCallId)} />
                            <span className={"input-group-btn"}>
                                <button onClick={this.handleOpenCallClick}
                                    className={"btn btn-default"}
                                    type="button">{formatMessage(Messages.openCall)}</button>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>);
    }
}

export default Overview;
