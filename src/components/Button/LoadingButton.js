import PropTypes from 'prop-types';
import Button from "./Button";
import classNames from 'classnames';
import React from "react";
import style from './LoadingButton.css';

class LoadingButton extends Button {
    static propTypes = {
        loading: PropTypes.bool,
        showLoadingAnimation: PropTypes.bool,
    };

    getLoadingAnimationCssClass() {
        return (this.props.loading && this.getShowLoadingAnimation()) ? style.LoadingAnimation : "";
    }

    getShowLoadingAnimation() {
        return (this.props.showLoadingAnimation) ? this.props.showLoadingAnimation : true;
    }

    getLoadingAnimationStateCssClass() {
        return (this.props.loading) ? "" : style.Hidden;
    }

    getButtonStateCssClass() {
        return (this.props.loading) ? style.Disabled : "";
    }

    render() {
        return <div>
            <div className={style.ButtonContainer}>
                <div className={this.getButtonStateCssClass()}>
                    {super.render()}
                </div>
                <div
                    className={classNames(this.getLoadingAnimationCssClass(), this.getLoadingAnimationStateCssClass(), style.Loading, "glyphicon glyphicon-refresh glyphicon-refresh-animate")}/>
            </div>
        </div>
    }
}

export default LoadingButton;
