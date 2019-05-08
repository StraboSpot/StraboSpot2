import ImagePicker from "react-native-image-picker";
import {saveFile} from "../../services/images/ImageDownload";

const imageOptions = {
  storageOptions: {
    skipBackup: true,
    takePhotoButtonTitle: 'Take Photo Buddy!',
    chooseFromLibraryButtonTitle: 'choose photo from library'
  }
};

export const takePicture = async () => {
  console.log('aassaasswwww')
  return new Promise((resolve, reject) => {
    ImagePicker.launchCamera(imageOptions, async (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
        resolve('cancelled')
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }
      else {
        const savedPhoto = await saveFile(response.uri);
        console.log('Saved Photo = ', savedPhoto);
        resolve(savedPhoto);
      }
    });
  })
};
