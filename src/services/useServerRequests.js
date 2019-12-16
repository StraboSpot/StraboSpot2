import {useSelector} from 'react-redux';
import {Alert} from 'react-native';

const useServerRequests = () => {
  const user = useSelector(state => state.user);
  const baseUrl = 'https://strabospot.org/db';

  const request = async (method, urlPart, login, data) => {
    console.table(user.encoded_login);
    const response = await timeoutPromise(10000, fetch(baseUrl + urlPart, {
      method: method,
      headers: {
        Authorization: 'Basic ' + login + '/',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }));
    console.table(response);
    return handleResponse(response);
  };

  const getDataset = (datasetId) => {
    return request('GET', '/dataset/' + datasetId);
  };

  const getDatasetSpots = (datasetId, encodedLogin) => {
    return request('GET','/datasetSpots/' + datasetId, encodedLogin);
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
    console.log('Getting project...');
    return await request('GET', '/project/' + projectId, encodedLogin);
  };

  const getDatasets = async (projectId, encodedLogin) => {
    return request('GET', '/projectDatasets/' + projectId, encodedLogin);
  };

  const getMyProjects = (encodedLogin) => {
    return request('GET','/myProjects', encodedLogin);
  };

  const handleError = (response) => {
    console.log(response);
    if (!response.ok) {
      return Promise.reject('Error Retrieving Data!');
    }
  };

  const handleResponse = response => {
    console.log('REQ Status', response.status);
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

  const updateProject = (project, encodedLogin) => {
    return request('POST', '/project1', encodedLogin, project,);
  };

  const serverRequests = {
    getMyProjects: getMyProjects,
    getDatasets: getDatasets,
    getDatasetSpots: getDatasetSpots,
    getDataset: getDataset,
    getProfile: getProfile,
    getProject: getProject,
    getProfileImage: getProfileImage,
  };

  return [serverRequests];
};

export default useServerRequests;


