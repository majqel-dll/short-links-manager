export function cleanObject<T extends object>(object: T): T {
    Object.keys(object).forEach((key) => {
        if (object[key] === undefined || object[key] === null) {
            delete object[key];
        }
        if (typeof object[key] === `object`) {
            cleanObject(object[key]);
        }
    });
    return object;
}
