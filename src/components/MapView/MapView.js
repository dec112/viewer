import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import style from './MapView.css';
import classNames from 'classnames';
import LocalizationProvider from "../../provider/LocalizationProvider";
import Messages from "../../i18n/Messages";
import ArrayUtilities from "../../utilities/ArrayUtilities";
import ConfigService from "../../service/ConfigService";
import LocationUtilities from "../../utilities/LocationUtilities";
import {Map, TileLayer, Polyline, Marker, Circle, Tooltip, ScaleControl} from 'react-leaflet'

class MapView extends Component {

    static propTypes = {
        showTitle: PropTypes.bool,
        locations: PropTypes.array,
        currentLocations: PropTypes.array,
        defaultZoomLevel: PropTypes.number,
    };

    map = createRef();
    maxZoom = 19;
    defaultZoomLevel = 15;
    defaultMapBounds = [[-1,-1], [1, 1]];

    componentDidMount() {
        // default initialization for map
        this.map.current.leafletElement.fitWorld();
    }

    _didNotHaveAnyLocations(prevProps) {
        return this.props.locations && this.props.locations.length > 0 && (!prevProps.locations || prevProps.locations.length === 0);
    }

    _currentLocationsDidChange(prevProps) {
        return prevProps.currentLocations !== this.props.currentLocations;
    }

    componentDidUpdate(prevProps) {
        // bounds and zoom of map are only updated if there hasn't been any locations before
        // or if currentLocations changed
        // otherwise it would be interfering with user's panning on map
        if(this._didNotHaveAnyLocations(prevProps) || this._currentLocationsDidChange(prevProps)) {
            this.map.current.leafletElement.fitBounds(this.getMapBounds());
        }
    }

    getZoomLevel() {
        return this.props.defaultZoomLevel || this.defaultZoomLevel;
    }

    getMapBounds() {     
        return LocationUtilities.getBounds(this.getMapLocations()) || this.defaultMapBounds;
    }

    getMapLocations() {
        let locs = this.props.locations;
        
        if(this.props.currentLocations && this.props.currentLocations.length > 0) 
            locs = this.props.currentLocations;

        locs = ArrayUtilities.distinctBy(locs, (x, y) => {
            return x.coords.longitude === y.coords.longitude
                && x.coords.latitude === y.coords.latitude;
        });
        locs = ArrayUtilities.reverse(locs, 'timestamp');

        return locs;
    }

    getLatestLocation() {
        let locations = this.getMapLocations();
        if(locations && locations.length > 0)
            return locations[0];
    }

    getMarker(location, key, opacity) {
        return <Marker
            position={location}
            key={key}
            opacity={opacity} />
    }

    getMapOverlay() {
        let locations = this.getMapLocations();
        let latLngLocations = LocationUtilities.convertToLatLngArray(locations);
        let elements = [];
        let polylineColor = ConfigService.getConfig().ui.mapView.polyline.color;

        if (locations.length > 0)
            elements.push(this.getMarker(latLngLocations[0], 'main-marker'));
            latLngLocations.forEach((loc, index) => {
                let radius = locations[index].radius;

                if (radius !== null && radius !== undefined) {
                    elements.push(
                    <Circle
                        center={loc} 
                        color={polylineColor}
                        radius={radius}
                        key={`circle-${loc.toString()}`}>
                            <Tooltip direction={"right"} sticky={true}>
                                <div>{LocalizationProvider.formatMessage(Messages.locationAccuracy, {radius: radius})}</div>
                            </Tooltip>
                        </Circle>);
                }
            });

        if (latLngLocations.length > 1) {
            elements.push(
                <Polyline
                    color={polylineColor}
                    positions={latLngLocations}
                    key='polyline' />
            );
            elements.push(this.getMarker(latLngLocations[latLngLocations.length - 1], 'first-marker', 0.3));
        }
            
        return elements;
    }

    hasLocations() {
        return (this.props.locations && this.props.locations.length > 0);
    }

    getDisabledState() {
        return this.hasLocations() ? "" : "disabled";
    }

    isLatestLocation() {
        return !this.props.currentLocations
    }

    showTitle() {
        return (this.props.showTitle) ? this.props.showTitle : false;
    }

    handleMyLocationClick = () => {
        let latestLoc = this.getLatestLocation();
        if (this.map && this.map.current && latestLoc)
            this.map.current.leafletElement.panTo(LocationUtilities.convertToLatLng(latestLoc));
    };

    render() {
        const {formatMessage} = LocalizationProvider;
        return (<div>
            <div className={classNames('panel panel-default', style.noBorder)}>
                {this.showTitle() ? <div className="panel-heading">
                    <h3 className="panel-title">{formatMessage(Messages.map)}</h3>
                </div> : ''}
                <div className="panel-body">
                    <Map 
                        className={style.Map}
                        zoom={this.getZoomLevel()} 
                        animate={true}
                        maxZoom={this.maxZoom}
                        ref={this.map}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {this.getMapOverlay()}
                        <ScaleControl />
                    </Map>
                    <div className={classNames(style.InfoBar)} role="group" aria-label="...">
                        <button disabled={this.getDisabledState()}
                            className="btn btn-default hidePrint"
                            onClick={this.handleMyLocationClick}>
                            <span className="glyphicon glyphicon-map-marker" /> {formatMessage(Messages.centerMap)}
                        </button>
                        {this.hasLocations() ? '' :
                            <span className={classNames("label", "label-danger", style.Label)}>{formatMessage(Messages.noLocation)}</span>}
                        {this.isLatestLocation() ? '' :
                            <span className={classNames("label", "label-danger", style.Label)}>{formatMessage(Messages.displayedLocationNotLatest)}</span>}
                    </div>
                </div>
            </div>
        </div>);
    }
}

export default MapView;
