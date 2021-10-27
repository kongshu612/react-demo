export function isObject(obj: any) {
  return (
    typeof obj === "object" &&
    obj !== null &&
    Object.getPrototypeOf(obj) == Object.prototype
  );
}

/**
 * Copy values into store and return a new values object
 * ({ a: 1, b: { c: 2 } }, { a: 4, b: { d: 5 } }) => { a: 4, b: { c: 2, d: 5 } }
 */
function internalSetValues<T = any>(store: T, values: T): T {
  const newStore: T = (Array.isArray(store) ? [...store] : { ...store }) as T;
  if (!values) {
    return newStore;
  }
  Object.keys(values).forEach((key) => {
    const prevValue = (newStore as any)[key];
    const value = (values as any)[key];

    const recursive = isObject(prevValue) && isObject(value);
    (newStore as any)[key] = recursive
      ? internalSetValues(prevValue, value)
      : value;
  });
  return newStore;
}

// lodash_merge()
export function setValues<T>(store: T, ...restValues: T[]): T {
  return restValues.reduce(
    (current: T, newStore: T) => internalSetValues(current, newStore),
    store
  );
}
