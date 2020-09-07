// @ts-ignore
import mergeOptions from 'merge-options';
// @ts-ignore
import dCopy from 'deepcopy';

export function deepCopy(data: any) {
  return data ? dCopy(data) : data;
}

export function deepAssign(target: any, obj: any) {
  return mergeOptions(target, obj);
}