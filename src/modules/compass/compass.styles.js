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
  compassDataModalPosition: {
    borderRadius: 20,
    left: '30%',
    position: 'absolute',
    top: 20,
  },
  compassImage: {
    alignItems: 'center',
    height: 175,
    justifyContent: 'center',
    marginTop: 15,
    width: 175,
  },
  compassImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassMatrixDataText: {
    borderWidth: 1,
    padding: 5,
    // textAlign: 'center',
  },
  compassMatrixHeader: {
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  sliderContainer: {
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    justifyContent: 'center',
    padding: 10,
  },
  sliderHeading: {
    color: themes.PRIMARY_TEXT_COLOR,
    fontSize: themes.PRIMARY_TEXT_SIZE - 3,
    fontWeight: 'bold',
  },
  strikeAndDipLine: {
    height: 125,
    position: 'absolute',
    resizeMode: 'contain',
    top: 40,
    width: 125,
    zIndex: 10,
  },
  trendLine: {
    height: 105,
    position: 'absolute',
    resizeMode: 'contain',
    top: 50,
    width: 105,
  },
});

export default styles;
