import classNames from 'classnames';
import React from 'react';
import { Attachment } from '../../../model/Attachment';
import { AttachmentType, getDisplayable } from '../../../utilities/AttachmentUtilities';
import style from './style.module.css';

interface IProps {
  className?: string,
  values: Array<Attachment>,
};

export const AttachmentView: React.FunctionComponent<IProps> = ({
  className,
  values,
}) => {
  const toDisplay = getDisplayable(values, AttachmentType.IMAGE);

  if (toDisplay.length === 0)
    return null;

  return (
    <div className={classNames(style.ImageContainer, className)}>
      {toDisplay.map(x => <img key={x.id} src={x.url} alt="" />)}
    </div>
  );
}