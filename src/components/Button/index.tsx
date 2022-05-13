import React from 'react';
// @ts-ignore
import classNames from 'classnames';

export enum ButtonType {
  DEFAULT = 'btn-default',
  SUCCESS = 'btn-success',
};

interface IProps {
  onClick: (event: React.MouseEvent) => void,
  className?: string,
  type?: ButtonType,
  disabled?: boolean,
};

export const Button: React.FunctionComponent<React.PropsWithChildren<IProps>> = (props) => {
  const { type, className, onClick, disabled } = props;

  return (
    <button
      className={classNames('btn', type, className)}
      disabled={disabled}
      onClick={onClick}>
      {props.children}
    </button>
  )
}

Button.defaultProps = {
  type: ButtonType.DEFAULT,
  disabled: false,
};