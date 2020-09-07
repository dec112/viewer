import React, { useMemo } from 'react';
import { Panel } from '../Panel';
import { Button } from '../Button';
import { LocalizationService } from '../../service';
import Messages from '../../i18n/Messages';

interface ITrigger {
  id: string,
  title: string,
}

interface TriggerPanelProps {
  triggers: Array<ITrigger>
  onExecuteTrigger: (trigger: ITrigger) => void,
};

export const TriggerPanel: React.SFC<TriggerPanelProps> = ({ triggers, onExecuteTrigger }) => {
  const { formatMessage } = useMemo(() => LocalizationService.getInstance(), []);

  return (
    <Panel
      title={formatMessage(Messages.manualTriggers)}
    >
      {triggers.map(x => (
        <Button
          key={x.id}
          onClick={() => onExecuteTrigger(x)}
        >{x.title}</Button>
      ))}
    </Panel>
  )
}