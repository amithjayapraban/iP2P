export const formatFileName = (
  fileName: string,
  maxLength: number = 15
): string => {
  const fileParts = fileName.split(".");
  if (fileParts.length < 2) return fileName; // No extension, return as is

  const extension = fileParts.pop(); // Get the file extension
  const baseName = fileParts.join("."); // Get the base name

  if (baseName.length > maxLength) {
    const start = baseName.substring(0, 10);
    const end = baseName.substring(baseName.length - 5);
    return `${start}...${end}.${extension}`;
  }

  return fileName;
};
