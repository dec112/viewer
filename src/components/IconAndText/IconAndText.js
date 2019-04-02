import React, { Component }  from 'react';
import PropTypes from 'prop-types';
import IconUtilities from '../../utilities/IconUtilities';
import NonBreakingSpace from '../NonBreakingSpace/NonBreakingSpace';

class IconAndText extends Component {
    static propTypes = {
        text: PropTypes.string,
        icon: PropTypes.string,
        rightHandSideIcon: PropTypes.bool,
    };

    render() {
        const iconClassNames = IconUtilities.getIconClassNames(this.props.icon);
        return (
            <div style={{ display: 'inline-block' }}>
                {(iconClassNames && !this.props.rightHandSideIcon) &&
                <span><span className={iconClassNames} data-aria-hidden /><NonBreakingSpace /></span>}
                {this.props.text}
                {(iconClassNames && this.props.rightHandSideIcon) &&
                <span><NonBreakingSpace /><span className={iconClassNames} data-aria-hidden /></span>}
            </div>
        );
    }
}

export default IconAndText;
