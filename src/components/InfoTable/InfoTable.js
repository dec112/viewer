import React, { Component } from 'react';
import PropTypes from 'prop-types';
import style from './InfoTable.module.css';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Snackbar from "../Snackbar/Snackbar";
import Messages from "../../i18n/Messages";
import classNames from "classnames";
import { LocalizationService} from '../../service/LocalizationService';
import { Icon, IconType } from '../Icon';

class InfoTable extends Component {

  static propTypes = {
    title: PropTypes.string,
    data: PropTypes.object.isRequired,
    className: PropTypes.string,
    copyToClipboard: PropTypes.bool
  }

  constructor() {
    super();
    this.intl = LocalizationService.getInstance();
  }

  hasCopyToClipboard() {
    return !!this.props.copyToClipboard;
  }

  onCopyToClipboard = (text, success) => {
    const { formatMessage } = this.intl;

    if (success)
      Snackbar.success(formatMessage(Messages['copyToClipboard.success'], { message: text }));
    else
      Snackbar.error(formatMessage(Messages['copyToClipboard.error']));
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
      <div className={classNames('panel', this.props.className)}>
        <div className="panel-heading">{this.props.title}</div>
        <table className={classNames("panel-body table table-striped table-hover table-bordered table-sm")}>
          <tbody>
            {Object.keys(this.props.data).sort().map(key => {
              let value, visibleValue;
              value = this.props.data[key];
              value = visibleValue = value === undefined || value === null ? value : value.toString();

              switch(value) {
                case 'true': visibleValue = <Icon type={IconType.OK} />; break;
                case 'false': visibleValue = <Icon type={IconType.REMOVE} />; break;
                default:
              }

              return (
                <tr key={key}>
                  <th>{key}</th>
                  <td>{visibleValue}</td>
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

InfoTable.defaultProps = {
  copyToClipboard: true,
};

export default InfoTable