import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import style from './Navbar.css';
import LocalizationProvider from "../../provider/LocalizationProvider";
import Messages from "../../i18n/Messages";

class Navbar extends Component {

    static propTypes = {
        onLogout: PropTypes.func,
        onTitleClick: PropTypes.func,
        isAlertMode: PropTypes.bool,
    }

    getAlertModeClass() {
        return this.props.isAlertMode ? style.AlertMode : null;
    }

    handleLogoutClick = () => {
        if(this.props.onLogout) {
            this.props.onLogout();
        }
    }

    handleTitleClick = () => {
        if(this.props.onTitleClick) {
            this.props.onTitleClick();
        }
    }

    render() {
        const { formatMessage } = LocalizationProvider;

        return (
            <nav className={classNames(style.Nav, this.getAlertModeClass())}>
                <button
                    className={classNames(style.Title)}
                    onClick={this.handleTitleClick}>{formatMessage(Messages.appName)}</button>
                <button
                    className="btn btn-danger hidePrint"
                    onClick={this.handleLogoutClick}>{formatMessage(Messages.logout)}</button>
            </nav>);
    }
}

export default Navbar;
