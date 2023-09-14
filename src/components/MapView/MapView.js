import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import './leaflet/leaflet.css';
import style from './MapView.module.css';
import classNames from 'classnames';
import Messages from "../../i18n/Messages";
import { sort, distinctBy } from "../../utilities/ArrayUtilities.ts";
import ConfigService from "../../service/ConfigService";
import LocationUtilities from "../../utilities/LocationUtilities";
import L from 'leaflet';
import { Map, TileLayer, Polyline, Marker, Circle, Tooltip, ScaleControl } from 'react-leaflet'
import { LocalizationService } from '../../service/LocalizationService';
import { UiService } from '../../service';
import ImageFile from '../../constant/ImageFile';
import UrlUtilities from '../../utilities/UrlUtilities';
import DateTimeService from '../../service/DateTimeService';

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
    defaultMapBounds = [[-1, -1], [1, 1]];

    constructor() {
        super();
        this.intl = LocalizationService.getInstance();
        this.dateTimeService = DateTimeService.getInstance();
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

    _getIcon(type) {
        const isMain = type === 'main';

        const iconUrl = isMain ?
            ImageFile.MAP_MAIN_MARKER :
            ImageFile.MAP_DEFAULT_MARKER;
        const iconRetinaUrl = isMain ?
            ImageFile.MAP_MAIN_MARKER_RETINA :
            ImageFile.MAP_DEFAULT_MARKER_RETINA;

        return L.icon({
            iconUrl: UrlUtilities.getAbsoluteUrl(iconUrl),
            iconRetinaUrl: UrlUtilities.getAbsoluteUrl(iconRetinaUrl),
            iconSize: [25, 41],
            iconAnchor: [12, 41],
        })
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

        // only accept locations that have both latitude and longitude available
        locs = locs.filter(x => x.coords.latitude !== undefined && x.coords.longitude !== undefined);
        locs = distinctBy(locs, (x, y) => {
            return x.coords.longitude === y.coords.longitude
                && x.coords.latitude === y.coords.latitude;
        });
        locs = sort(locs, x => x.message.received, true);

        return locs;
    }

    getLatestLocation() {
        let locations = this.getMapLocations();
        if (locations && locations.length > 0)
            return locations[0];
    }

    hasLatestLocation = () => !!this.getLatestLocation();

    getLocationToClipboardContent = () => {
        const loc = this.getLatestLocation();

        if (false === (
            loc &&
            loc.coords &&
            loc.coords.latitude &&
            loc.coords.longitude
        ))
            return;

        let text = ConfigService.get('ui', 'mapView', 'clipboardLocationTemplate');

        text = text.replace('{{latitude}}', loc.coords.latitude.toFixed(7));
        text = text.replace('{{longitude}}', loc.coords.longitude.toFixed(7));
        text = text.replace('{{radius}}', loc.radius || '');

        return text;
    }

    getMarker(location, key, opacity, children) {
        return <Marker
            position={location}
            key={key}
            opacity={opacity}
            icon={this._getIcon()}
        >
            {children}
        </Marker>
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

        if (locations.length > 0) {
            const { markerTooltip } = this.props;
            const firstLatLng = latLngLocations[0];

            // draw all locations that do not come via GPS
            // the user might have set them manually, which is quite important information
            for (let i = 0, size = allLocations.length; i < size; i++) {
                const loc = allLocations[i];
                if (loc.method?.toLowerCase() !== 'gps') {
                    elements.push(
                        this.getMarker(
                            LocationUtilities.convertToLatLng(loc),
                            `extra-marker-${i}`,
                            1,
                            <Tooltip permanent className={style.MarkerTooltip}>
                                {formatMessage(Messages.location)}: {loc.method}
                            </Tooltip>
                        )
                    );
                }
            }

            const firstLocation = locations[0];
            let toolTipContent = markerTooltip;
            if (!toolTipContent)
                toolTipContent = <>
                    {
                        formatMessage(Messages.showLatestLocation)
                    }
                    {
                        firstLocation.timestamp ?
                            <div>
                                {this.dateTimeService.toDateTime(firstLocation.timestamp)}
                            </div> :
                            undefined
                    }
                </>;

            elements.push(
                <Marker
                    position={firstLatLng}
                    key={`main-marker`}
                    opacity={1}
                    icon={this._getIcon('main')}
                >
                    <Tooltip permanent className={style.MarkerTooltip}>
                        {toolTipContent}
                    </Tooltip>
                </Marker>);

            const radius = firstLocation.radius;
            if (radius) {
                elements.push(
                    <Circle
                        center={firstLatLng}
                        color={polylineColor}
                        radius={radius}
                        key={`circle-${firstLatLng.toString()}`}>
                        <Tooltip direction={"right"} sticky={true}>
                            <div>{formatMessage(Messages.locationAccuracy, { radius: Math.round(radius) })}</div>
                        </Tooltip>
                    </Circle>
                );
            }
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

    handleLocationToClipboardClick = () => {
        UiService.getInstance().copyToClipboard(this.getLocationToClipboardContent());
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
                                {formatMessage(Messages.overview)}
                            </button>
                            {
                                this.hasLatestLocation() ?
                                    <button
                                        className="btn btn-default hidePrint"
                                        onClick={this.handleLocationToClipboardClick}>
                                        {this.getLocationToClipboardContent()}
                                    </button> : undefined
                            }
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
