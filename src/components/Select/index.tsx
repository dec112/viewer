import React, { ChangeEvent } from 'react';
// @ts-ignore
import classNames from 'classnames';

interface SelectValue {
  key: string,
  value: any,
  text: any,
};

interface SelectProps {
  onChange: (value: string, event: ChangeEvent) => void,
  values: Array<SelectValue>,
  selected: any,
  className?: string,
  disabled?: boolean,
};

export const Select: React.SFC<SelectProps> = (props) => {
  const { className, onChange, disabled, values } = props;
  let { selected } = props;

  const handleChange = (evt: ChangeEvent<HTMLSelectElement>) => onChange(evt.target.value, evt);

  if (!selected)
    selected = values[0].value;

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