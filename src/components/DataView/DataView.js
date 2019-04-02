import React, { Component } from 'react';
import PropTypes from 'prop-types';
import style from './DataView.css';
import InfoTable from "../InfoTable/InfoTable";
import LocalizationProvider from "../../provider/LocalizationProvider";
import Messages from "../../i18n/Messages";
import classNames from "classnames";
import ArrayUtilities from "../../utilities/ArrayUtilities";

class DataView extends Component {

    static propTypes = {
        additionalInformation: PropTypes.arrayOf(PropTypes.object),
        showTitle: PropTypes.bool,
    };

    _tryTranslate(key) {
        let messageKeyToTranslate = Messages[key];
        // if key cannot be found in messages, it will be used as is
        return messageKeyToTranslate ? LocalizationProvider.formatMessage(messageKeyToTranslate) : key
    }

    showTitle() {
        return !!this.props.showTitle;
    }

    getAdditionalInformationElements() {
        let infos = this.props.additionalInformation;

        if (!infos || infos.length === 0)
            return this.getInfoTableItem(LocalizationProvider.formatMessage(Messages.noAdditionalInformation), { '-': '-' }, 'noData');

        // group by substring before dot -> e.g. app.data -> app
        let items = ArrayUtilities.groupBy(infos, x => {
            let indexOfDot = x.name.indexOf('.');

            if (indexOfDot > -1)
                return x.name.substring(0, indexOfDot);

            return '';
        });

        // sort keys by grouped array length
        let keys = ArrayUtilities.reverse(Object.keys(items), (element) => items[element].length);

        // create an info table for each key
        return keys.map(key => {
            let data = items[key].reduce((obj, item) => {
                let keyToTranslate = item.name.split('.');

                let translated = this._tryTranslate(keyToTranslate[keyToTranslate.length - 1]);

                obj[translated] = item.value;
                return obj;
            }, {});

            key = key || 'generalData';
            return this.getInfoTableItem(this._tryTranslate(key), data, key);
        });
    }

    getInfoTableItem(title, data, key) {      
        return <div className="col-lg-6 col-md-6 col-sm-6"
            key={key}>
            <InfoTable
                title={title}
                data={data}
                copyToClipboard={true} />
        </div>;
    }

    render() {
        const { formatMessage } = LocalizationProvider;

        return (<div>
            <div className={classNames('', style.noBorder)}>
                {this.showTitle() ?
                    <div className="panel-heading">
                        <h3 className="panel-title">{formatMessage(Messages.basicInformation)}</h3>
                    </div> : ''}
                <div className={classNames("row")}>
                    {this.getAdditionalInformationElements()}
                </div>
            </div>
        </div>);
    }
}

export default DataView;
