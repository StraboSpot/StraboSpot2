import {StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  buttonStyle: {
    borderRadius: 30,
    // paddingRight: 20,
    // paddingLeft: 50,
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
    // fontSize: themes.PRIMARY_TEXT_SIZE,
    // fontWeight: '500',
    // height: 55,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    margin: 10,
    // color: 'black',
    padding: 8,
    borderRadius: 14,
    borderColor: 'red',
  },
  inputContainerGroup: {
    alignItems: 'center',
    // flexDirection: 'row',
    // width: 700,
    // flexWrap: 'wrap',
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
  invalid: {
    backgroundColor: '#f9c0c0',
    borderColor: 'red',
  },
  container: {
    flex: 1,
    // alignItems: 'center',
    // backgroundColor: 'blue'
  },
  version: {
    // color: 'black',
    textAlign: 'center',
    fontSize: 32,
    fontFamily: 'ChalkboardSE-Bold',
  },
});

export default styles;
