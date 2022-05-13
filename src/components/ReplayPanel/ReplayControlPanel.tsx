import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CallReplay } from '../../model/CallReplayModel';
import { LocalizationService } from '../../service';
import Messages from '../../i18n/Messages';
import { RangeSlider } from '../RangeSlider/RangeSlider';
import { Button } from '../Button';
import style from './ReplayControlPanel.module.css'
import DateTimeService from '../../service/DateTimeService';
import * as CoreUtil from '../../utilities';
import { IconText, IconType, IconPosition } from '../Icon';
import { ReplayInstruction, MessageModel } from '../../model/ReplayInstructionModel';
import RequestMethod from '../../constant/RequestMethod';
// @ts-ignore
import classNames from 'classnames';
import ConfigService from '../../service/ConfigService';
import { Select } from '../Select';
import { minmax } from '../../utilities';

interface IProps {
  call: CallReplay,
  replayInstruction: ReplayInstruction,
  onProgressChange: (progress: number) => void,
};

function isOutOfBounds<T>(arr: Array<T>, index: number) {
  return index >= arr.length || index < 0;
}

function getConfig(...path: Array<any>) {
  return ConfigService.get('ui', 'replayControlPanel', ...path);
}

// You could argue here that this progress should be calculated by taking "created" and "end" values of ReplayInstruction
// But I think this is a safer way, even if the outer service does not provide correct timestamps for ReplayInstruction itself
function calculateProgress(currentMessage: MessageModel, allMessages: Array<MessageModel>) {
  const first = allMessages[0].received.getTime();
  const last = allMessages[allMessages.length - 1].received.getTime();

  return (currentMessage.received.getTime() - first) / (last - first)
}

export const ReplayControlPanel: React.FunctionComponent<IProps> = (props) => {
  const dts = DateTimeService.getInstance();
  const { formatMessage } = LocalizationService.getInstance();
  const { call: { created, ended, currentTime }, replayInstruction } = props;

  const duration = useMemo(() => ended.getTime() - created.getTime(), [created, ended]);
  const playSpeeds = useMemo<Array<number>>(() => getConfig('playSpeeds'), []);
  const playSpeedsValues = useMemo(() => playSpeeds.map(x => ({
    key: `play-option-${x}`,
    value: x,
    text: `${x}x`,
  })), [playSpeeds]);
  const updateInterval = useMemo<number>(() => getConfig('updateInterval'), []);

  const [playSpeed, setPlaySpeed] = useState<number>(1);
  const [timer, setTimer] = useState<number>();
  const [progress, setProgress] = useState<number>(0); // between 0 and 1

  const changeProgress = (progress: number) => {
    setProgress(progress);
    props.onProgressChange(progress);
  }

  const handleTimeBarChange = (value: number, interacting: boolean) => {
    const prog = value / 100; // traget.value is between 0 and 100

    // if the user is still interacting with our RangeSlider, we do not rebuild our CallReaply
    // because this consumes a lot of resources
    // instead, we wait until the user has finished interacting to update the UI completely
    if (interacting)
      setProgress(prog);
    else
      changeProgress(prog);
  }

  const getDateComponent = (msg: string, dateTime: Date) => {
    return (
      <div>
        <strong>{formatMessage(msg)}:</strong> {dts.toDateTime(dateTime)}
      </div>
    );
  }

  const playPause = () => timer ? stopTimer() : startTimer();
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const timerRef = useRef(timer);
  timerRef.current = timer;
  const playSpeedRef = useRef(playSpeed);
  playSpeedRef.current = playSpeed;

  const startTimer = () => {
    // if we are at the end, start from the beginning
    if (progress === 1)
      changeProgress(0);

    const timer = window.setInterval(() => {
      const progressStep = 1 / duration * updateInterval * playSpeedRef.current;
      let nextStep = progressRef.current + progressStep;

      if (nextStep >= 1) {
        nextStep = 1;
        stopTimer();
      }

      changeProgress(nextStep);
    }, updateInterval);
    setTimer(timer);
  }

  const stopTimer = () => {
    const tim = timerRef.current;
    if (tim) {
      clearTimeout(tim);
      setTimer(undefined);
    }
  }

  // this effect stops our timer, if component is unmounted
  useEffect(() => () => stopTimer(), []);
  // with each initial render of ReplayControlPanel we want to reset the current progress to 0
  // or to its previous value (if the user has already interacted with the control)
  useEffect(() => {
    const createdTime = created.getTime();

    const currDiff = currentTime.getTime() - createdTime;
    const endDiff = ended.getTime() - createdTime;

    const prog = minmax(0, currDiff / endDiff, 1);
    changeProgress(prog);
  // we only want to run this once (when the component is mounted)
  // therefore we disable eslint here
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // These messages are also used by the MessageTimeline
  // That's why they are not stored within function "step"
  const allMessages = CoreUtil.sort(replayInstruction.messages, x => x.received);
  const allTextMessages = CoreUtil.sort(
    replayInstruction.messages.filter((x: any) =>
      x.event === RequestMethod.NEW_MESSAGE
      && Array.isArray(x.message.texts)
      && x.message.texts.length > 0
    ), x => x.received);
  const step = (steps: number) => {

    // get the last shown message
    // we have to use this helper function, as currentTime can be different from a specific message created date
    const tmpMsg = CoreUtil.sort(replayInstruction.getMessagesUntil(currentTime), x => x.received, true)[0];
    // in case we can not find a message, which is always true, if progress = 0 (no messages are shown)
    // we have to take the first available message to start with
    let targetIndex = Math.max(allMessages.indexOf(tmpMsg), 0);
    // the direction we want to go -> +1 or -1 = forth or back
    const directionToGo = steps / Math.abs(steps);

    let currentMessage: any = allMessages[targetIndex];
    if ((currentMessage as any).event !== RequestMethod.NEW_MESSAGE) {
      // if the found message is not a text message, we have to seek for the first one
      // therefore, we have to decrease our steps by one, because seeking is already one step towards a text message
      steps -= directionToGo;

      // find first message, that is a text message
      do {
        currentMessage = allMessages[(targetIndex = targetIndex + directionToGo)];
      } while (currentMessage && currentMessage.event !== RequestMethod.NEW_MESSAGE)
    }

    // ok, now lets look in our text messages array if we can find our message there
    // from there, go the specified amount of steps to the next text message
    targetIndex = allTextMessages.indexOf(currentMessage) + steps;
    // check, if we are already out of our array's boundaries
    const outOfBounds = isOutOfBounds(allTextMessages, targetIndex);
    if (outOfBounds)
      // if we are out of bounds, we are either at the beginning or the end of our journey
      // therefore, we either set our index to 0 or to the last element of all our messages
      targetIndex = targetIndex <= 0 ? 0 : allMessages.length - 1;

    // finally, we have to decide, which array to use
    // if we ran out of bounds, we have to use all messages
    // if we are still inside our bounds, we can use a real text message, yay!
    let goTo: MessageModel = (outOfBounds ? allMessages : allTextMessages)[targetIndex];

    const goToProgress = calculateProgress(goTo, allMessages);
    // const goToProgress = (goTo.created.getTime() - created.getTime()) / duration;
    changeProgress(goToProgress);
  }

  const isPlaying = () => !!timer;
  const getPlayPauseText = () => {
    const msg = isPlaying() ? 'pause' : isEnd() ? 'replay' : 'play';
    return formatMessage(Messages[msg]);
  }
  const getIconType = () => isPlaying() ? IconType.PAUSE : IconType.PLAY;
  const isEnd = () => progress === 1;
  const isStart = () => progress === 0;

  const handlePlaySpeedChange = (value: string) => setPlaySpeed(parseFloat(value));

  return (
    <div>
      <h2>{formatMessage(Messages.callReplay)}</h2>
      <div className={style.SpaceBetween}>
        {getDateComponent(Messages.begin, created)}
        {getDateComponent(Messages.current, currentTime)}
        {getDateComponent(Messages.end, ended)}
      </div>
      <RangeSlider
        className={style.RangeSlider}
        value={progress * 100}
        steps={allTextMessages.map(x => Math.round(calculateProgress(x, allMessages) * 100))}
        onChange={handleTimeBarChange} />
      <div className={classNames('form-inline')}>
        <Button onClick={playPause}>
          <IconText type={getIconType()}>
            {getPlayPauseText()}
          </IconText>
        </Button>
        <Select
          onChange={handlePlaySpeedChange}
          selected={playSpeed}
          values={playSpeedsValues} />
        <Button
          disabled={isPlaying() || isStart()}
          onClick={() => step(-1)}>
          <IconText type={IconType.STEP_BACKWARD}>
            {formatMessage(Messages.backward)}
          </IconText>
        </Button>
        <Button
          disabled={isPlaying() || isEnd()}
          onClick={() => step(1)}>
          <IconText
            type={IconType.STEP_FORWARD}
            iconPosition={IconPosition.RIGHT}>
            {formatMessage(Messages.forward)}
          </IconText>
        </Button>
      </div>
    </div>
  );
}