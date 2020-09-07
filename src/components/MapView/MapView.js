import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import style from './MapView.module.css';
import classNames from 'classnames';
import Messages from "../../i18n/Messages";
import { sort, distinctBy } from "../../utilities/ArrayUtilities.ts";
import ConfigService from "../../service/ConfigService";
import LocationUtilities from "../../utilities/LocationUtilities";
import {Map, TileLayer, Polyline, Marker, Circle, Tooltip, ScaleControl} from 'react-leaflet'
import { LocalizationService} from '../../service/LocalizationService';

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

    constructor() {
        super();
        this.intl = LocalizationService.getInstance();
    }

    componentDidMount() {
        // default initialization for map
        this.map.current.leafletElement.fitWorld();
        this._tryFitMap();
    }

    componentDidUpdate(prevProps) {
        this._tryFitMap(prevProps);
    }

    _didNotHaveAnyLocations(prevProps) {
        return this.props.locations && this.props.locations.length > 0 && (!prevProps.locations || prevProps.locations.length === 0);
    }

    _currentLocationsDidChange(prevProps) {
        return prevProps.currentLocations !== this.props.currentLocations;
    }

    _fitMap = () => {
        this.map.current.leafletElement.fitBounds(this.getMapBounds());
    }

    _tryFitMap(prevProps = {}) {
        // bounds and zoom of map are only updated if there hasn't been any locations before
        // or if currentLocations changed
        // otherwise it would be interfering with user's panning on map
        if (this._didNotHaveAnyLocations(prevProps) || this._currentLocationsDidChange(prevProps)) {
            this._fitMap();
        }
    }

    getZoomLevel() {
        return this.props.defaultZoomLevel || this.defaultZoomLevel;
    }

    getMapBounds() {     
        return LocationUtilities.getBounds(this.getMapLocations()) || this.defaultMapBounds;
    }

    hasCurrentLocations = () => this.props.currentLocations && this.props.currentLocations.length > 0;

    getMapLocations(locs) {
        const { locations } = this.props;

        // if no locations are passed, we look in our properties to find the correct ones
        if (!locs) {
            locs = locations;

            if (this.hasCurrentLocations())
                locs = this.props.currentLocations;
        }

        locs = distinctBy(locs, (x, y) => {
            return x.coords.longitude === y.coords.longitude
                && x.coords.latitude === y.coords.latitude;
        });
        locs = sort(locs, x => x.message.received, true);

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
        
        let allLocations = locations;
        let allLatLngLocations = latLngLocations;

        // if mapView does not have current locations
        // allLocations and locations would be the same
        // this way we save resources not fetching and converting the same array twice
        if (this.hasCurrentLocations()) {
            allLocations = this.getMapLocations(this.props.locations);
            allLatLngLocations = LocationUtilities.convertToLatLngArray(allLocations);
        }

        let elements = [];
        let polylineColor = ConfigService.get('ui', 'mapView', 'polyline', 'color');

        const { formatMessage } = this.intl;

        if (locations.length > 0) {
            const firstLatLng = latLngLocations[0];
            elements.push(this.getMarker(firstLatLng, 'main-marker'));
            
            const firstLocation = locations[0];
            const radius = firstLocation.radius;
            if (radius) {
                elements.push(
                    <Circle
                        center={firstLatLng}
                        color={polylineColor}
                        radius={radius}
                        key={`circle-${firstLatLng.toString()}`}>
                        <Tooltip direction={"right"} sticky={true}>
                            <div>{formatMessage(Messages.locationAccuracy, { radius: radius })}</div>
                        </Tooltip>
                    </Circle>
                );
            }
        }

        // we always want to draw the polyline and the start marker from all available locations
        // not only from the currently displayed ones
        if (allLatLngLocations.length > 1) {
            elements.push(
                <Polyline
                    color={polylineColor}
                    positions={allLatLngLocations}
                    key='polyline' />
            );
            elements.push(this.getMarker(allLatLngLocations[allLatLngLocations.length - 1], 'first-marker', 0.3));
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

    showsMultipleLocations() {
        return this.getMapLocations().length > 1;
    }

    showTitle() {
        return (this.props.showTitle) ? this.props.showTitle : false;
    }

    handleMyLocationClick = () => {
        let latestLoc = this.getLatestLocation();
        if (this.map && this.map.current && latestLoc)
            this.map.current.leafletElement.panTo(LocationUtilities.convertToLatLng(latestLoc));
    };

    handleShowAllLocations = () => {
        this._fitMap();
    }

    render() {
        const { formatMessage } = this.intl;

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
                        <div>
                            <button disabled={this.getDisabledState()}
                                className="btn btn-default hidePrint"
                                onClick={this.handleMyLocationClick}>
                                <span className="glyphicon glyphicon-map-marker" /> {formatMessage(Messages.showLatestLocation)}
                            </button>
                            <button disabled={this.getDisabledState() || !this.showsMultipleLocations()}
                                className="btn btn-default hidePrint"
                                onClick={this.handleShowAllLocations}>
                                <span className="glyphicon glyphicon-globe" /> {formatMessage(Messages.overview)}
                        </button>
                        </div>
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
