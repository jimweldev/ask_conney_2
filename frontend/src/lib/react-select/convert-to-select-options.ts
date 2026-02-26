export const convertToSelectOptions = (arr: string[]) => {
  return arr.map(item => ({ value: item, label: item }));
};
