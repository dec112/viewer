import React, { Component } from 'react';
import PropTypes from 'prop-types';
import style from './LocationMarker.css';
import classNames from 'classnames';

class LocationMarker extends Component {
  static propTypes = {
    locations: PropTypes.array.isRequired,
    currentLocations: PropTypes.array,
    onClick: PropTypes.func
  };

  hasCurrentLocations() {
    return this.props.locations === this.props.currentLocations;
  }

  handleClick = () => {
    if (this.props.onClick)
      this.props.onClick(this.props.locations);
  }

  render() {
    const isCurrentLocationStyle = this.hasCurrentLocations() ? style.CurrentLocation : '';
    return (
      <span
        className={classNames(style.MapMarker, isCurrentLocationStyle, "glyphicon glyphicon-map-marker")}
        onClick={this.handleClick}></span>
    )
  }
}

export default LocationMarker;
