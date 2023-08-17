import {Platform} from 'react-native';

import {launchImageLibrary} from 'react-native-image-picker';
import {useDispatch, useSelector} from 'react-redux';

import {setLoadingStatus} from '../home/home.slice';
import {updatedModifiedTimestampsBySpotsIds} from '../project/projects.slice';
import {editedSpotImages} from '../spots/spots.slice';
import useImagesHook from './useImages';


const useImportImages = () => {
  let imageCount = 0;

  const [useImages] = useImagesHook();

  const dispatch = useDispatch();
  const selectedSpot = useSelector(state => state.spot.selectedSpot);

  const getImagesFromCameraRoll = async () => {
    return new Promise((res, rej) => {
      try {
        const selectionLimitNumber = Platform.OS === 'ios' ? 10 : 0;
        launchImageLibrary({selectionLimit: selectionLimitNumber}, async (response) => {
          console.log('RES', response);
          if (response.didCancel) dispatch(setLoadingStatus({view: 'home', bool: false}));
          else if (response.errorCode === 'others') {
            console.error(response.errorMessage('Error Here'));
            dispatch(setLoadingStatus({view: 'home', bool: false}));
          }
          else {
            const imageAsset = response.assets;
            await Promise.all(
              imageAsset.map(async (image) => {
                let imageFile = image;
                imageCount++;
                if (image.fileSize > 4032000) {
                  imageFile = await useImages.resizeImageIfNecessary(image);
                }
                const savedPhoto = await useImages.saveFile(imageFile);
                console.log('Saved Photo in getImagesFromCameraRoll:', savedPhoto);
                await dispatch(editedSpotImages([savedPhoto]));
                dispatch(updatedModifiedTimestampsBySpotsIds([selectedSpot.properties.id]));
              }),
            );
            res(imageCount);
          }
        });
      }
      catch (err) {
        console.error('Error saving image');
        dispatch(setLoadingStatus({view: 'home', bool: false}));
        rej('Error saving image.');
      }
    });
  };

  const getImages = async () => {
    // dispatch(setLoadingStatus({view: 'home', bool: true}));
    return await getImagesFromCameraRoll();
  };

  return {
    getImages: getImages,
    // imageResizer: imageResizer,
  };
};

export default useImportImages;

