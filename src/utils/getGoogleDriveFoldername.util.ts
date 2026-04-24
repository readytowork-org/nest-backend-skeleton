export const getGoogleDriveFoldername = (
  name: string,
  email: string,
): string => {
  return `${name}様/${email}`;
};
