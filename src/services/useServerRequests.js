const baseUrl = 'https://strabospot.org/db';

const buildGetRequest = async (urlPart, login) => {
  try {
    let response = await fetch(baseUrl + urlPart, {
      method: 'GET',
      // url: baseUrl + urlPart,
      headers: {
        Authorization: 'Basic ' + login,
        'Content-Type': 'application/json',
      },
    });
    if (response.status === 200) {
      return await response.json();
    }
  }
  catch (error) {
    console.error(error);
  }
};

export const getDataset = async (datasetId, encodedLogin) => {
  return await buildGetRequest('/dataset/' + datasetId, encodedLogin);
};

export const getDatasetSpots = (datasetId, encodedLogin) => {
  return buildGetRequest('/datasetSpots/' + datasetId, encodedLogin);
};

export const getProfileImage = async (encodedLogin) => {
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

export const getProfile = async (encodedLogin) => {
  return await buildGetRequest('/profile', encodedLogin);
};

export const getProject = async (projectId, encoded_login) => {
  console.log('Getting project...');
  return await buildGetRequest(/project/ + projectId, encoded_login);
};

export const getDatasets = async (projectId, encodedLogin) => {
  try {
    let request = await timeoutPromise(10000,  fetch(baseUrl + '/projectDatasets/' + projectId , {
        method: 'GET',
        headers: {
          Authorization: 'Basic ' + encodedLogin + '\'',
          'Content-Type': 'application/json; charset=UTF-8',
        },
      })
  );
    console.log('Dataset REQ Status', request);
    if (request.status === 200) {
      return request.json();
    }
    else return request.status;
  }
  catch (e) {
    console.log('Dataset Error', e);
  }
};

export const getMyProjects = async (encodedLogin) => {
  try {
    let request = await timeoutPromise(10000, fetch(baseUrl + '/myProjects', {
        method: 'GET',
        headers: {
          Authorization: 'Basic ' + encodedLogin + '\'',
          'Content-Type': 'application/json',
        },
      }),
    );
    console.log('REQ Status', request.status);
    if (request.status === 200) {
      return await request.json();
    }
    else return request.status;
  }
  catch (error) {
    console.log('ERROR', error);
  }
};

const timeoutPromise = (ms, promise) => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
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

