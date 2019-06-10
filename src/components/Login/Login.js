import React, { Component } from 'react';
import PropTypes from "prop-types";
import classNames from 'classnames';
import style from './Login.module.css';
import Label from "../../components/Label/Label";
import TextField from "../../components/TextField/TextField";
import Messages from '../../i18n/Messages';
import LoadingButton from "../../components/Button/LoadingButton";
import LocalizationProvider from "../../provider/LocalizationProvider";
import CredentialService from '../../service/CredentialService'
import Clock from 'react-live-clock';

class Login extends Component {

    static propTypes = {
        onSetLoggedIn: PropTypes.func,
    };

    constructor() {
        super();
        this.state = {userName: '', password: ''};
        this.credentialService = CredentialService.getInstance();
    }

    performLogin = () => {
        if(this.credentialService.isValidLogin(this.state.password))
            if(this.props.onSetLoggedIn)
                this.props.onSetLoggedIn(this.state.userName, this.state.password);
    };

    updateUserName = (value) => {
        this.setState({userName: value});
    };

    updatePassword = (value) => {
        this.setState({password: value});
    };

    handleKeyUp = (keyCode) => {
        if (keyCode === 13) {
            this.performLogin();
        }
    };

    render() {
        const {formatMessage} = LocalizationProvider;
        return (
            <div className={classNames('panel', 'panel-default', style.loginPanel)}>
                <div className={classNames("panel-heading", style.Header)}>
                    <div className={style.Heading}>{formatMessage(Messages.login)}</div>
                    <div className={style.Clock}>
                        <Clock format={'HH:mm:ss'} ticking={true} timezone={'Europe/Vienna'}/>
                    </div>
                </div>
                <div className="panel-body">
                    <div className="form-group">
                        <Label text={formatMessage(Messages.username)}/>
                        <TextField inputType={'text'} text={this.state.userName}
                                   onChange={this.updateUserName}
                                   autoFocus id="userName"
                                   placeholder={formatMessage(Messages.username)}
                                   onKeyUp={this.handleKeyUp}/>
                    </div>
                    <div className="form-group">
                        <Label text={formatMessage(Messages.password)}/>
                        <TextField inputType={'password'} text={this.state.password}
                                   onChange={this.updatePassword} type="password"
                                   className="form-control"
                                   id="password" placeholder={formatMessage(Messages.password)}
                                   onKeyUp={(e) => this.handleKeyUp(e)}/>
                    </div>
                    <LoadingButton text={formatMessage(Messages.login)} icon="lock"
                                   showLoadingAnimation={false}
                                   onClick={this.performLogin}/>
                </div>
            </div>
        );
    };
}

export default Login;
