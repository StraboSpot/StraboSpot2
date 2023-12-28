import {Platform, StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';
import {SMALL_SCREEN} from '../../shared/styles.constants';

const styles = StyleSheet.create({
  animationContainer: {
    height: 150,
    marginBottom: 20,
  },
  backdropStyles: {
    backgroundColor: 'transparent',
  },
  baseMapPosition: {
    position: 'absolute',
    left: SMALL_SCREEN ? 10 : 75,
    bottom: SMALL_SCREEN ? 70 : 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingTop: 10,
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
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    borderWidth: 1,
  },
  mapActionsPosition: {
    position: 'absolute',
    left: SMALL_SCREEN ? 10 : 75,
    bottom: SMALL_SCREEN ? 10 : 100,
  },
  mapSymbolsPosition: {
    position: 'absolute',
    left: SMALL_SCREEN ? 10 :  75,
    bottom: SMALL_SCREEN ? 10 : 100,
  },
  titleContainer: {
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
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    borderColor: themes.MEDIUMGREY,
    borderRadius: themes.MODAL_BORDER_RADIUS,
    borderWidth: 0.5,
    elevation: 2,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    width: 300,
  },
  overlayContainerFullScreen: {
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    overflow: 'hidden',
    zIndex: 1,
    paddingTop: Platform.OS === 'ios' && SMALL_SCREEN ? 30 : 0,
  },
  overlayContent: {
    marginTop: 5,
    alignItems: 'center',
  },
  overlayPosition: {
    position: 'absolute',
    left: 70,
    bottom: 60,
  },
  contentText: {
    padding: 5,
    textAlign: 'center',
    fontSize: themes.MEDIUM_TEXT_SIZE
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
