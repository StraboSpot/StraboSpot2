import {useSelector} from 'react-redux';
import {Alert} from 'react-native';

const useServerRequests = () => {
  const user = useSelector(state => state.user);
  const baseUrl = 'https://strabospot.org/db';

  const addDatasetToProject = (projectId, datasetId, encodedLogin) => {
  return post('/projectDatasets/' + projectId, encodedLogin, {id: datasetId});
  };

  const authenticateUser = async (username, password) => {
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
      Alert.alert(error);
    }
  };

  const request = async (method, urlPart, login, ...otherParams) => {
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
  };

  const post = async (urlPart, login, data) => {
    const response = await fetch(baseUrl + urlPart, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: 'Basic ' + login,
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  };

  const getDataset = (datasetId) => {
    return request('GET', '/dataset/' + datasetId);
  };

  const getDatasetSpots = (datasetId, encodedLogin) => {
    return request('GET','/datasetSpots/' + datasetId, encodedLogin);
  };

  const downloadImage = (imageId, encodedLogin) => {
    return request('GET', '/image/' + imageId, encodedLogin, {responseType: 'blob'});
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
    return request('GET','/myProjects', encodedLogin);
  };

  const handleError = (response) => {
      return Promise.reject(response);
  };

  const handleResponse = response => {
    if (response.ok) {
      return response.json();
    }
    else return handleError(response);
  };

  const timeoutPromise = (ms, promise) => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        Alert.alert('There was an error getting your request');
        reject(new Error('promise timeout'));
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
    },);
    const modifiedBaseUrl = baseUrl.slice(0, baseUrl.lastIndexOf('/'));
    const response = await fetch(modifiedBaseUrl + '/userRegister',{
      method: 'POST',
      body: newAccount,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  };

  const updateDataset = (dataset, encodedLogin) => {
    return post('/dataset', encodedLogin, dataset);
  };

  const updateDatasetSpots = (datasetId, spotCollection, encodedLogin) => {
    return post('/datasetspots/' + datasetId, encodedLogin, spotCollection);
  };

  const updateProject = (project, encodedLogin) => {
    return post('/project', encodedLogin, project,);
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

  const verifyImageExistence = (imageId, encodedLogin) => {
    return request('GET', '/verifyimage/' + imageId, encodedLogin);
  };

  const serverRequests = {
    addDatasetToProject:addDatasetToProject,
    authenticateUser: authenticateUser,
    downloadImage: downloadImage,
    getMyProjects: getMyProjects,
    getDatasets: getDatasets,
    getDatasetSpots: getDatasetSpots,
    getDataset: getDataset,
    getProfile: getProfile,
    getProject: getProject,
    getProfileImage: getProfileImage,
    registerUser: registerUser,
    updateDataset: updateDataset,
    updateDatasetSpots: updateDatasetSpots,
    updateProject: updateProject,
    uploadImage: uploadImage,
    verifyImageExistence: verifyImageExistence,
  };

  return [serverRequests];
};

export default useServerRequests;


