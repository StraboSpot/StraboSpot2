import {Dimensions, Platform, StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const platform = Platform.OS === 'ios' ? 'window' : 'screen';
const deviceDimensions = Dimensions.get(platform);

const styles = StyleSheet.create({
  backdropStyles: {
    backgroundColor: 'transparent',
  },
  customBaseMapListContainer: {
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    paddingBottom: 10,
    paddingTop: 10,
  },
  titleContainer: {
    backgroundColor: themes.LIGHTGREY,
    margin: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: 'lightgrey',
  },
  titleText: {
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
    fontWeight: 'bold',
    color: themes.PRIMARY_TEXT_COLOR,
    paddingBottom: 10,
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
  },
  dialogLargerText: {
    color: themes.PRIMARY_TEXT_COLOR,
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  overlayContainer: {
    paddingBottom: 30,
    width: 300,
    maxHeight: deviceDimensions.height * .95,
    borderRadius: 20,
  },
  overlayContent: {
    marginTop: 10,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
  },
  dialogText: {
    color: themes.PRIMARY_TEXT_COLOR,
  },

});

export default styles;
