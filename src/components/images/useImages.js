import React from 'react';
import {Platform, Text, View} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';

const useImages = (props) => {

  let imageCount = 0;
  let dirs = RNFetchBlob.fs.dirs;
  // const url = 'https://strabospot.org/testimages/images.json';
  const devicePath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.SDCardDir; // ios : android
  const appDirectory = '/StraboSpot';
  const imagesDirectory = devicePath + appDirectory + '/Images';

  const doesImageExist = async (imageId) => {
    const filePath = devicePath + imagesDirectory;
    const fileName = imageId.toString() + '.jpg';
    const fileURI = filePath + '/' + fileName;
    console.log('Looking on device for file URI: ', fileURI);
    return await RNFetchBlob.fs.exists(fileURI).then(exist => {
        console.log(`File URI ${fileURI} does ${exist ? '' : 'not'} exist on device`);
        return exist;
      },
    )
      .catch((err) => {
        throw err;
      });
  };

  return [{
    doesImageExist: doesImageExist,
  }];
};

export default useImages;
