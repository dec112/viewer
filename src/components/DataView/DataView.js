import React, { Component } from 'react';
import PropTypes from 'prop-types';
import style from './DataView.module.css';
import InfoTable from "../InfoTable/InfoTable";
import Messages from "../../i18n/Messages";
import classNames from "classnames";
import { sort } from "../../utilities/ArrayUtilities.ts";
import { LocalizationService } from '../../service/LocalizationService';

class DataView extends Component {

    static propTypes = {
        placeholder: PropTypes.string,
        data: PropTypes.object,
        showTitle: PropTypes.bool,
    };

    constructor() {
        super();
        this.intl = LocalizationService.getInstance();
    }

    _tryTranslate(key) {
        let messageKeyToTranslate = Messages[key];
        // if key cannot be found in messages, it will be used as is
        return messageKeyToTranslate ? this.intl.formatMessage(messageKeyToTranslate) : key
    }

    showTitle() {
        return !!this.props.showTitle;
    }

    _isHiddenKey = (key) => key.startsWith('_');

    _tryAddDataToObject = (obj, key, data) => {
        // we don't show items starting with underscore
        if (this._isHiddenKey(key))
            return obj;

        obj[this._tryTranslate(key)] = data;

        return obj;
    }

    getDataElements() {
        const { data: infos, placeholder } = this.props;
        const { formatMessage } = this.intl;

        if (!infos || Object.keys(infos).length === 0) {
            return <div className="panel panel-default">
                <div className="panel-body">
                    {placeholder ?? formatMessage(Messages.noAdditionalInformation)}
                </div>
            </div>
        }

        const infoObjects = {};
        for (const key in infos) {
            // we don't show items starting with underscore
            if (this._isHiddenKey(key))
                continue;

            const item = infos[key];

            // null is also identified as "object", weird
            // this is why we also check on the object itself
            if (!!item && typeof item === 'object') {
                infoObjects[key] = Object.keys(item).reduce((obj, subKey) => this._tryAddDataToObject(obj, subKey, item[subKey]), {});
            }
            else {
                // all values which are sitting in the root of the object
                // will be consolidated in an object called "generalData"
                infoObjects.generalData = (infoObjects.generalData || {});
                this._tryAddDataToObject(infoObjects.generalData, key, item);
            }
        }

        return sort(Object.keys(infoObjects), x => Object.keys(infoObjects[x]).length, true)
            .map(key => this.getInfoTableItem(this._tryTranslate(key), infoObjects[key], key))
    }

    getInfoTableItem(title, data, key) {
        return <div
            className={classNames(style.InfoTable)}
            key={key}>
            <InfoTable
                className={'panel-info'}
                title={title}
                data={data} />
        </div>;
    }

    render() {
        const { formatMessage } = this.intl;

        return (<div>
            <div className={classNames('', style.noBorder)}>
                {this.showTitle() ?
                    <div className="panel-heading">
                        <h3 className="panel-title">{formatMessage(Messages.basicInformation)}</h3>
                    </div> : ''}
                <div className={classNames(style.DataViewContainer)}>
                    {this.getDataElements()}
                </div>
            </div>
        </div>);
    }
}

export default DataView;
