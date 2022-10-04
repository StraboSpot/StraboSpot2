import {StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const styles = StyleSheet.create({
  buttonStyle: {
    paddingRight: 30,
    paddingLeft: 30,
  },
  buttonContainer: {
    margin: 10,
    borderRadius: 30,
  },
  buttonsContainer: {
    flexDirection: 'row',
    // margin: 10,
  },
  checkBoxText: {
    color: 'white',
  },
  input: {
    width: 300,
    fontSize: themes.PRIMARY_TEXT_SIZE,
    fontWeight: '500',
    height: 40,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    color: 'black',
    padding: 8,
    borderRadius: 14,
  },
  inputContainer: {
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  signUpContainer: {
    alignItems: 'center',
    width: '90%',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default styles;
