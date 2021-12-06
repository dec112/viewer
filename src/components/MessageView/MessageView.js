import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import style from './MessageView.module.css';
import Messages from '../../i18n/Messages';
import ModalDialog from "../ModalDialog/ModalDialog";
import Message from "../Message/Message";
import MessageUtilities from "../../utilities/MessageUtilities.ts";
import { getPossibleTargets } from "../../utilities/TargetUtitilies";
import DateTimeService from '../../service/DateTimeService';
import Origin from '../../constant/Origin';
import * as CoreUtil from '../../utilities';
import { LocalizationService } from '../../service/LocalizationService';
import { SnippetPanel, Snippet } from '../SnippetPanel/SnippetPanel';
import ConfigService from '../../service/ConfigService';
import { ReplayControlPanel } from '../ReplayPanel/ReplayControlPanel';
import { getCalledService } from '../../utilities';
import * as CallState from '../../constant/CallState';
import { Icon, IconType } from '../Icon';
import { DurationComponent } from '../DurationComponent';
import { ExportButton, ExportTypeCopyToClipboard, ExportTypePrint } from '../ExportButton';
import { Select, SelectStyle } from '../Select';

class MessageView extends Component {

    static propTypes = {
        onSendMessage: PropTypes.func,
        onEndCall: PropTypes.func,
        onShowLatestLocations: PropTypes.func,
        onSetLocations: PropTypes.func,
        onTimeBarChange: PropTypes.func,
        onTargetChange: PropTypes.func,
        call: PropTypes.object,
        replayInstruction: PropTypes.object,
        currentLocations: PropTypes.array
    };

    constructor() {
        super();
        this.intl = LocalizationService.getInstance();
        this.messageElements = [];

        const snipps = ConfigService.get('ui', 'messageView', 'snippets');
        this.snippets = snipps ? snipps.map(x => new Snippet(
            this.intl.getTextFromLanguageObject(x.text),
            this.intl.getTextFromLanguageObject(x.title),
            x.shortcut,
        )) : [];

        this.state = {
            message: '',
            showSnippetContainer: false,
            messageCount: 0,
        }
    }

    componentDidMount() {
        // setTimeout is necessary for Chrome instantly scrolling down
        // otherwise, there is always a delay, until the next message arrives
        // don't ask me why, I was just happy to have it resolved this way
        // I didn't want to invest too much time into this issue
        // To a certain extent, I'm sorry.
        setTimeout(() => this.scrollToBottom(), 0);
        this.focusMessageText();
    }

    componentDidUpdate() {
        // ok, I'm sorry. This is bad practice
        // To do this correctly, you should compare previous props to current props
        // But this requires our redux store to be immutable (have immutable objects)
        // This, in fact, requires us to clone...everything.
        // Which is not great for performance and even tricky when it comes to typescript
        // The problem is "getter" and "setter" methods that are attached to a class
        // The are not going to be cloned by using the object spread operator {...var}
        // Maybe somewhere in the future, there will be a very fine solution to this
        // (or maybe there is one and I just don't know)
        // ...
        // But now it's your task, mighty reader...find out!
        // And only come back, if you have a solution AND beer!

        const { messageCount: previousMessageCount } = this.state;
        const currMessages = this.getMessages() || [];
        const currLength = MessageUtilities.getDisplayableMessages(currMessages).length;

        if (previousMessageCount !== currLength) {
            this.scrollToBottom();

            this.setState({
                messageCount: currLength,
            });
        }
    }

    getCall = () => this.props.call;
    getReplayInstruction = () => this.props.replayInstruction;
    getMessages = () => this.getCall().messages;
    getCalledService = () => getCalledService(this.getCall(), this.intl);

    getTargetSelectValues = () => getPossibleTargets(this.getCall()).map(x => ({
        key: x.id,
        value: x.targetUri,
        text: this.intl.getTextFromLanguageObject(x.title),
    }));

    isCallActive = () => this.getCall().isActive;
    isUiDisabled = () => !this.isCallActive() || this.isReplay();
    isSendButtonDisabled = () => this.isUiDisabled() || !this.state.message;
    isReplay = () => this.getCall().isReplay;
    isShowCurrentLocationsDisabled = () => !this.props.currentLocations;

    getTextMessages() {
        // reverse, because messages are always ordered descending by timeReceived
        return CoreUtil.sort(MessageUtilities.getDisplayableMessages(this.getMessages()), x => x.received);
    }

    getTitle() {
        const { formatMessage } = this.intl;

        const latestMessage = CoreUtil.sort(this.getMessages().filter(x => x.origin === Origin.REMOTE), x => x.received, true)[0];

        const call = this.getCall();
        const { stateId, displayName } = call;
        let warning;

        switch (stateId) {
            case CallState.STALE:
                warning = this.intl.formatMessage(Messages['callState.stale']);
                break;
            case CallState.CLOSED_BY_SYSTEM:
                warning = this.intl.formatMessage(Messages['callState.closedBySystem']);
                break;
            default:
                warning = null;
        }

        let latestComponent;
        if (latestMessage) {
            const { received } = latestMessage;
            // we only want to show duration, if call is still active
            // otherwise, we just show a date-time
            // this is also important for CallReplays, as a duration wouldn't make sense
            latestComponent = call.isActive && !call.isReplay ?
                <DurationComponent
                    prefix={this.intl.formatMessage(Messages.latestSignal, { value: '' })}
                    date={received}
                /> :
                <span>
                    {formatMessage(Messages.latestSignal, { value: DateTimeService.getInstance().toDateTime(received) })}
                </span>
        }

        return (
            <div className={classNames(style.Title, style.SpaceBetween, this.getTitleClass())}>
                <strong>
                    <span>{formatMessage(Messages.service)}: {this.getCalledService()}</span>
                    {
                        displayName ?
                            <span> | {formatMessage(Messages.contact)}: {displayName}</span>
                            : undefined
                    }
                </strong>
                {latestComponent}
                {
                    warning ?
                        <div className={style.WarningBanner}>
                            <Icon
                                className={style.MarginRight}
                                type={IconType.EXCLAMATION_SIGN}
                            />
                            {warning}
                        </div> :
                        null
                }
            </div>
        );
    }

    getTitleClass() {
        if (this.isReplay())
            return style.isReplay;

        if (this.isUiDisabled())
            return style.isStateError;

        if (this.getCall().stateId === CallState.STALE)
            return style.isStateWarning;

        return style.isStateOk;
    }

    showSnippetContainer = () => this.state.showSnippetContainer && this.hasSnippets() && !this.isUiDisabled();
    hasSnippets() {
        const snipps = this.getSnippets();
        return snipps && snipps.length > 0;
    }

    getSnippets() {
        return this.snippets;
    }

    scrollToBottom() {
        if (this.messageElements.length === 0)
            return;

        const message = this.messageElements[this.messageElements.length - 1];
        // actually this happens, if the last message is removed while time travelling
        // the update comes in, but the messageList is still in the old state
        // therefore the element can be null
        if (message) {
            message.scrollIntoView();
        }
    }

    focusMessageText = () => {
        if (this.messageText)
            this.messageText.focus();
    }

    handleSendClick = () => {
        const msg = this.state.message.trim();

        if (!msg)
            return;

        if (this.props.onSendMessage) {
            this.props.onSendMessage(msg, this.getCall());
        }
        this.setState({ message: "" });
    };

    handleDeleteClick = () => {
        this.setState({ message: "" });
        this.focusMessageText();
    };

    handleMessageChange = (evt) => {
        this.setState({ message: evt.target.value });
    };

    handleShowOnMapClick = () => {
        if (this.props.onShowLatestLocations)
            this.props.onShowLatestLocations();
    };

    handleMessageKeyUp = (event) => {
        if (event.key === 'Enter' && event.shiftKey !== true) {
            this.handleSendClick();
        }
    };

    handleEndEmergencyClick = () => {
        ModalDialog.confirm(this.intl.formatMessage(Messages.endEmergencyCallMessage), () => {
            if (this.props.onEndCall) {
                this.props.onEndCall();
            }
        });
    };

    handleSetLocations = (locations) => {
        if (this.props.onSetLocations) {
            this.props.onSetLocations(locations);
        }
    }


    handleSnippetCallback = (snippet) => {
        this.appendToMessage(snippet.text);
        this.focusMessageText();
    }

    handleTargetChange = (targetSelectValue) => {
        if (this.props.onTargetChange)
            this.props.onTargetChange(targetSelectValue);
    }

    timeBarChange = (progress) => {
        if (this.props.onTimeBarChange)
            this.props.onTimeBarChange(progress);
    }

    toggleSnippetsContainer = () => {
        this.setState({
            showSnippetContainer: !this.state.showSnippetContainer,
        });
    }

    appendToMessage = (text) => {
        this.setState({
            message: this.state.message + text,
        });
    }

    render() {
        const { formatMessage } = this.intl;

        const replayClass = this.isReplay() ? style.isReplay : null;
        const call = this.getCall();

        this.messageElements = [];

        let children;
        if (this.isReplay()) {
            children = (
                <ReplayControlPanel
                    call={call}
                    replayInstruction={this.getReplayInstruction()}
                    onProgressChange={this.timeBarChange}
                />
            )
        }
        else {
            children = (
                <div>
                    {this.hasSnippets() ?
                        <SnippetPanel
                            snippets={this.getSnippets()}
                            callback={this.handleSnippetCallback}
                            hidden={!this.showSnippetContainer()}
                            disabled={this.isUiDisabled()}
                        /> : null}
                    <div className={classNames(style.MessageContainer, 'input-group')}>
                        <textarea
                            disabled={this.isUiDisabled()}
                            ref={(input) => {
                                this.messageText = input;
                            }}
                            rows={3}
                            className={classNames('form-control', style.TextInput)}
                            placeholder={formatMessage(Messages.messageInstruction, {
                                send: formatMessage(Messages.send),
                                enter: '\u21b5',
                            })}
                            onKeyUp={this.handleMessageKeyUp}
                            value={this.state.message} onChange={this.handleMessageChange} />
                        <span className={classNames(style.AutoWidth, 'input-group-btn')}>
                            <button
                                disabled={this.isUiDisabled()}
                                className={classNames("btn btn-default", style.MessageButton)}
                                onClick={this.handleDeleteClick}>
                                <span className="glyphicon glyphicon-trash" /></button>
                        </span>
                    </div>
                </div>
            )
        }

        const targets = this.getTargetSelectValues();

        return (<div className={style.PanelWrapper}>
            <div className={classNames('panel panel-primary', style.Panel, style.noBorder)}>
                {this.getTitle()}

                <div className={classNames('panel-body', style.PanelBody)}>
                    <div className={style.MessageWrapper}>
                        {this.getTextMessages().map((msg, index) =>
                            <Message
                                key={`${msg.uniqueId}`}
                                message={msg}
                                currentLocations={this.props.currentLocations}
                                onSetLocations={this.handleSetLocations}
                                ref={(el) => {
                                    this.messageElements.push(el);
                                }} />
                        )}
                    </div>
                </div>
                <div className={classNames('panel-footer', 'noPrint', style.Footer, replayClass)}>

                    {children}

                    <div className={style.MessageButtonGroup}>
                        <ExportButton
                            className={style.MessageButton}
                            exportTypes={[
                                ExportTypePrint(),
                                ExportTypeCopyToClipboard(call.stringify()),
                            ]}></ExportButton>
                        <button
                            disabled={this.isShowCurrentLocationsDisabled()}
                            className={classNames("btn btn-default", style.MessageButton)}
                            onClick={this.handleShowOnMapClick}>
                            <span className="glyphicon glyphicon-globe" /> {formatMessage(Messages.showAllLocationsOnMap)}
                        </button>
                        {this.hasSnippets() && !this.isReplay() ?
                            <button
                                className={classNames(
                                    'btn',
                                    'btn-default',
                                    this.state.showSnippetContainer ? 'active' : null,
                                    style.MessageButton,
                                )}
                                onClick={this.toggleSnippetsContainer}
                                disabled={this.isUiDisabled()}>
                                <span className={classNames('glyphicon', 'glyphicon-pencil')} /> {formatMessage(Messages.snippets)}
                            </button> : null
                        }
                        <span className={style.CallIdentifier}>
                            <strong className={style.Opaque}>
                                <span>{formatMessage(Messages.callIdentifier)}:</span> {call.callId}
                            </strong>
                        </span>
                    </div>
                    {this.isReplay() ? null :
                        <div className={style.SpaceBetween}>
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
                                {
                                    targets && targets.length > 0 ?
                                        <div className="input-group">
                                            <span className="input-group-addon" id="basic-addon1">{formatMessage(Messages.via)}:</span>
                                            <Select
                                                style={SelectStyle.BUTTON}
                                                disabled={this.isUiDisabled()}
                                                values={targets}
                                                selected={this.getCall().targetUri}
                                                onChange={this.handleTargetChange}
                                            />
                                        </div> :
                                        undefined
                                }

                                <button
                                    disabled={this.isSendButtonDisabled()}
                                    type="button"
                                    className={classNames("btn btn-success", style.MessageButton)}
                                    onClick={this.handleSendClick}>
                                    <span className="glyphicon glyphicon-send" /> {formatMessage(Messages.send)}
                                </button>
                            </span>
                        </div>
                    }
                </div>
            </div>
        </div>);
    }
}

export default MessageView;
