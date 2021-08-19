import {Alert} from 'react-native';

import * as Sentry from '@sentry/react-native';
import {useSelector} from 'react-redux';

const useServerRequests = () => {
  const databaseEndpoint = useSelector(state => state.project.databaseEndpoint);
  const baseUrl = databaseEndpoint.url && databaseEndpoint.isSelected
    ? databaseEndpoint.url
    : 'https://strabospot.org/db';
  const mapWarperApi = 'http://mapwarper.net/api/v1/maps/';
  const straboMyMapsApi = 'https://strabospot.org/geotiff/bbox/';
  const tilehost = 'http://tiles.strabospot.org/';

  const user = useSelector(state => state.user);

  const addDatasetToProject = (projectId, datasetId, encodedLogin) => {
    return post('/projectDatasets/' + projectId, encodedLogin, {id: datasetId});
  };

  const authenticateUser = async (username, password) => {
    const authenticationBaseUrl = baseUrl.slice(0, baseUrl.lastIndexOf('/')); //URL to send authentication API call
    let response = await timeoutPromise(30000, fetch(authenticationBaseUrl + '/userAuthenticate',
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
    ));
    if (!response.ok) {
      const errorText = await response.text();
      console.log('RESPONSE TEXT', errorText);
      Alert.alert('Server Error!', 'The server is temporarily unable to service your request due to'
        + ' maintenance downtime or capacity\n' + 'problems. Please try again later.');
    }
    else return await response.json();
  };

  const request = async (method, urlPart, login, ...otherParams) => {
    try {
      const response = await timeoutPromise(10000, fetch(baseUrl + urlPart, {
        method: method,
        headers: {
          Authorization: 'Basic ' + login + '/',
          'Content-Type': 'application/json',
        },
        // body: JSON.stringify({data: data}),
        ...otherParams,
      }));
      return handleResponse(response);
    }
    catch (err) {
      console.error('Error Fetching', err);
      Alert.alert('Error', `${err.toString()}`);
    }
  };

  const post = async (urlPart, login, data) => {
    try {
      const response = await fetch(baseUrl + urlPart, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          Authorization: 'Basic ' + login,
          'Content-Type': 'application/json',
        },
      });
      return handleResponse(response);
    }
    catch (err) {
      console.error('Error Posting', err);
      Alert.alert('Error', `${err.toString()}`);
    }
  };

  const deleteAllSpotsInDataset = (datasetId, encodedLogin) => {
    return request('DELETE', '/datasetSpots/' + datasetId, encodedLogin);
  };

  const getDataset = (datasetId) => {
    return request('GET', '/dataset/' + datasetId);
  };

  const getDatasetSpots = (datasetId, encodedLogin) => {
    return request('GET', '/datasetSpots/' + datasetId, encodedLogin);
  };

  const getDbUrl = () => {
    return baseUrl;
  };

  const downloadImage = (imageId, encodedLogin) => {
    return request('GET', '/image/' + imageId, encodedLogin, {responseType: 'blob'});
  };

  const getMapWarperBbox = async (mapId) => {
    const response = await fetch(mapWarperApi + mapId);
    const responseJson = await response.json();
    console.log('MAPWARPER MAP RES', responseJson);
    return responseJson;
  };

  const getMyMapsBbox = async (mapId) => {
    const response = await fetch(straboMyMapsApi + mapId);
    const responseJson = await response.json();
    console.log('MY MAPS RES', responseJson);
    return responseJson;
  };

  const getProfileImage = async (encodedLogin) => {
    let imageBlob = null;
    try {
      let imageResponse = await fetch(baseUrl + '/profileimage', {
        method: 'GET',
        responseType: 'blob',
        headers: {
          Authorization: 'Basic ' + encodedLogin,
        },
      });
      if (imageResponse.status === 200) {
        imageBlob = imageResponse.blob();
        return imageBlob;
      }
      else {
        imageBlob = null;
        return imageBlob;
      }
    }
    catch (error) {
      console.error(error);
    }
  };

  const getProfile = (encodedLogin) => {
    return request('GET', '/profile', encodedLogin);
  };

  const getProject = async (projectId, encodedLogin) => {
    return await request('GET', '/project/' + projectId, encodedLogin);
  };

  const getDatasets = async (projectId, encodedLogin) => {
    return request('GET', '/projectDatasets/' + projectId, encodedLogin);
  };

  const getMyProjects = (encodedLogin) => {
    return request('GET', '/myProjects', encodedLogin);
  };

  const getMapTilesFromHost = async (zipUrl) => {
    const response = await timeoutPromise(30000, fetch(zipUrl));
    return await response.json();
  };

  const handleError = async (response) => {
    const errorMessage = JSON.parse(await response.text());
    Sentry.captureMessage(`ERROR in useServerRequests: ${errorMessage.Error}`);
    return Promise.reject(errorMessage.Error);
  };

  const handleResponse = response => {
    if (response.ok && response.status === 204) return response.text();
    else if (response.ok) return response.json();
    else return handleError(response);
  };

  const timeoutPromise = async (ms, promise) => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        // Alert.alert('There was an error getting your request');
        reject(new Error('Network timeout'));
      }, ms);
      promise.then((res) => {
          clearTimeout(timeout);
          resolve(res);
        },
        (err) => {
          clearTimeout(timeout);
          reject(err);
        },
      );
    });
  };

  // Register user
  const registerUser = async (newAccountInfo) => {
    const newAccount = JSON.stringify({
      first_name: newAccountInfo.firstName.value,
      last_name: newAccountInfo.lastName.value,
      email: newAccountInfo.email.value,
      password: newAccountInfo.password.value,
      confirm_password: newAccountInfo.confirmPassword.value,
    });
    const modifiedBaseUrl = baseUrl.slice(0, baseUrl.lastIndexOf('/'));
    const response = await fetch(modifiedBaseUrl + '/userRegister', {
      method: 'POST',
      body: newAccount,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  };


  const testCustomMapUrl = async (url) => {
    try {
      const response = await fetch(url);
      console.log(response);
      if (response.ok) {
        return response.ok;
      }
    }
    catch (e) {
      console.log('ERROR', e);
      return e;
    }
  };

  const updateDataset = (dataset, encodedLogin) => {
    return post('/dataset', encodedLogin, dataset);
  };

  const updateDatasetSpots = (datasetId, spotCollection, encodedLogin) => {
    return post('/datasetspots/' + datasetId, encodedLogin, spotCollection);
  };

  const updateProject = (project, encodedLogin) => {
    return post('/project', encodedLogin, project);
  };

  const uploadImage = async (formdata, encodedLogin) => {
    const response = await fetch(baseUrl + '/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': 'Basic ' + encodedLogin,
      },
      body: formdata,
    });
    return handleResponse(response);
  };

  const uploadProfileImage = async (formdata, encodedLogin) => {
    const response = await fetch(`${baseUrl}/profileImage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': 'Basic ' + encodedLogin,
      },
      body: formdata,
    });
    return handleResponse(response);
  };

  const updateProfile = (data) => {
    console.log(data);
    return post('/profile', user.encoded_login, data);
  };

  const verifyImageExistence = (imageId, encodedLogin) => {
    return request('GET', '/verifyimage/' + imageId, encodedLogin);
  };

  const zipURLStatus = async (zipId) => {
    try {
      let responseJson = {};
      const response = await timeoutPromise(30000, fetch(tilehost + 'asyncstatus/' + zipId));
      responseJson = await response.json();
      console.log(responseJson);
      if (responseJson.error) throw Error(responseJson.error);
      return responseJson;
    }
    catch (err) {
      console.error('There was an error in zipURLStatus', err);
      throw new Error(err);
    }
  };

  const serverRequests = {
    addDatasetToProject: addDatasetToProject,
    authenticateUser: authenticateUser,
    deleteAllSpotsInDataset: deleteAllSpotsInDataset,
    downloadImage: downloadImage,
    getMyProjects: getMyProjects,
    getDatasets: getDatasets,
    getDatasetSpots: getDatasetSpots,
    getDataset: getDataset,
    getDbUrl: getDbUrl,
    getMapWarperBbox: getMapWarperBbox,
    getMyMapsBbox: getMyMapsBbox,
    getProfile: getProfile,
    getProject: getProject,
    getProfileImage: getProfileImage,
    getMapTilesFromHost: getMapTilesFromHost,
    registerUser: registerUser,
    testCustomMapUrl: testCustomMapUrl,
    timeoutPromise: timeoutPromise,
    updateDataset: updateDataset,
    updateDatasetSpots: updateDatasetSpots,
    updateProfile: updateProfile,
    updateProject: updateProject,
    uploadImage: uploadImage,
    uploadProfileImage: uploadProfileImage,
    verifyImageExistence: verifyImageExistence,
    zipURLStatus: zipURLStatus,
  };

  return [serverRequests];
};

export default useServerRequests;


