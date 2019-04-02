import React, { Component }  from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

class NonBreakingSpace extends Component {
    static propTypes = {
        className: PropTypes.string,
    };

    render() {
        return <span className={classNames(this.props.className)}>&nbsp;</span>;
    }
}

export default NonBreakingSpace;
