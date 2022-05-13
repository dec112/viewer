import React, { useState, useEffect } from 'react';
import { LocalizationService } from '../../service';
import Messages from '../../i18n/Messages';

interface IProps {
  date: Date,
  refreshRate: number,
  prefix?: String,
}

export const DurationComponent: React.FunctionComponent<IProps> = ({
  date,
  refreshRate,
  prefix,
}) => {
  const intl = LocalizationService.getInstance();
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const recalculateDuration = () => {
      const duration = new Date().getTime() - date.getTime();

      setDuration(duration);
    }

    recalculateDuration();
    const tim = setInterval(() => recalculateDuration(), refreshRate);

    return () => clearInterval(tim);
  }, [date, refreshRate]);


  let durationInSeconds = (duration / 1000);
  if (durationInSeconds < 0)
    durationInSeconds = 0;

  return (
    <span>
      {prefix ? <span>{prefix}</span> : null}
      {intl.formatMessage(Messages['duration.ago'], {
        duration: durationInSeconds.toFixed(0),
      })}
    </span>
  );
}

DurationComponent.defaultProps = {
  refreshRate: 1000,
};