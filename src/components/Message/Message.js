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

    getUserInformationAlignment() {
        return this.isIncoming() ? style.Right : style.Left;
    }

    getArrowStyle() {
        return this.isIncoming() ? style.IncomingArrow : style.OutgoingArrow;
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
                <div className={classNames(style.Header, this.getUserInformationAlignment())}>
                    <span>
                        {this.hasLocations() ?
                            <LocationMarker
                                locations={this.getLocations()}
                                currentLocations={this.getCurrentLocations()}
                                onClick={this.handleMapMarkerClick} /> : ''}
                    </span>
                    <span>
                        {this.getTimeReceived()}
                        {/* message states are only available for outgoing messages */}
                        {
                            this.isOutgoing() ?
                                <MessageStateIndicator
                                    className={style.StateIndicator}
                                    message={this.props.message} /> :
                                undefined
                        }
                    </span>
                </div>
                <div className={classNames(style.MessageBody, this.getMessageBackground(), style.Arrow, this.getArrowStyle())}>
                    {this.props.message.text}
                </div>
            </div>)
    }
}

export default Message;
