import {StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const imageStyles = StyleSheet.create({
  buttonContainer: {
    backgroundColor: 'white',
    borderColor: 'grey',
    borderWidth: 1,
    margin: 5,
  },
  buttonsContainer: {
    flexDirection: 'row',
  },
  cardContainer: {
    backgroundColor: 'white',
    justifyContent: 'center',
    margin: 0,
    // paddingHorizontal: 10,
    padding: 0,
    paddingTop: 10,
  },
  closeButtonContainer: {
    position: 'absolute',
    right: 20,
    top: 40,
  },
  closeButtonStyle: {
    height: 40,
    width: 40,
  },
  galleryImageContainer: {
    flex: 1,
  },
  icon: {
    paddingRight: 10,
  },
  imageContainer: {
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    borderBottomColor: themes.LIST_BORDER_COLOR,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
  },
  imageInfoButtons: {
    marginTop: 20,
  },
  notebookImage: {
    height: 100,
    width: 145,
  },
  rightsideIcons: {
    bottom: 50,
    position: 'absolute',
    right: 10,
  },
  switch: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  thumbnail: {
    height: 90,
    width: 90,
  },
  thumbnailContainer: {
    margin: 5,
    width: 90,
  },
});

export default imageStyles;
