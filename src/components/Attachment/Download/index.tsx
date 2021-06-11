import React from 'react';
import { Attachment } from '../../../model/Attachment';
import { Button } from "../../Button";
import { IconText, IconType } from '../../Icon';

interface IProps {
  className?: string,
  values: Array<Attachment>,
};

export const AttachmentDownload: React.FunctionComponent<IProps> = ({
  className,
  values,
}) => {
  if (values.length === 0)
    return null;

  return (
    <div className={className}>
      {values.map(value =>
        <Button
          key={value.id}
          onClick={() => window.open(value.url, '_blank')}
        >
          <IconText type={IconType.DOWNLOAD}>
            <code>{value.mimeType}</code>
            <br />
            {value.id}
          </IconText>
        </Button>
      )}
    </div>
  );
}