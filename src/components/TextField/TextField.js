import React, { Component } from 'react';
import PropTypes from 'prop-types';

class TextField extends Component {
    static propTypes = {
        text: PropTypes.string,
        onChange: PropTypes.func,
        autoFocus: PropTypes.bool,
        id: PropTypes.string,
        placeholder: PropTypes.string,
        readOnly: PropTypes.bool,
        inputType: PropTypes.string,
        onKeyUp: PropTypes.func,
        disabled: PropTypes.bool,
    };

    getInputType() {
        return (this.props.inputType) ? this.props.inputType : 'text';
    }

    handleChange = (event) => {
        if (this.props.onChange) {
            this.props.onChange(event.target.value);
        }
    };

    handlekeyUp = (event) => {
        if (this.props.onKeyUp) {
            this.props.onKeyUp(event.charCode);
        }
    }

    render() {
        return (<input
            type={this.getInputType()}
            id={this.props.id}
            className="form-control"
            autoFocus={this.props.autoFocus}
            onChange={this.handleChange}
            onKeyPress={this.handlekeyUp}
            value={this.props.text ? this.props.text : ''}
            placeholder={this.props.placeholder}
            disabled={this.props.disabled}
            readOnly={this.props.readOnly}/>);
    }
}

TextField.defaultProps = {
    readOnly: false,
};

export default TextField;
