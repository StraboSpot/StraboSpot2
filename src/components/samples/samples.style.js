import {StyleSheet} from 'react-native';
import * as themes from "../../themes/ColorThemes";

const samplesStyle = StyleSheet.create({
  button: {
    flex: 15,
    alignItems: 'center',
    paddingBottom: 10
  },
  header: {
    justifyContent: 'center',
    alignContent: 'center',
    padding: 15,
    color: themes.MEDIUMGREY,
    fontSize: 18
  },
  samplesContainer: {
    flex: 8,
    backgroundColor: 'white',
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
  },
  input: {
    flex: 30,
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
  listLabel: {
    marginLeft: 10,
    // paddingBottom: 10,
  },
  listText: {
    marginLeft: 5,
    color: themes.MEDIUMGREY
  },
  notebookListContainer: {
    flex: 1,
    // backgroundColor: 'white',
    borderBottomWidth: .5,
    borderColor: themes.MEDIUMGREY,
    marginBottom: 3,
    padding: 5
  },
  text: {
    fontSize: 16,
    textAlign: 'center'
  },
  textbox: {
    fontSize: 14,
    paddingLeft: 10,
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
