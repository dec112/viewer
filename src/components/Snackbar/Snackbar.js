import React, { Component, createRef } from 'react';
import style from "./Snackbar.css"
import classNames from 'classnames';
import SnackbarType from '../../constant/SnackbarType';
import ConfigService from "../../service/ConfigService";

class Snackbar extends Component {

    static INSTANCE;

    snackbar = createRef();
    timeout = null;

    constructor() {
        super();

        Snackbar.INSTANCE = this;
        this.state = {
            type: null,
            message: '',
            isShown: false,
            isFadingOut: false,
        };
    }

    static show(message, type = SnackbarType.DEFAULT) {
        Snackbar.INSTANCE.show(message, type);
    }

    static success(message) {
        Snackbar.show(message, SnackbarType.SUCCESS);
    }

    static error(message) {
        Snackbar.show(message, SnackbarType.ERROR);
    }

    _clearTimeout() {
        if (this.timeout)
            clearTimeout(this.timeout);
    }

    getSnackbarVisibilityClass() {
        return this.state.isShown ? style.show : '';
    }

    getSnackbarFadingOutClass() {
        return this.state.isFadingOut ? style.fadeOut : '';
    }

    show(message, type) {
        if (!message)
            return;

        this.setState({
            type: type || SnackbarType.DEFAULT,
            message: message,
            isShown: true,
            isFadingOut: false,
        });

        this._clearTimeout();

        this.timeout = setTimeout(() => {
            this.close();
        }, ConfigService.getConfig().ui.snackbar.timeout);
    }

    close = () => {
        this._clearTimeout();
        this.setState({
            isFadingOut: true,
        });
        this.snackbar.current.addEventListener('animationend', () => {
            // still fading out or has property been overwritten by a new call of 'show'?
            if (this.state.isFadingOut) {
                this.setState({
                    isShown: false,
                    isFadingOut: false,
                });
            }
        }, { once: true });
    }

    render() {
        let typeClass;
        let glyphiconClass;

        switch (this.state.type) {
            case SnackbarType.SUCCESS:
                typeClass = style.success;
                glyphiconClass = 'ok-sign';
                break;
            case SnackbarType.ERROR:
                typeClass = style.error;
                glyphiconClass = 'remove-sign';
                break;
            default:
                typeClass = style.default;
                glyphiconClass = 'info-sign';
        }

        return (
            <div id="snackbar"
                className={classNames(style.snackbar, typeClass, this.getSnackbarVisibilityClass(), this.getSnackbarFadingOutClass())}
                ref={this.snackbar}>
                <span className={classNames("glyphicon", "glyphicon-" + glyphiconClass, style.iconLeft)} />
                {this.state.message}
                <span className={classNames("glyphicon glyphicon-remove-circle", style.iconRight)}
                    onClick={this.close} />
            </div>
        );
    };
}

export default Snackbar;
