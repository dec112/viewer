import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Label extends Component {
    static propTypes = {
        text: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]).isRequired
    };

    render() {
        return <p>{this.props.text}</p>;
    }
}

export default Label;
