import {StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const imageStyles = StyleSheet.create({
  buttonsContainer: {
    flexDirection: 'row',
  },
  buttonContainer: {
    backgroundColor: 'white',
    borderColor: 'grey',
    borderWidth: 1,
    margin: 5,
  },
  cardContainer: {
    margin: 0,
    justifyContent: 'center',
    padding: 0,
    // paddingHorizontal: 10,
    paddingTop: 10,
    backgroundColor: 'white',
  },
  closeButtonContainer: {
    position: 'absolute',
    right: 20,
    top: 40,
  },
  closeButtonStyle: {
    width: 40,
    height: 40,
  },
  icon: {
    paddingRight: 10,
  },
  imageContainer: {
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    borderBottomWidth: 1,
    borderBottomColor: themes.LIST_BORDER_COLOR,
    padding: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageInfoButtons: {
    marginTop: 20,
  },
  rightsideIcons: {
    position: 'absolute',
    right: 10,
    bottom: 50,
  },
  galleryImageContainer: {
    flex: 1,
  },
  thumbnailContainer: {
    width: 90,
    margin: 5,
  },
  notebookImage: {
    width: 145,
    height: 100,
  },
  thumbnail: {
    height: 90,
    width: 90,
  },
  switch: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default imageStyles;
