export const objIsEmpty = obj => !Object.keys(obj).length;
export const objValues = obj => Object.keys(obj).map(key => obj[key]);
