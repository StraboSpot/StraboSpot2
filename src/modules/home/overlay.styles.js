import {Dimensions, Platform, StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const platform = Platform.OS === 'ios' ? 'window' : 'screen';
const deviceDimensions = Dimensions.get(platform);

const styles = StyleSheet.create({
  animationContainer: {
    height: 150,
    marginBottom: 20,
  },
  backdropStyles: {
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingTop: 20,
  },
  buttonText: {
    color: themes.PRIMARY_TEXT_COLOR,
    fontSize: themes.PRIMARY_TEXT_SIZE,
  },
  closeButton: {
    alignItems: 'flex-end',
  },
  customBaseMapListContainer: {
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    paddingBottom: 10,
    paddingTop: 10,
  },
  disabledButtonText: {
    color: themes.PRIMARY_TEXT_COLOR,
  },
  importantText: {
    color: 'red',
    fontWeight: themes.TEXT_WEIGHT,
    textAlign: 'center',
  },
  inputContainer: {
    width: 250,
    height: 40,
    borderBottomWidth: 1,
  },
  titleContainer: {
    // backgroundColor: themes.LIGHTGREY,
    margin: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: 'lightgrey',
  },
  titleText: {
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
    fontWeight: themes.TEXT_WEIGHT,
    color: themes.PRIMARY_TEXT_COLOR,
    paddingBottom: 10,
    textAlign: 'center',
  },
  titleTextError: {
    color: 'red',
  },
  titleTextWarning: {
    color: 'yellow',
    textShadowColor: 'black',
    textShadowRadius: 2,
  },
  statusMessageText: {
    textAlign: 'center',
    padding: 10,
  },
  overlayContainer: {
    paddingBottom: 30,
    width: 300,
    maxHeight: deviceDimensions.height * .95,
    borderRadius: 20,
  },
  overlayContent: {
    marginTop: 5,
    alignItems: 'center',
  },
  contentText: {
    padding: 5,
    textAlign: 'center',
  },
  // Extra Specific Modal Styles
  selectGeometryTypeContent: {
    alignItems: 'flex-start',
    marginLeft: 20,
  },
  tagColorPickerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tagColorPickerColorItem: {
    width: 25,
    height: 25,
  },
  urlText: {
    fontSize: themes.SMALL_TEXT_SIZE,
  },
});

export default styles;
