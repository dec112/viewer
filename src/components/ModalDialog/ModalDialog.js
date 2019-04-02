import React, { Component } from 'react';
import LocalizationProvider from '../../provider/LocalizationProvider';
import Messages from "../../i18n/Messages";
import ModalType from '../../constant/ModalType'
import $ from 'jquery';

function show(message, type, callback) {
    ModalDialog.CONTEXT.setState({
        message: LocalizationProvider.formatMessage(message),
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
            message: '',
            type: '',
            callback: null
        };
    }

    static confirm(message, callback) {
        show(message, ModalType.CONFIRM, callback);
    }

    static alert(message, callback) {
        show(message, ModalType.ALERT, callback);
    }

    onConfirmClick = () => {
        if (ModalDialog.CONTEXT.state.callback) {
            ModalDialog.CONTEXT.state.callback.call(this);
        }

        hide();
    };

    render() {
        const { formatMessage } = LocalizationProvider;
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

        return (
            <div className="modal fade warningModal" tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-body">
                            <p>{ModalDialog.CONTEXT.state.message}</p>
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
