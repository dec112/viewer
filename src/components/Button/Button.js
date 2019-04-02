import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import IconAndText from '../IconAndText/IconAndText';

class Button extends Component {
    static propTypes = {
        text: PropTypes.string,
        submit: PropTypes.bool,
        icon: PropTypes.string,
        color: PropTypes.string,
        disabled: PropTypes.bool,
        style: PropTypes.object,
        onClick: PropTypes.func,
        className: PropTypes.string,
        toggle: PropTypes.bool,
        rightHandSideIcon: PropTypes.bool,
        externalLink: PropTypes.string,
    };

    onClick = (evt) => {
        if (this.props.externalLink) {
            window.location.href = this.props.externalLink;
        } else {
            this.props.onClick(evt);
        }
    };

    render() {
        const fullStyle = {...this.props.style};
        const type = this.props.submit ? 'submit' : 'action';
        const colorClassName = this.props.color && !this.props.color.startsWith('#') && !this.props.disabled ? 'btn-' + this.props.color : 'btn-default';
        if (this.props.color && this.props.color.startsWith('#') && !this.props.disabled) {
            fullStyle.backgroundColor = this.props.color;
        }
        return (
            <button
                type={type}
                className={classNames('btn', colorClassName, this.props.className)}
                disabled={this.props.disabled}
                data-toggle={this.props.toggle ? 'button' : 'false'}
                style={fullStyle}
                onClick={this.onClick}
            >
                <IconAndText text={this.props.text} icon={this.props.icon}
                             rightHandSideIcon={this.props.rightHandSideIcon}/>
            </button>
        );
    }
}

Button.defaultProps = {
    disabled: false,
    rightHandSideIcon: false,
};

export default Button;
