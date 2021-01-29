import React, { Component } from 'react';
import PropTypes from 'prop-types';
import style from './Message.module.css';
import Origin from "../../constant/Origin";
import classNames from 'classnames';
import LocationMarker from '../LocationMarker/LocationMarker';
import DateTimeService from '../../service/DateTimeService';
import { MessageStateIndicator } from '../MessageStateIndicator';

class Message extends Component {
    static propTypes = {
        message: PropTypes.object,
        currentLocations: PropTypes.array,
        onSetLocations: PropTypes.func
    };

    constructor() {
        super();
        this.dateTimeService = DateTimeService.getInstance();
    }

    scrollIntoView(){
        this.element.scrollIntoView({behavior: "smooth"});
    }

    isOutgoing = () => this.props.message.origin === Origin.LOCAL;
    isIncoming = () => !this.isOutgoing();

    getMessageDirection() {
        return this.isIncoming() ? style.Incoming : style.Outgoing;
    }

    getMessageBackground() {
        return this.isIncoming() ? style.IncomingBackground : style.OutgoingBackground;
    }

    getTimeReceived() {
        return this.dateTimeService.toDateTime(this.props.message.received);
    }

    handleMapMarkerClick = (locations) => {
        if(this.props.onSetLocations)
            this.props.onSetLocations(locations);
    }

    hasLocations() {
        const { locations } = this.props.message;
        return (locations && locations.length > 0)
    }

    getLocations() {
        return this.props.message.locations;
    }

    getCurrentLocations() {
        return this.props.currentLocations;
    }

    render() {
        return (
            <div className={classNames(style.Message, this.getMessageDirection())} ref={(el) => this.element = el}>
                <div>
                    {this.props.message.text}
                </div>
                <div className={classNames(style.Meta)}>
                    <span>
                        {this.hasLocations() ?
                            <LocationMarker
                                locations={this.getLocations()}
                                currentLocations={this.getCurrentLocations()}
                                onClick={this.handleMapMarkerClick} /> : ''}
                    </span>
                    <span>
                        {/* message states are only available for outgoing messages */}
                        {
                            this.isOutgoing() ?
                                <MessageStateIndicator
                                    className={style.StateIndicator}
                                    message={this.props.message} /> :
                                undefined
                        }
                        {this.getTimeReceived()}
                    </span>
                </div>
            </div>
        );
    }
}

export default Message;
