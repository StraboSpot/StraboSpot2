import {StyleSheet} from 'react-native';
import * as themes from "../../themes/ColorThemes";

const samplesStyle = StyleSheet.create({
  samplesContainer: {
    flex: 8,
    backgroundColor: 'white',
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
  },
  input: {
    flex: 30,
    // padding: 10,
    // justifyContent: 'center',
    // alignContent: 'center'
  },
  inputContainer: {
    borderBottomWidth: 0,
    borderRadius: 10,
    backgroundColor: themes.LIGHTGREY,
    marginBottom: 10
  },
  inputText: {
    paddingLeft: 10,
    fontSize: 16
  },
  text: {
    fontSize: 14,
    paddingTop: 10
  },
  textbox: {
    fontSize: 16,
    paddingLeft: 10,
    borderWidth: 1,
    height: 75,
    borderRadius: 10,
    backgroundColor: themes.LIGHTGREY,
    marginBottom: 10
  },
  textboxContainer: {
    paddingLeft: 10,
    paddingRight: 10
  }
});

export default samplesStyle;
