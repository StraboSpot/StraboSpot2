import {StyleSheet} from 'react-native';
import * as themes from "../../shared/styles.constants";

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
    color: themes.SECONDARY_HEADER_TEXT_COLOR,
    fontSize: 18
  },
  samplesContainer: {
    flex: 8,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
  },
  input: {
    flex: 30,
  },
  inputContainer: {
    borderBottomWidth: 0,
    borderRadius: 10,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
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
    color: themes.SECONDARY_ITEM_TEXT_COLOR
  },
  notebookListContainer: {
    flex: 1,
    // backgroundColor: 'white',
    borderBottomWidth: .5,
    borderColor: themes.LIST_BORDER_COLOR,
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
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    marginBottom: 10
  },
  textboxContainer: {
    paddingLeft: 10,
    paddingRight: 10
  }
});

export default samplesStyle;
