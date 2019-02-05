import React from 'react';

const url = "https://strabospot.org/testimages/images.json";

export const getImages = async () => {
  let response = await fetch(url);
  let responseJson = await response.json();
  let imageURI = responseJson.images.map(imageUri => imageUri.URI);
  console.log("ImageUri", imageURI);
  // return responseJson.images
};
