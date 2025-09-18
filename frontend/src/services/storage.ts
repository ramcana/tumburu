export const saveToStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};
export const getFromStorage = (key: string) => {
  const v = localStorage.getItem(key);
  return v ? JSON.parse(v) : null;
};