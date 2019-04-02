/* eslint-disable no-unused-vars,consistent-return,no-param-reassign */
class CommonUtilities {
  static deepCopy(data) {
    return data ? JSON.parse(JSON.stringify(data)) : data;
  }

  /**
   * Updates all existing properties from newObject into object.
   * Only properties will be updated, which already exists in object.
   *
   * @param object
   * @param newObject
   */
  static updateObjectProperties(object, newObject) {
    if (!object) {
      return object;
    }
    Object.keys(object).forEach((key, index) => {
      const newPropertyData = newObject[key];
      if (newPropertyData !== undefined) {
        object[key] = newPropertyData;
      }
    });
  }

  /**
   * Merge all properties of newObject into object.
   * If the property exists in object, it will be updated.
   *
   * @param object
   * @param newObject
   */
  static mergeObjectProperties(object, newObject) {
    if (!object) {
      return object;
    }
    Object.keys(newObject).forEach((key, index) => {
      const newPropertyData = newObject[key];
      if (newPropertyData !== undefined) {
        object[key] = newPropertyData;
      }
    });
  }
}

export default CommonUtilities;
