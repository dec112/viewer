import React from 'react';
// @ts-ignore
import classNames from 'classnames';

export enum IconType {
  ALERT = 'alert',
  COPY = 'copy',
  DOWNLOAD = 'download',
  EXCLAMATION_SIGN = 'exclamation-sign',
  EXPORT = 'export',
  LOCK = 'lock',
  OK = 'ok',
  PAUSE = 'pause',
  PLAY = 'play',
  PRINT = 'print',
  QUESTION_SIGN = 'question-sign',
  REMOVE = 'remove',
  REPEAT = 'repeat',
  SHARE = 'share',
  STEP_BACKWARD = 'step-backward',
  STEP_FORWARD = 'step-forward',
};

interface IconProps {
  type: IconType,
  className?: string,
};

export const Icon: React.SFC<IconProps> = (props) => {
  const _props = Object.assign({}, props);

  _props.className = _props.className ?? '';
  _props.className += ' ' + classNames('glyphicon', `glyphicon-${_props.type}`);

  delete _props.type;

  return (
    <span {..._props}></span>
  );
};

export enum IconPosition {
  LEFT = 'left',
  RIGHT = 'right',
}

interface IconTextProps extends IconProps {
  iconPosition?: IconPosition
}

export const IconText: React.SFC<IconTextProps> = (props) => {
  const { iconPosition } = props;
  const icon = <Icon type={props.type} />;

  return (
    <>
      {iconPosition === IconPosition.LEFT ? (<>{icon}&nbsp;</>) : null}
      {props.children}
      {iconPosition === IconPosition.RIGHT ? (<>&nbsp;{icon}</>) : null}
    </>
  );
};

IconText.defaultProps = {
  iconPosition: IconPosition.LEFT,
};