import React, { Component, createRef } from 'react';
import style from "./Snackbar.module.css"
// @ts-ignore
import classNames from 'classnames';
import SnackbarType from '../../constant/SnackbarType';
import ConfigService from "../../service/ConfigService";

class SnackbarItem {
    static incrementor = 0;
    id: number;

    constructor(
        public type: SnackbarType,
        public message: string,
        public isShown = true,
        public isFadingOut = false,
        public ref = createRef<HTMLDivElement>(),
    ) {
        this.id = SnackbarItem.incrementor++;
    }
}

class Snackbar extends Component {

    static INSTANCE: Snackbar;

    snackbar = createRef();
    timeout = 5000;

    state = {
        bars: [] as Array<SnackbarItem>,
    };

    constructor(props: any) {
        super(props);

        Snackbar.INSTANCE = this;

        this.timeout = parseInt(ConfigService.get('ui', 'snackbar', 'timeout'));
    }

    static show(message: string, type = SnackbarType.DEFAULT, customTimeout?: number | null) {
        Snackbar.INSTANCE.show(message, type, customTimeout);
    }

    static success(message: string) {
        Snackbar.show(message, SnackbarType.SUCCESS);
    }

    static error(message: string) {
        Snackbar.show(message, SnackbarType.ERROR, null);
    }

    getVisibilityClass(item: SnackbarItem) {
        return item.isShown ? style.show : '';
    }

    getFadingOutClass(item: SnackbarItem) {
        return item.isFadingOut ? style.fadeOut : '';
    }

    show(message: string, type: SnackbarType, customTimeout?: number | null) {
        if (!message)
            return;

        const bars = this.state.bars;
        const item = new SnackbarItem(
            type,
            message,
        );
        bars.push(item);
 
        // if customTimeout === null we don't want to close it automatically
        if (customTimeout !== null) {
            setTimeout(() => {
                this.close(item);
            }, customTimeout || this.timeout);
        }

        this.cleanup();
    }

    close = (item: SnackbarItem) => {
        item.isFadingOut = true;
        this.cleanup();

        const { current } = item.ref;
        if (!current)
            return;

        current.addEventListener('animationend', () => {
            if (item.isShown) {
                item.isShown = false;
                this.cleanup();
            }
        }, { once: true });
    }

    cleanup() {
        this.setState({
            bars: this.state.bars.filter(x => x.isShown),
        });
    }

    render() {
        const { bars } = this.state;

        return (
            <div className={classNames(style.snackbarContainer)}>
                {bars.map(x => {
                    let typeClass = style.default;
                    let glyphiconClass = 'info-sign';

                    switch (x.type) {
                        case SnackbarType.SUCCESS:
                            typeClass = style.success;
                            glyphiconClass = 'ok-sign';
                            break;
                        case SnackbarType.ERROR:
                            typeClass = style.error;
                            glyphiconClass = 'remove-sign';
                            break;
                        default:
                    }

                    return (
                        <div
                            className={classNames(
                                style.snackbar,
                                typeClass,
                                this.getVisibilityClass(x),
                                this.getFadingOutClass(x)
                            )}
                            key={`snackbar-${x.id}`}
                            ref={x.ref}>
                            <span className={classNames("glyphicon", "glyphicon-" + glyphiconClass, style.iconLeft)} />
                            <span className={classNames(style.message)}>{x.message}</span>
                            <span
                                className={classNames("glyphicon glyphicon-remove-circle", style.iconRight)}
                                onClick={() => this.close(x)}
                            />
                        </div>
                    );
                })}
            </div>
        );
    };
}

export default Snackbar;
