import React from 'react';

const baseUrl = 'https://strabospot.org/db';

export const authenticateUser = async (username, password) => {
  const authenticationBaseUrl = baseUrl.slice(0, baseUrl.lastIndexOf('/')); //URL to send authentication API call
  try {
    let response = await fetch(authenticationBaseUrl + '/userAuthenticate',
      {
        method: 'POST',
        headers: {
          // TODO: ?? does not work when Accept is uncommented ??
          // Accept: 'application/json; charset=UTF-8',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          {email: username, password: password},
        ),
      },
    );
    let responseJson = await response.json();
    return responseJson.valid;
  }
  catch (error) {
    console.error(error);
  }
};
