import classNames from 'classnames';
import React from 'react';
import { Attachment } from '../../../model/Attachment';
import { AttachmentType, getDisplayable } from '../../../utilities/AttachmentUtilities';
import { ImageView } from './Image';
import style from './style.module.css';
import { VideoView } from './Video';

interface IProps {
  className?: string,
  values: Array<Attachment>,
};

export const AttachmentView: React.FunctionComponent<IProps> = ({
  className,
  values,
}) => {
  const images = getDisplayable(values, AttachmentType.IMAGE);
  const videos = getDisplayable(values, AttachmentType.VIDEO);

  return <div className={classNames(className)}>
    <ImageView
      className={classNames(style.Container)}
      values={images}
      />
    <VideoView
      className={classNames(style.Container)}
      values={videos}
    />
  </div>;
}