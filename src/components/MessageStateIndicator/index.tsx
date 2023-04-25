import React from 'react';
import { MessageState } from '../../constant/MessageState';
import { Message } from '../../model/MessageModel';
import { Icon, IconType } from '../Icon';
import styles from './styles.module.css';
import classNames from 'classnames';
import { NOT_FOUND_ERROR, RELAY_ERROR } from '../../constant/MessageStateCode';
import { LocalizationService } from '../../service';
import Messages from '../../i18n/Messages';

interface Props {
  message: Message,
  className?: string,
}

const getErrorContent = (message: Message): JSX.Element => {
  const icon = <Icon type={IconType.EXCLAMATION_SIGN} />;
  const l10n = LocalizationService.getInstance();

  if (message.stateCode) {
    let errorMsg: string | undefined;

    switch (message.stateCode) {
      // catching both errors with the same case
      // as the error message fits both very well
      case RELAY_ERROR:
      case NOT_FOUND_ERROR:
        errorMsg = l10n.formatMessage(Messages['messageError.relayError']);
        break;
      default:
        errorMsg = l10n.formatMessage(Messages['messageError.undefined']);
    }

    return <>
      <span className={styles.Text}>{errorMsg} ({l10n.formatMessage(Messages['messageError.code'], { code: message.stateCode })})</span>
      {icon}
    </>
  }

  return icon;
}

export const MessageStateIndicator: React.FunctionComponent<Props> = (props) => {
  const { message, className } = props;
  let content;
  let additionalClasses: string = '';

  switch (message.state) {
    case MessageState.SENDING:
      content = <Icon type={IconType.REPEAT} />
      break;
    case MessageState.INTERMIEDIARY:
      content = <Icon type={IconType.OK} />
      break;
    case MessageState.RECEIVED:
      content = (
        <span className={styles.Overlapping}>
          <Icon type={IconType.OK} />
          <Icon type={IconType.OK} />
        </span>
      );
      break;
    case MessageState.ERROR:
      content = getErrorContent(message);
      additionalClasses = styles.Error;
      break;
    default:
      content = <Icon type={IconType.ALERT} />
  }

  return <span className={classNames(className, additionalClasses)}>
    {content}
  </span>
}