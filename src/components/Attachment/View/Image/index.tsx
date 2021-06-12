import classNames from 'classnames';
import React, { useState } from 'react';
import { Attachment } from '../../../../model/Attachment';
import style from './style.module.css';

import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';

interface IProps {
  className?: string,
  values: Array<Attachment>,
};

export const ImageView: React.FunctionComponent<IProps> = ({
  className,
  values,
}) => {
  const [isOpen, setOpen] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const getValidIndex = (index: number): number => {
    return (index + values.length) % values.length;
  }

  const getUrlByIndex = (index: number): string => {
    return values[getValidIndex(index)].url;
  }

  if (values.length === 0)
    return null;

  return (
    <div className={classNames(className)}>
      {
        values.map((x, index) =>
          <img
            key={x.id}
            className={classNames(style.Image)}
            src={x.url}
            alt=""
            onClick={() => {
              setImageIndex(index);
              setOpen(true);
            }}
          />
        )
      }

      {isOpen && (
        <Lightbox
          mainSrc={getUrlByIndex(imageIndex)}
          nextSrc={getUrlByIndex(imageIndex + 1)}
          prevSrc={getUrlByIndex(imageIndex - 1)}
          onCloseRequest={() => setOpen(false)}
          onMovePrevRequest={() => setImageIndex(getValidIndex(imageIndex - 1))}
          onMoveNextRequest={() => setImageIndex(getValidIndex(imageIndex + 1))}
        />
      )}
    </div>
  );
}