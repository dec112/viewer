import React from 'react';
// @ts-ignore
import classNames from 'classnames';

interface PanelProps {
  className?: string,
  title?: string,
}

export const Panel: React.FunctionComponent<React.PropsWithChildren<PanelProps>> = ({ className, title, children }) => {
  return (
    <div className={classNames('panel', 'panel-default', className)}>
      {title ?
        <div className='panel-heading'>{title}</div>
        : null}
      <div className={classNames('panel-body')}>
        {children}
      </div>
    </div>
  );
};