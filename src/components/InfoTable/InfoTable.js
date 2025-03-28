import React, { Component } from 'react';
import PropTypes from 'prop-types';
import style from './InfoTable.module.css';
import classNames from "classnames";
import { LocalizationService } from '../../service/LocalizationService';
import { Icon, IconType } from '../Icon';
import { UiService } from '../../service';
import Messages from '../../i18n/Messages';

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

  copyToClipboard(text) {
    UiService.getInstance().copyToClipboard(text);
  }

  getClipboardColumn(dataToCopy) {
    if (!this.hasCopyToClipboard() || !dataToCopy)
      return <td />;

    return (
      <td className={style.CopyToClipboardColumn}>
        <span
          onClick={() => this.copyToClipboard(dataToCopy)}
          className="glyphicon glyphicon-copy glyphicon--btn">
        </span>
      </td>
    );
  }

  combineTitleAndValue = (title, value) => `${title}: ${value}`;

  render() {
    return (
      <div className={classNames('panel', this.props.className)}>
        <div className="panel-heading">{this.props.title}</div>
        <table className={classNames(style.Table, "panel-body table table-striped table-hover table-bordered table-sm")}>
          <tbody>
            {Object.keys(this.props.data).sort().map(key => {
              let value, visibleValue;
              value = this.props.data[key];
              value = visibleValue = value === undefined || value === null ? value : value.toString();

              switch (value) {
                case 'true':
                  visibleValue = <Icon type={IconType.OK} />;
                  value = this.combineTitleAndValue(key, this.intl.formatMessage(Messages.yes));
                  break;
                case 'false':
                  visibleValue = <Icon type={IconType.REMOVE} />;
                  value = this.combineTitleAndValue(key, this.intl.formatMessage(Messages.no));
                  break;
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