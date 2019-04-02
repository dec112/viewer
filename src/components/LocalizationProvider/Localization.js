import { Component } from 'react';
import { injectIntl, intlShape } from "react-intl";
import LocalizationProvider from '../../provider/LocalizationProvider';

class Localization extends Component {
    static propTypes = {
        intl: intlShape.isRequired,
    };

    constructor(props){
        super();
        LocalizationProvider.PROVIDER = props.intl;
    }

    render() {
        return '';
    }
}

export default injectIntl(Localization);
