import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import style from './MessageView.css';
import LocalizationProvider from "../../provider/LocalizationProvider";
import Messages from '../../i18n/Messages';
import ModalDialog from "../ModalDialog/ModalDialog";
import Message from "../Message/Message";
import MessageUtilities from "../../utilities/MessageUtilities";
// temporary - until state management is defined
// eslint-disable-next-line
import MessageStateQualifier from "../../constant/MessageStateQualifier";

class MessageView extends Component {

    static propTypes = {
        title: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
        onSendMessage: PropTypes.func,
        onEndCall: PropTypes.func,
        onShowLatestLocations: PropTypes.func,
        onSetLocations: PropTypes.func,
        conversation: PropTypes.object,
        currentLocations: PropTypes.array
    };

    constructor() {
        super();
        this.messageElements = {};
        this.state = {message: ''}
    }

    componentDidUpdate(prevProps) {
        this.messageText.focus();

        if (prevProps.conversation.messages &&
            this.props.conversation.messages &&
            MessageUtilities.getTextMessages(prevProps.conversation.messages).length !== MessageUtilities.getTextMessages(this.props.conversation.messages).length) {
            this.scrollToBottom();
        }
    }

    hasCallEnded() {
        return this.props.conversation && this.props.conversation.state && this.props.conversation.state >= 4;
    }

    isUiDisabled() {
        return (this.props.conversation && this.props.conversation.callId && !this.hasCallEnded()) ? "" : "disabled";
    }

    getTextMessages() {
        if (this.props.conversation && this.props.conversation.messages) {
            // reverse, because messages are always ordered descending by timeReceived
            return MessageUtilities.getTextMessages(this.props.conversation.messages).reverse();
        }
    }

    // temporary - until state management is defined
    getTitle() {
        // let state = `${LocalizationProvider.formatMessage(Messages.callState)}: `;
        // state +=  LocalizationProvider.formatMessage(Messages[MessageStateQualifier["0"]]);
        // if (this.props.conversation && this.props.conversation.state) {
        //     state = LocalizationProvider.formatMessage(Messages[MessageStateQualifier[this.props.conversation.state]]);
        // }
        // return state;

        let title = this.props.title;
        if(!Array.isArray(title)) {
            title = [title];
        }
        
        return title.map((x) => <span key={x}>{x}</span>);
    }

    // temporary - until state management is defined
    getTitleClass(){
        // let state = "";
        // if (this.props.conversation && this.props.conversation.state) {
        //     state = style[MessageStateQualifier[this.props.conversation.state].split(".")[1]];
        // }
        // return state;

        if(this.hasCallEnded())
            return style.error;
        
        return style.inCall;
    }

    scrollToBottom() {
        if (Object.keys(this.messageElements).length > 0) {
            const lastKey = Object.keys(this.messageElements)[Object.keys(this.messageElements).length - 1];
            this.messageElements[lastKey].scrollIntoView();
        }
    }

    handleSendClick = () => {
        if (!this.state.message.trim())
            return;

        if (this.props.onSendMessage) {
            this.props.onSendMessage(this.state.message, this.props.conversation.callId);
        }
        this.setState({message: ""});
    };

    handleDeleteClick = () => {
        this.setState({message: ""});
    };

    handleMessageChange = (evt) => {
        this.setState({message: evt.target.value});
    };

    handlePrintMessageClick = () => {
        window.print();
    };

    handleShowOnMapClick = () => {
        if(this.props.onShowLatestLocations)
            this.props.onShowLatestLocations();
    };

    handleMessageKeyUp = (event) =>{
        if(event.key === 'Enter'){
            this.handleSendClick();
        }
    };

    handleEndEmergencyClick = () => {
        ModalDialog.confirm(Messages.endEmergencyCallMessage, () => {
            if (this.props.onEndCall) {
                this.props.onEndCall(this.props.conversation.callId);
            }
        });
    };

    handleSetLocations = (locations) => {
        if(this.props.onSetLocations) {
            this.props.onSetLocations(locations);
        }
    }

    render() {
        const { formatMessage } = LocalizationProvider;

        return (<div className={style.PanelWrapper}>
            <div className={classNames('panel panel-primary', style.Panel, style.noBorder)}>
                <div className={classNames(style.Title, this.getTitleClass())}>{this.getTitle()}</div>

                <div className={classNames('panel-body', style.PanelBody)}>
                    <div className={style.MessageWrapper}>
                        {this.getTextMessages().map((message, index) =>
                                <Message
                                    key={index}
                                    text={message.getMessageText()}
                                    timeReceived={message.getTimeReceived()}
                                    origin={message.getOrigin()}
                                    locations={message.getLocations()}
                                    currentLocations={this.props.currentLocations}
                                    onSetLocations={this.handleSetLocations}
                                    ref={(el) => {
                                        this.messageElements[index] = el;
                                    }} />
                        )}
                    </div>
                </div>
                <div className={classNames('panel-footer', 'noPrint', style.Footer)}>

                    <div><textarea
                        disabled={this.isUiDisabled()}
                        ref={(input) => {
                            this.messageText = input;
                        }}
                        rows={3}
                        className={classNames('form-control', style.TextInput)}
                        placeholder={formatMessage(Messages.message)}
                        onKeyUp={this.handleMessageKeyUp}
                        value={this.state.message} onChange={this.handleMessageChange} />
                    </div>
                    <div className={style.MessageButtonContainer}>
                        <span className={style.MessageButtonGroup}>
                            <button
                                disabled={this.isUiDisabled()}
                                className={classNames("btn btn-default", style.MessageButton)}
                                onClick={this.handleDeleteClick}>
                                <span className="glyphicon glyphicon-trash" /> {formatMessage(Messages.clear)}
                            </button>
                            <button
                                className={classNames("btn btn-default", style.MessageButton)}
                                onClick={this.handlePrintMessageClick}>
                                <span className="glyphicon glyphicon-print" /> {formatMessage(Messages.print)}
                            </button>
                            <button
                                className={classNames("btn btn-default", style.MessageButton)}
                                onClick={this.handleShowOnMapClick}>
                                <span className="glyphicon glyphicon-globe" /> {formatMessage(Messages.showAllLocationsOnMap)}
                            </button>
                        </span>
                    </div>
                    <div className={style.MessageButtonContainer}>
                        <span className={style.MessageButtonGroup}>
                            <button
                                disabled={this.isUiDisabled()}
                                type="button"
                                className={classNames("btn btn-danger", style.MessageButton)}
                                onClick={this.handleEndEmergencyClick}>
                                <span className="glyphicon glyphicon-phone-alt" /> {formatMessage(Messages.endEmergencyCall)}
                            </button>
                        </span>
                        <span className={style.MessageButtonGroup}>
                            <button
                                disabled={this.isUiDisabled()}
                                type="button"
                                className={classNames("btn btn-default", style.MessageButton)}
                                onClick={this.handleSendClick}>
                                <span className="glyphicon glyphicon-send" /> {formatMessage(Messages.send)}
                            </button>
                        </span>
                    </div>
                </div>
            </div>
        </div>);
    }
}

export default MessageView;
