import {Dimensions, Platform, StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const platform = Platform.OS === 'ios' ? 'window' : 'screen';
const deviceDimensions = Dimensions.get(platform);

const styles = StyleSheet.create({
  customBaseMapListContainer: {
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    paddingBottom: 10,
    paddingTop: 10,
  },
  dialogBox: {
    paddingBottom: 30,
    position: 'absolute',
    bottom: 50,
    left: 75,
    width: 300,
    maxHeight: deviceDimensions.height * 0.95,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    borderRadius: 20,
  },
  dialogTitle: {
    backgroundColor: themes.LIGHTGREY,
    margin: 10,
    justifyContent: 'center',
  },
  dialogTitleText: {
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
    fontWeight: 'bold',
  },
  dialogLargerText: {
    color: themes.PRIMARY_TEXT_COLOR,
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
    fontWeight: 'bold',
  },
  dialogContent: {
    borderTopWidth: 1,
    borderColor: 'lightgrey',
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
  },
  dialogText: {
    color: themes.PRIMARY_TEXT_COLOR,
  },
});

export default styles;
