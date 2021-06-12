import classNames from 'classnames';
import React from 'react';
import { Attachment } from '../../../../model/Attachment';

interface IProps {
  className?: string,
  values: Array<Attachment>,
};

export const VideoView: React.FunctionComponent<IProps> = ({
  className,
  values,
}) => {
  if (values.length === 0)
    return null;

  return (
    <div className={classNames(className)}>
      {
        values.map((x) =>
          <video
            controls
            preload="auto"
            src={x.url}
          >
            {/* TODO: We should provide a translation here */}
            Sorry, your browser does not support this video file.
          </video>
        )
      }
    </div>
  );
}