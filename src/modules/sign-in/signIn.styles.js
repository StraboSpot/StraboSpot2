import {StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const styles = StyleSheet.create({
  input: {
    width: 350,
    fontSize: themes.PRIMARY_TEXT_SIZE,
    fontWeight: '500',
    height: 40,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    margin: 10,
    color: 'black',
    padding: 8,
    borderRadius: 14,
  },
  signInContainer: {
    alignItems: 'center',
  },
  version: {
    textAlign: 'center',
    fontSize: 32,
    fontFamily: 'ChalkboardSE-Bold',
  },
  buttonContainer: {
    margin: 10,
  },
  buttonsContainer: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonStyle: {
    borderRadius: 30,
    paddingRight: 20,
    paddingLeft: 20,
  },
});

export default styles;
