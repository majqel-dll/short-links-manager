export function cleanObject<T extends Object>(object: T): T {
    Object.keys(object).forEach(key => {
        if (object[key] === undefined || object[key] === null) delete object[key];
        if (typeof object[key] === `object`) {
            cleanObject(object[key])
        }
    })
    return object;
};