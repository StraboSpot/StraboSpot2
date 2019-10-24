import React from 'react';
import {Text, View} from 'react-native';

const baseUrl = 'https://strabospot.org/db';

const buildGetRequest = async (urlPart, login) => {
  try {
    let response = await fetch( baseUrl + urlPart,{
      method: 'GET',
      // url: baseUrl + urlPart,
      headers: {
        Authorization: 'Basic ' + login,
        'Content-Type': 'application/json'
      }
    });
    let responseJson = await response.json();
    // console.log('RESJSON', responseJson);
    return responseJson
  } catch (error) {
    console.error(error)
  }

    // .then(response => console.log(response.json()))
    // .then(responseJson => {
    //   console.log(responseJson)
    // })
};

export const getProfileImage = async (encodedLogin) => {
  try {
    let imageResponse = await fetch(baseUrl + '/profileimage', {
      method: 'GET',
      // 'url': baseUrl + '/profileimage',
      responseType: 'blob',
      headers: {
        Authorization: 'Basic ' + encodedLogin
      }
    })
    let imageBlob = imageResponse.blob();
    return imageBlob
    // return imageResponse
  } catch (error) {
    console.error(error)
  }
  };

export const getProfile = async (encodedLogin) => {
  return await buildGetRequest('/profile', encodedLogin)
};


