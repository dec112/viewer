class LocationUtilities {

  /**
   * 
   * @param {object[]} locations 
   * @param {number} radiusForSinglePoint in meters
   */
  static getBounds(locations, radiusForSinglePoint = 100) {
    let maxLat = Number.MIN_VALUE;
    let maxLon = Number.MIN_VALUE;
    let minLat = Number.MAX_VALUE;
    let minLon = Number.MAX_VALUE;

    if (!Array.isArray(locations) || locations.length === 0)
      return;

    for (let loc of locations) {
      let c = loc.coords;

      maxLat = Math.max(maxLat, c.latitude);
      maxLon = Math.max(maxLon, c.longitude);
      minLat = Math.min(minLat, c.latitude);
      minLon = Math.min(minLon, c.longitude);
    }

    if (locations.length === 1) {
      // this is just an approximation according to: https://stackoverflow.com/questions/1253499/simple-calculations-for-working-with-lat-lon-km-distance
      let latRadiusInDegrees = radiusForSinglePoint / 110574.0;
      maxLat += latRadiusInDegrees;
      minLat -= latRadiusInDegrees;
      
      let lonRadiusInDegrees = radiusForSinglePoint / (111320.0 * Math.cos((minLon + maxLon) * Math.PI / 180));
      maxLon += lonRadiusInDegrees;
      minLon -= lonRadiusInDegrees;
    }

    return [
      [minLat, minLon],
      [maxLat, maxLon]
    ];
  }

  static convertToLatLng(location) {
    return [location.coords.latitude, location.coords.longitude];
  }

  static convertToLatLngArray(locations) {
    return locations.map((x) => LocationUtilities.convertToLatLng(x));
  }
}

export default LocationUtilities