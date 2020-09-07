import React, { Component } from 'react';
import classNames from 'classnames';
import style from './Login.module.css';
import Label from "../../components/Label/Label";
import TextField from "../../components/TextField/TextField";
import Messages from '../../i18n/Messages';
import ServerService from "../../service/ServerService.ts";
import { PACKAGE } from '../../config/config';
import * as ServerUtil from '../../utilities/ServerUtilities';
import { LocalizationService} from '../../service/LocalizationService';
import { Button } from '../../components/Button';
import { IconText, IconType } from '../../components/Icon';

class Login extends Component {

    constructor() {
        super();
        this.state = {
            serverUrl: '',
            userName: '', 
            password: '' ,
        };
        this.serverService = ServerService.getInstance();
        this.intl = LocalizationService.getInstance();
    }

    performLogin = async () => {
        if (!this.isLoginEnabled())
            return;

        let { serverUrl, userName, password } = this.state;

        try {
            await this.serverService.connect(
                serverUrl,
                ServerUtil.getConnectionParameters(userName, password),
            );

            if (!this.isCredentialsEnabled())
                userName = password = null;

            this.serverService.logon(userName, password);
        }
        catch { }
    };

    updateField = (field, value) => {
        const obj = {};
        obj[field] = value;
        this.setState(obj);
    }

    handleKeyUp = (keyCode) => {
        if (keyCode === 13) {
            this.performLogin();
        }
    };

    isCredentialsEnabled = () => ServerUtil.useCredentials(this.getUrl());
    isUrlValid = () => ServerUtil.isUrlValid(this.getUrl(), true);
    isLoginEnabled = () => {
        const { serverUrl, userName, password } = this.state;
        return ServerUtil.isLoginPossible(serverUrl, userName, password, true);
    }

    getUrl() {
        const { serverUrl } = this.state;
        return ServerUtil.isUrlValid(serverUrl) ? serverUrl : ServerUtil.getEndpoint();
    }
    getUsernameText = () => this.intl.formatMessage(ServerUtil.getUsernameMessage(this.getUrl()));
    getPasswordText = () => this.intl.formatMessage(ServerUtil.getPasswordMessage(this.getUrl()));
    getLoginText() {
        const { formatMessage } = this.intl;
        let message = Messages.connect;

        if (this.isCredentialsEnabled())
            message = Messages.login;

        return formatMessage(message);
    }

    render() {
        const { formatMessage } = this.intl;
        const { serverUrl, userName, password } = this.state;

        const urlValid = this.isUrlValid();

        return (
            <div className={classNames('panel', 'panel-default', style.loginPanel)}>
                <div className={classNames("panel-heading", style.Header)}>
                    <div className={style.Heading}>{this.getLoginText()}</div>
                    <div>{formatMessage(Messages.appName)} | v{PACKAGE.version}</div>
                </div>
                <div className="panel-body">
                    <div className={classNames('form-group', urlValid ? '' : 'has-error')}>
                        <Label text={formatMessage(Messages.server)} />
                        <TextField inputType={'text'} text={serverUrl}
                            onChange={(val) => this.updateField('serverUrl', val)}
                            placeholder={ServerUtil.getEndpoint()}
                            onKeyUp={this.handleKeyUp} />
                    </div>
                    <div className="form-group">
                        <Label text={this.getUsernameText()} />
                        <TextField inputType={'text'} text={userName}
                            onChange={(val) => this.updateField('userName', val)}
                            autoFocus id="userName"
                            disabled={!this.isCredentialsEnabled()}
                            placeholder={this.getUsernameText()}
                            onKeyUp={this.handleKeyUp} />
                    </div>
                    <div className="form-group">
                        <Label text={this.getPasswordText()} />
                        <TextField inputType={'password'} text={password}
                            onChange={(val) => this.updateField('password', val)} type="password"
                            disabled={!this.isCredentialsEnabled()}
                            className="form-control"
                            id="password" placeholder={this.getPasswordText()}
                            onKeyUp={(e) => this.handleKeyUp(e)} />
                    </div>
                    <Button
                        disabled={!this.isLoginEnabled()}
                        onClick={this.performLogin}>
                        <IconText type={IconType.LOCK}>
                            {this.getLoginText()}
                        </IconText>
                    </Button>
                </div>
            </div>
        );
    };
}

export default Login;
