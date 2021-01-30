import {StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  buttonStyle: {
    borderRadius: 30,
  },
  buttonContainer: {
    marginTop: 10,
    width: 300,
  },
  checkBoxText: {
    color: 'white',
  },
  input: {
    width: 350,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    margin: 10,
    padding: 8,
    borderRadius: 14,
    borderColor: 'red',
  },
  inputContainerGroup: {
    alignItems: 'center',
  },
  inputContainer: {
    borderColor: 'transparent',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  title: {
    fontSize: 110,
    fontFamily: 'Arial-BoldMT',
  },
  titleContainer: {
    paddingBottom: 60,
  },
  container: {
    flex: 1,
  },
  version: {
    textAlign: 'center',
    fontSize: 32,
    fontFamily: 'ChalkboardSE-Bold',
  },
});

export default styles;
