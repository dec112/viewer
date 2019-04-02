class ArrayUtilities {
    static getMaxNumberValue(array, propertyName) {
    let maxColums =0;
    for(var i = 0; i < array.length; i++){
        if(array[i][propertyName] > maxColums){
                maxColums = array[i][propertyName];
            }
        }
        return maxColums;
    }

    static contains(array, itemToCompare, property) {
        return array.filter((e) => e[property] === itemToCompare[property]).length > 0;
    }

    static distinctBy(array, compareFunc) {
        return array.filter((item, index, self) =>
            index === self.findIndex(x => compareFunc(item, x))
        );
    }

    static sort(array, func, reverse = false) {
        if (typeof func !== 'function') {
            // treat func as property
            let prop = func;
            func = (element) => element[prop];
        }

        return array.sort(function (a, b) {
            if (func(a) < func(b)) return (reverse ? 1 : -1);
            if (func(a) > func(b)) return (reverse ? -1 : 1);
            return 0;
        });
    }

    static reverse(array, func){
        return ArrayUtilities.sort(array, func, true);
    }

    static groupBy(array, comparer) {
        return array.reduce(function (groupObj, item) {
            var groupKey = comparer(item);
            (groupObj[groupKey]= groupObj[groupKey] || []).push(item);
            return groupObj;
        }, {});
    }
}

export default ArrayUtilities;
