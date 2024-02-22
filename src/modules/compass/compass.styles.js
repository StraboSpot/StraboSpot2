import {StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const styles = StyleSheet.create({
  azimuthPointer: {
    height: 75,
    position: 'absolute',
    resizeMode: 'contain',
    // top: 40,
    width: 75,
    zIndex: 10,
  },
  buttonContainer: {
    paddingBottom: 10,
  },
  buttonTitleStyle: {
    color: themes.PRIMARY_ACCENT_COLOR,
    fontSize: 16,
  },
  compassContainer: {
    backgroundColor: 'red',
  },
  compassDataCol1: {
    flex: 1,
  },
  compassDataCol2: {
    borderWidth: 1,
    flex: 2,
  },
  compassDataCol3: {
    flex: 3,
  },
  compassDataDirectionTextContainer: {
    flex: 3,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginHorizontal: 'auto',
    paddingBottom: 10,
    paddingLeft: 10,
  },
  compassDataGridContainer: {
    borderWidth: 1,
    flex: 3,
    marginHorizontal: 'auto',

  },
  compassDataGridRow: {
    flexDirection: 'row',
  },
  compassDataModalPosition: {
    position: 'absolute',
    // top: 20,
  },
  compassDataText: {
    // borderWidth: 1,
    padding: 5,
    // textAlign: 'center',
  },
  compassImage: {
    // alignItems: 'center',
    height: 175,
    // justifyContent: 'center',
    // marginTop: 15,
    width: 175,
  },
  compassImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassMatrixHeader: {
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  compassMeasurementTextContainer: {
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    left: 10,
    position: 'absolute',
    top: 10,
  },
  matrixDataButtonContainer: {
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    bottom: 10,
    position: 'absolute',
    right: 10,
    width: 75,
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
