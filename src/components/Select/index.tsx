import React, { ChangeEvent } from 'react';
// @ts-ignore
import classNames from 'classnames';
import styles from './style.module.css';

interface SelectValue {
  key: string,
  value: any,
  text: any,
};

export enum SelectStyle {
  SELECT = 'select',
  BUTTON = 'button',
}

interface SelectProps {
  onChange: (value: string, event: ChangeEvent) => void,
  values: Array<SelectValue>,
  selected: any,
  className?: string,
  disabled?: boolean,
  style?: SelectStyle,
};

export const Select: React.FunctionComponent<SelectProps> = (props) => {
  const {
    className,
    onChange,
    disabled,
    values,
    style = SelectStyle.SELECT,
  } = props;
  let { selected } = props;

  const handleChange = (evt: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => onChange(evt.target.value, evt);

  if (!selected)
    selected = values[0].value;

  if (style === SelectStyle.BUTTON)
    return (
      <div className={classNames('btn-group', className)}>
        {
          values.map(({ key, value, text }) => {
            const isSelected = value === selected;

            return (
              <label
                key={key}
                className={classNames('btn', isSelected ? 'btn-primary active' : 'btn-default', disabled ? 'disabled' : undefined)}>
                <input
                  disabled={disabled}
                  className={styles.RadioButton}
                  type="radio"
                  name="someautomaticallygeneratedname"
                  value={value}
                  checked={isSelected}
                  onChange={handleChange}
                />
                {text}
              </label>
            )
          })
        }
      </div>
    );
  else
    return (
      <select
        disabled={disabled}
        defaultValue={selected}
        className={classNames('form-control', className)}
        onChange={handleChange}
      >
        {values.map(({ key, value, text }) => (
          <option
            value={value}
            key={key}>{text}</option>
        ))}
      </select>
    )
}

Select.defaultProps = {
  disabled: false,
};