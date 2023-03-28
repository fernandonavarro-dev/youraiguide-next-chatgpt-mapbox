export const formatLocation = (cityState: string, zipCode: string) => {
  let location = '';

  if (zipCode) {
    location = zipCode;
  } else if (cityState) {
    location = cityState;
  }

  return location;
};
