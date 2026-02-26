export const mergeUniqueFiles = (
  existingFiles: File[],
  newFiles: File[],
): File[] => {
  const existingKeys = new Set(
    existingFiles.map(file => file.name + file.size),
  );
  const uniqueFiles = newFiles.filter(
    file => !existingKeys.has(file.name + file.size),
  );
  return [...existingFiles, ...uniqueFiles];
};
