import React, { ChangeEvent, useState } from 'react';
// @ts-ignore
import classNames from 'classnames';

import styles from './RangeSlider.module.css';

interface IProps {
  value: number,
  min?: number,
  max?: number,
  step?: number,
  steps?: Array<number>,
  className?: string,
  onChange: (value: number, interacting: boolean, evt: ChangeEvent<HTMLInputElement> | undefined) => void,
};

function getEventValue(evt: ChangeEvent<HTMLInputElement>) {
  return parseFloat(evt.target.value);
}

export const RangeSlider: React.SFC<IProps> = (props) => {

  const { min, max, value, step, steps, onChange, className } = props;

  const [lastEvent, setLastEvent] = useState<ChangeEvent<HTMLInputElement>>();

  const handleInteractionEnd = () => {
    if (lastEvent)
      onChange(getEventValue(lastEvent), false, lastEvent);
  }

  const handleOnChange = (evt: ChangeEvent<HTMLInputElement>) => {
    onChange(getEventValue(evt), true, evt);

    evt.persist();
    setLastEvent(evt);
  }

  const handleMarkerClick = (progress: number) => onChange(progress, false, undefined);

  return (
    <div className={classNames(className, styles.sliderContainer)}>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        step={step}
        onChange={handleOnChange}
        onKeyUp={handleInteractionEnd}
        onMouseUp={handleInteractionEnd}
        onTouchEnd={handleInteractionEnd}
        className={styles.slider} />
      {steps ? <div className={styles.stepsContainer}>
        {steps.map((x, index) =>
          <button
            key={`marker-${index}`}
            onClick={() => handleMarkerClick(x)}
            style={{ left: `${Math.round(x)}%` }}
            className={styles.marker}></button>
        )
        }
      </div> : null}
    </div>
  );
}

RangeSlider.defaultProps = {
  min: 0,
  max: 100,
  step: 1,
};
