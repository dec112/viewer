interface KeyItems {
    key: string;
    items: Array<any>;
}

export function sort<T>(arr: Array<T>, propFunc: (x: T) => any, desc = false) {
    return arr.sort((x, y) => {
        x = propFunc(x);
        y = propFunc(y);

        let res = 0;

        if (x > y) res = 1;
        if (x < y) res = -1;
        if (desc) res *= -1;

        return res;
    })
}

export function groupBy<T>(arr: Array<T>, keyFunc: Function) {
    return arr.reduce((groups, item) => {
        const keyVal = keyFunc(item);
        let entry = groups.find(x => x.key === keyVal);

        if (!entry) {
            entry = {
                key: keyVal,
                items: []
            };
            groups.push(entry);
        }

        entry.items.push(item);
        return groups;
    }, [] as Array<KeyItems>);
}

export function distinctBy<T>(arr: Array<T>, compareFunc: Function) {
    return arr.filter((item: T, index: number, self: Array<T>) =>
        index === self.findIndex((x: T) => compareFunc(item, x))
    );
}
