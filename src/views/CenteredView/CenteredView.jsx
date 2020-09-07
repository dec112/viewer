import React, { Component } from 'react';
import styles from './CenteredView.module.css';

export class CenteredView extends Component {
  render() {
    return (
      <div className={styles.Container}>
        {this.props.children}
      </div>
    )
  }
}