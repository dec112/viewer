import * as CommonUtilities from "./CommonUtilities";

/**
 * this function brings everything down to a maximum
 * object depth of 2
 * So objects will eventually look like: {a: {x1: 1, x2: 2, x3: 3}, b: {y1: 4, y2: 5, y3: 6}}
 * 
 * it is is basically a redundant version of
 * flattenObject with a kind of weird behaviour.
 * but is still needed for rendering data tables correctly
 * 
 * @deprecated
 */
export function unnestObject(
  toFlatten: any,
  target: any = {},
  level = 0,
  keys: Array<string> = []
) {
  if (level === 0)
    // we don't want to alter the original object
    toFlatten = CommonUtilities.deepCopy(toFlatten);

  for (const key in toFlatten) {
    const source = toFlatten[key];
    const type = typeof source;
    // null is also identified as "object", weird
    // this is why we also check on the object itself
    const isObject = !!source && type === 'object';
    if (isObject) {
      unnestObject(source, target, level + 1, keys.concat([key]));
    }

    // level 0 properties have to be moved to the new object
    if (level === 0 || isObject) {
      const toMove = toFlatten[key];
      delete toFlatten[key];
      // we only want to keep properties and non-empty objects
      if (!isObject || (isObject && Object.keys(toMove).length > 0)) {
        target[key] = toMove;
      }
    }
  }

  return target;
}

function _flattenObject(
  toFlatten: any,
  preservePaths: boolean,
  target: any,
  keys: Array<string>,
) {
  for (const key in toFlatten) {
    const source = toFlatten[key];
    const type = typeof source;
    // null is also identified as "object", weird
    // this is why we also check on the object itself
    const isObject = !!source && type === 'object';
    if (isObject) {
      _flattenObject(source, preservePaths, target, keys.concat([key]));
    }

    if (!isObject) {
      const toMove = toFlatten[key];
      const tmpKey = preservePaths ? keys.concat(key).join('.') : key;
      target[tmpKey] = toMove;
    }
  }

  return target;
}

// this function is just here to provide default values
export function flattenObject(
  toFlatten: any,
  preservePaths = true,
  target: any = {},
  keys: Array<string> = []
) {
  return _flattenObject(
    CommonUtilities.deepCopy(toFlatten),
    preservePaths,
    target,
    keys,
  );
}

// Thanks to https://codeburst.io/throttling-and-debouncing-in-javascript-b01cad5c8edf
export function throttle(func: Function, limit: number = 250): Function {
  let lastFunc: number;
  let lastRan: number;
  return function (this: any) {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args)
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = window.setTimeout(function () {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args)
          lastRan = Date.now()
        }
      }, limit - (Date.now() - lastRan));
    }
  }
}

// Thanks to https://gist.github.com/beaucharman/1f93fdd7c72860736643d1ab274fee1a
export function debounce<T extends Function>(callback: T, wait: number, immediate = false): T {
  let timeout: number;

  const newFunc = (...x: Array<any>) => {
    const callNow = immediate && !timeout;
    const next = () => callback(...x);

    clearTimeout(timeout);
    timeout = window.setTimeout(next, wait);

    if (callNow) {
      next();
    }
  }
  return newFunc as any;
}

export function tryGet(obj: any, ...path: Array<string>) {
  path = path || [];
  return path.reduce((prev, curr) => {
    if (!prev)
      return undefined;

    return prev[curr];
  }, obj);
}

export function minmax(min: number, value: number, max: number): number {
  return Math.min(Math.max(min, value), max);
}

const alpha = 'abcdefghijklmnopqrstuvwxyz';
const numeric = '1234567890';

const allowedChars = `${alpha}${alpha.toUpperCase()}${numeric}`;

export const getRandomString = (size: number) => {
  const arr = [];

  for (let i = 0; i < size; i++) {
    arr.push(allowedChars.charAt(Math.floor(Math.random() * allowedChars.length)));
  }

  return arr.join('');
}