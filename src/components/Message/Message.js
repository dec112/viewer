import React, { Component } from 'react';
import PropTypes from 'prop-types';
import style from './Message.module.css';
import Origin from "../../constant/Origin";
import DateTimeUtilities from "../../utilities/DateTimeUtilities"
import classNames from 'classnames';
import LanguageService from '../../service/LanguageService';
import LocationMarker from '../LocationMarker/LocationMarker';

class Message extends Component {
    static propTypes = {
        text: PropTypes.string.isRequired,
        timeReceived: PropTypes.any.isRequired,
        origin: PropTypes.string.isRequired,
        locations: PropTypes.array,
        currentLocations: PropTypes.array,
        onSetLocations: PropTypes.func
    };

    scrollIntoView(){
        this.element.scrollIntoView({behavior: "smooth"});
    }

    getMessageDirection() {
        return (this.props.origin === Origin.REMOTE || this.props.origin === Origin.SYSTEM) ? style.Incoming : style.Outgoing;
    }

    getMessageBackground() {
        return (this.props.origin === Origin.REMOTE || this.props.origin === Origin.SYSTEM) ? style.IncomingBackground : style.OutgoingBackground;
    }

    getUserInformationAlignment() {
        return (this.props.origin === Origin.REMOTE || this.props.origin === Origin.SYSTEM) ? style.Right : style.Left;
    }

    getArrowStyle() {
        return (this.props.origin === Origin.REMOTE || this.props.origin === Origin.SYSTEM) ? style.IncomingArrow : style.OutgoingArrow;
    }

    getTimeReceived() {
        return DateTimeUtilities.toDateTime(this.props.timeReceived, LanguageService.getInstance().getCurrentLanguage());
    }

    handleMapMarkerClick = (locations) => {
        if(this.props.onSetLocations)
            this.props.onSetLocations(locations);
    }

    hasLocations() {
        return (this.props.locations && this.props.locations.length > 0)
    }

    getLocations() {
        return this.props.locations;
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
                    <span>{this.getTimeReceived()}</span>
                </div>
                <div className={classNames(style.MessageBody, this.getMessageBackground(), style.Arrow, this.getArrowStyle())}>
                    {this.props.text}
                </div>
            </div>)
    }
}

export default Message;
