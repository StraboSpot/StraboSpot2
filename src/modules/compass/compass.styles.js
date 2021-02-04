import {StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const styles = StyleSheet.create({
  buttonContainer: {
    paddingBottom: 10,
  },
  buttonTitleStyle: {
    color: themes.PRIMARY_ACCENT_COLOR,
    fontSize: 16,
  },
  compassContainer: {
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  compassImage: {
    marginTop: 15,
    height: 175,
    width: 175,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compassImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderContainer: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  sliderHeading: {
    fontWeight: 'bold',
    fontSize: themes.PRIMARY_TEXT_SIZE - 3,
    color: themes.PRIMARY_TEXT_COLOR,
  },
  sliderText: {
    color: themes.PRIMARY_TEXT_COLOR,
    fontSize: 16,
  },
  strikeAndDipLine: {
    zIndex: 10,
    height: 125,
    width: 125,
    position: 'absolute',
    top: 40,
    resizeMode: 'contain',
  },
  trendLine: {
    height: 105,
    width: 105,
    position: 'absolute',
    top: 50,
    resizeMode: 'contain',
  },
});

export default styles;
