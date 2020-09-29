import React, { Component } from 'react';
import Messages from "../../i18n/Messages";
import ModalType from '../../constant/ModalType'
import $ from 'jquery/src/jquery';
import { LocalizationService } from '../../service/LocalizationService';

function show(children, type, callback) {
    ModalDialog.CONTEXT.setState({
        children,
        type: type,
        callback: callback
    });
    $(".warningModal").modal('show');
}

function hide() {
    $(".warningModal").modal('hide');
}

class ModalDialog extends Component {
    static CONTEXT = null;

    constructor() {
        super();
        ModalDialog.CONTEXT = this;
        ModalDialog.CONTEXT.state = {
            children: null,
            type: '',
            callback: null
        };

        this.intl = LocalizationService.getInstance();
    }

    static confirm(children, callback) {
        show(children, ModalType.CONFIRM, callback);

        return ModalDialog.getReturnObject();
    }

    static alert(children, callback) {
        show(children, ModalType.ALERT, callback);

        return ModalDialog.getReturnObject();
    }

    static getReturnObject = () => ({ close: () => hide() })

    onConfirmClick = () => {
        if (ModalDialog.CONTEXT.state.callback) {
            ModalDialog.CONTEXT.state.callback.call(this);
        }

        hide();
    };

    render() {
        const { formatMessage } = this.intl;
        let negativeButton;
        let positiveButtonText;

        if (ModalDialog.CONTEXT.state.type === ModalType.CONFIRM) {
            negativeButton = <button
                type="button"
                data-dismiss="modal"
                className="btn btn-default">
                {formatMessage(Messages.no)}
            </button>
            positiveButtonText = formatMessage(Messages.yes);
        }
        else
            positiveButtonText = formatMessage(Messages.ok);

        const { children } = ModalDialog.CONTEXT.state;

        return (
            <div className="modal fade warningModal" tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-body">
                            {
                                typeof children === 'string' ?
                                    <p>{children}</p> :
                                    children
                            }
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-default"
                                type="button"
                                onClick={this.onConfirmClick}>
                                {positiveButtonText}
                            </button>
                            {negativeButton}
                        </div>
                    </div>
                </div>
            </div>);
    };
}

export default ModalDialog;
