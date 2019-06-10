import React, { Component } from 'react';
import PropTypes from 'prop-types';
import style from './InfoTable.module.css';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Snackbar from "../Snackbar/Snackbar";
import LocalizationProvider from "../../provider/LocalizationProvider";
import Messages from "../../i18n/Messages";
import classNames from "classnames";

class InfoTable extends Component {

  static propTypes = {
    title: PropTypes.string,
    data: PropTypes.object.isRequired,
    className: PropTypes.string,
    copyToClipboard: PropTypes.bool
  }

  hasCopyToClipboard() {
    return !!this.props.copyToClipboard;
  }

  onCopyToClipboard = (text, success) => {
    if (success)
      Snackbar.success(LocalizationProvider.formatMessage(Messages['copyToClipboard.success'], { message: text }));
    else
      Snackbar.error(LocalizationProvider.formatMessage(Messages['copyToClipboard.error']));
  }

  getClipboardColumn(dataToCopy) {
    if (!this.hasCopyToClipboard() || !dataToCopy)
      return <td />;

    return (
      <td className={style.copyToClipboardColumn}>
        <CopyToClipboard
          text={dataToCopy}
          onCopy={this.onCopyToClipboard}>
          <span className="glyphicon glyphicon-copy glyphicon--btn"></span>
        </CopyToClipboard>
      </td>
    );
  }

  render() {
    return (
      <div className="panel panel-info">
        <div className="panel-heading">{this.props.title}</div>
        <table className={classNames("panel-body table table-striped table-hover table-bordered table-sm", this.props.className)}>
          <tbody>
            {Object.keys(this.props.data).sort().map(key => {
              let value = this.props.data[key]

              return (
                <tr key={key}>
                  <th>{key}</th>
                  <td>{value}</td>
                  {this.getClipboardColumn(value)}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

export default InfoTable