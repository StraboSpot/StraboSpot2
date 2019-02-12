import React from 'react'
import {USERNAME_TEST} from '../../Config';
import {PASSWORD_TEST} from '../../Config';

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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(
          {email: USERNAME_TEST, password: PASSWORD_TEST}
        )
      }
    );
    let responseJson = await response.json();
    return responseJson.valid;
  } catch (error) {
    console.error(error);
  }
};
