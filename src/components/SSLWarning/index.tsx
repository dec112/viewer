import React from 'react';
import style from './style.module.css';

interface IProps {

}

export const SSLWarning: React.FunctionComponent<IProps> = () => {
  const location = window.location;

  const isLocalhost = location.hostname === 'localhost';
  const isSecure = location.protocol === 'https:' || isLocalhost;

  if (isLocalhost) {
    return (
      <p className={style.warning}>
        Development
      </p>
    );
  }

  if (isSecure)
    return null;

  return (
    <div className={style.warning}>
      <h2 className={style.heading}>Insecure Context</h2>
      <p>
        This application does not run under a secure context.
        Application errors can occur, as some Web APIs are exposed in secure contexts only.
        <br />
        Furthermore, all data (including sensitive information like passwords) is sent in cleartext.
      </p>
    </div>
  );
}