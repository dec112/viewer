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
import { SnippetPanel, mapSnippetsFromConfig } from '../SnippetPanel/SnippetPanel';
import ConfigService from '../../service/ConfigService';
import { ReplayControlPanel } from '../ReplayPanel/ReplayControlPanel';
import { getCalledService } from '../../utilities';
import * as CallState from '../../constant/CallState';
import { Icon, IconType } from '../Icon';
import { DurationComponent } from '../DurationComponent';
import { ExportButton, ExportTypeCopyToClipboard, ExportTypePrint } from '../ExportButton';
import { Select, SelectStyle } from '../Select';
import { TranslationService } from '../../service/TranslationService';

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

        this.snippets = mapSnippetsFromConfig(ConfigService.get('ui', 'messageView', 'snippets'));
        this.translationService = TranslationService.getInstance();

        this.state = {
            message: '',
            showSnippetContainer: false,
            messageCount: 0,

            isTranslationAvailable: this.translationService.isAvailable(),
            isTranslationActive: false,
            isTranslating: false,
            availableLanguages: undefined,
            translations: [],
            messageTranslation: '',
            isTranslationDirty: true,
            selectedRemoteLanguage: undefined,
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

    async componentDidUpdate(prevProps, prevState) {
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

        const {
            messageCount: previousMessageCount,
            isTranslationActive,
            isTranslationDirty,
            availableLanguages,
            selectedRemoteLanguage,
        } = this.state;
        const displayableMessages = this.getTextMessages();
        const currLength = displayableMessages.length;

        if (previousMessageCount !== currLength) {
            this.scrollToBottom();

            this.setState({
                messageCount: currLength,
            });
        }

        if (
            previousMessageCount !== currLength ||
            prevState.isTranslationActive !== isTranslationActive ||
            prevState.isTranslationDirty !== isTranslationDirty ||
            prevState.selectedRemoteLanguage !== selectedRemoteLanguage
        ) {
            const localLanguage = this.getLocalLanguage();
            const translations = new Array(currLength);

            this.setState({
                translations,
            });

            if (isTranslationActive) {
                for (let i = 0; i < currLength; i++) {
                    const msg = displayableMessages[i];
                    if (msg.origin === Origin.REMOTE) {
                        this.translationService.getTranslation(msg.text, localLanguage, selectedRemoteLanguage).then(translation => {
                            translations[i] = translation;
                            this.setState({
                                translations,
                            });
                        });
                    }
                }
            }
        }

        if (!availableLanguages && prevState.isTranslationActive !== isTranslationActive) {
            this.translationService.getAvailableLanguages().then(availableLanguages => {
                this.setState({
                    availableLanguages,
                });
            });
        }
    }

    getCall = () => this.props.call;
    getReplayInstruction = () => this.props.replayInstruction;
    getMessages = () => this.getCall().messages || [];
    getCalledService = () => getCalledService(this.getCall(), this.intl);

    getTargetSelectValues = () => getPossibleTargets(this.getCall()).map(x => ({
        key: x.id,
        value: x.targetUri,
        text: this.intl.getTextFromLanguageObject(x.title),
    }));

    isCallActive = () => this.getCall().isActive;
    isUiDisabled = () => !this.isCallActive() || this.isReplay();
    isSendButtonDisabled = () => this.isUiDisabled() || !this.state.message;
    isTranslateButtonDisabled = () => this.isSendButtonDisabled() || this.state.isTranslating;
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
            <div className={classNames(style.Title, this.getTitleClass())}>
                <div className={classNames(style.SpaceBetween)}>
                    <strong>
                        <div>{formatMessage(Messages.service)}: {this.getCalledService()}</div>
                        {
                            displayName ?
                                <div>{formatMessage(Messages.contact)}: {displayName}</div>
                                : undefined
                        }
                        <div>{formatMessage(Messages.callIdentifier)}: {call.callId}</div>
                    </strong>
                    <div>
                        {latestComponent}
                    </div>
                </div>
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

    getLocalLanguage = () => this.state.isTranslationActive ? this.intl.getCurrentLanguage() : undefined;
    getAutoDetectedLanguage = () => {
        // fetch language from last translation that is not null
        const all = this.state.translations.filter(x => !!x);
        if (all.length > 0)
            return all[all.length - 1].from;
        else
            return undefined;
    }
    getRemoteLanguage = () => {
        const { selectedRemoteLanguage } = this.state;

        if (selectedRemoteLanguage)
            return selectedRemoteLanguage;
        else
            return this.getAutoDetectedLanguage();
    }
    getAvailableLanguageSelectValues = () => {
        const languages = (this.state.availableLanguages || []).map(lang => ({
            key: lang.code,
            value: lang.code,
            text: lang.name,
        }));

        let text = 'auto';
        // showing the automatically detected language only makes sense
        // if no language was selected manually
        if (!this.state.selectedRemoteLanguage)
            text += ` (${this.getAutoDetectedLanguage() ?? 'unknown'})`;

        return [
            {
                key: 'auto',
                value: 'auto',
                text,
            }
        ].concat(languages);
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

    handleSuccessButtonClick = () => {
        if (this.state.isTranslationActive && this.state.isTranslationDirty) {
            this.handleTranslateMessageClick();
        } else {
            this.handleSendClick();
        }
    }

    handleSendClick = () => {
        let msg = this.state.message.trim();

        if (this.state.isTranslationActive) {
            const translatedMsg = this.state.messageTranslation.trim();
            // translated text is prepended -> so it's easier for the user to understand
            msg = `${translatedMsg}\n\n---\n\n${msg}`;
        }

        if (!msg)
            return;

        if (this.props.onSendMessage) {
            this.props.onSendMessage(this.getCall(), msg);
        }

        this.setState({
            message: '',
            messageTranslation: '',
        });
    };

    handleTranslateMessageClick = async () => {
        this.setState({
            isTranslating: true,
        })

        const sourceMessage = this.state.message;
        const translation = await this.translationService.getTranslation(
            sourceMessage,
            this.getRemoteLanguage(),
            this.getLocalLanguage(),
        );

        this.setState({
            isTranslationDirty: false,
            isTranslating: false,
            // as a fallback we just use what has been written by the user
            // (in case of any translation errors)
            messageTranslation: translation?.text ?? sourceMessage,
        });
    }

    handleDeleteClick = () => {
        this.setState({
            message: '',
            messageTranslation: '',
            isTranslationDirty: true,
        });
        this.focusMessageText();
    };

    handleMessageChange = (evt) => {
        this.setState({
            message: evt.target.value,
            messageTranslation: '',
            isTranslationDirty: true,
        });
    };

    handleShowOnMapClick = () => {
        if (this.props.onShowLatestLocations)
            this.props.onShowLatestLocations();
    };

    handleMessageKeyDown = (event) => {
        if (event.key === 'Enter' && event.shiftKey !== true) {
            event.preventDefault();
            this.handleSuccessButtonClick();
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
        if (snippet.uri) {
            if (this.props.onSendMessage)
                this.props.onSendMessage(this.getCall(), snippet.text, snippet.uri);
        } else if (snippet.text) {
            this.appendToMessage(snippet.text);
            this.focusMessageText();
        }
    }

    handleTargetChange = (targetSelectValue) => {
        if (this.props.onTargetChange)
            this.props.onTargetChange(targetSelectValue);
    }

    handleTargetLanguageChange = (targetLanguage) => {
        if (targetLanguage === 'auto')
            targetLanguage = undefined;

        this.setState({
            selectedRemoteLanguage: targetLanguage,
            isTranslationDirty: true,
        })
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

    toggleTranslationActive = () => {
        this.setState({
            isTranslationActive: !this.state.isTranslationActive,
        });
    }

    appendToMessage = (text) => {
        this.setState({
            message: this.state.message + text,
        });
    }

    render() {
        const { formatMessage } = this.intl;
        const {
            isTranslationAvailable,
            isTranslationActive,
            isTranslationDirty,
            isTranslating,
            selectedRemoteLanguage,
        } = this.state;

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
                                enter: '\u21b5',
                            })}
                            onKeyDown={this.handleMessageKeyDown}
                            value={this.state.message}
                            onChange={this.handleMessageChange}
                        />
                        {
                            isTranslationActive ?
                                <textarea
                                    readOnly={true}
                                    rows={3}
                                    className={classNames('form-control', style.TextInput)}
                                    placeholder={isTranslating ? `${formatMessage(Messages.translation)}...` : ''}
                                    value={this.state.messageTranslation} />
                                :
                                undefined
                        }
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
                                translation={this.state.translations[index]}
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
                        {
                            isTranslationAvailable ?
                                <button
                                    className={classNames(
                                        'btn',
                                        'btn-default',
                                        isTranslationActive ? 'active' : null,
                                        style.MessageButton,
                                    )}
                                    onClick={this.toggleTranslationActive}>
                                    <span className={classNames('glyphicon', 'glyphicon-flag')} /> {formatMessage(Messages.translation)}
                                </button> : null
                        }
                        {
                            isTranslationActive ?
                                <Select
                                    className={style.AutoWidth}
                                    style={SelectStyle.SELECT}
                                    values={this.getAvailableLanguageSelectValues()}
                                    selected={selectedRemoteLanguage}
                                    onChange={this.handleTargetLanguageChange}
                                />
                                :
                                undefined
                        }
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

                                {
                                    isTranslationActive && isTranslationDirty ?
                                        <button
                                            disabled={this.isTranslateButtonDisabled()}
                                            type="button"
                                            className={classNames("btn btn-warning", style.MessageButton)}
                                            onClick={this.handleSuccessButtonClick}>
                                            <span className="glyphicon glyphicon-flag" /> {
                                                isTranslating ?
                                                    `${formatMessage(Messages.translation)}...` :
                                                    formatMessage(Messages.translate)
                                            }
                                        </button>
                                        :
                                        <button
                                            disabled={this.isSendButtonDisabled()}
                                            type="button"
                                            className={classNames("btn btn-success", style.MessageButton)}
                                            onClick={this.handleSuccessButtonClick}>
                                            <span className="glyphicon glyphicon-send" /> {formatMessage(Messages.send)}
                                        </button>
                                }
                            </span>
                        </div>
                    }
                </div>
            </div>
        </div>
        );
    }
}

export default MessageView;
