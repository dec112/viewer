import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import style from './Navbar.module.css';
import Messages from "../../i18n/Messages";
import { LocalizationService} from '../../service/LocalizationService';
import ConfigService from '../../service/ConfigService';

class Navbar extends Component {

    static propTypes = {
        onLogout: PropTypes.func,
        onBackClick: PropTypes.func,
        isAlertMode: PropTypes.bool,
        showBackIcon: PropTypes.bool,
    }

    constructor() {
        super();
        this.intl = LocalizationService.getInstance();
        this.config = ConfigService.getInstance();
    }

    getAlertModeClass() {
        return this.props.isAlertMode ? style.AlertMode : null;
    }

    getTitle = () => this.config.get('appTitle') || this.intl.formatMessage(Messages.appName);

    handleLogoutClick = () => {
        if (this.props.onLogout) {
            this.props.onLogout();
        }
    }

    handleBackClick = () => {
        if (this.props.onBackClick) {
            this.props.onBackClick();
        }
    }

    render() {
        const { formatMessage } = this.intl;

        return (
            <nav className={classNames(style.Nav, this.getAlertModeClass())}>
                <span
                    className={classNames(style.Title)}>
                    {
                        this.props.showBackIcon ?

                            <button
                                className={classNames("btn", "btn-default", "glyphicon", "glyphicon-arrow-left", style.BackIcon)}
                                onClick={this.handleBackClick}></button> :
                            null
                    }
                    {this.getTitle()}
                </span>
                <button
                    className="btn btn-danger hidePrint"
                    onClick={this.handleLogoutClick}>{formatMessage(Messages.logout)}</button>
            </nav>
        );
    }
}

export default Navbar;
