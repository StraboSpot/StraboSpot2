import {StyleSheet} from 'react-native';

import {PRIMARY_TEXT_SIZE} from '../../shared/styles.constants';
import * as themes from '../../shared/styles.constants';

const splashScreenStyles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 70,
  },
  dimensionsContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  dimensionsText: {
    color: 'white',
    fontSize: PRIMARY_TEXT_SIZE,
    fontWeight: 'bold',
  },
  loadingSplashScreenText: {
    fontSize: themes.LARGE_TEXT_SIZE,
    fontWeight: themes.TEXT_WEIGHT,
    padding: 50,
  },
  title: {
    color: 'black',
    textShadowColor: 'white',
    textShadowRadius: 10,
  },
  titleContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  versionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionNumber: {
    color: 'black',
    fontFamily: 'ChalkboardSE-Bold',
    fontSize: 25,
    marginRight: 10,
    textAlign: 'right', textShadowColor: 'white',
    // marginBottom: 10,
    textShadowRadius: 10,
  },
  versionPositionSplashScreen: {
    marginVertical: 100,
  },
  wifiIndicatorContainer: {
    alignItems: 'flex-end',
    position: 'absolute',
    right: 10,
    top: 10,
  },
});

export default splashScreenStyles;
