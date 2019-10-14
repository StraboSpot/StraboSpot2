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
    fontSize: themes.PRIMARY_TEXT_SIZE
  },
  samplesContainer: {
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
  noSpotContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 700
  },
  headingText: {
    fontSize: themes.PRIMARY_TEXT_SIZE - 3,
    fontWeight: 'bold',
    textAlign: 'center',
    color: themes.SECONDARY_ITEM_TEXT_COLOR
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
  },
  modalPosition: {
    position: 'absolute', //Here is the trick
    left: 70,
    bottom: 10,
  },
  modalPositionShortcutView: {
    position: 'absolute',
    right: 35,
    top: 5,
    zIndex: 1
  },
  sampleContentContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  }
});

export default samplesStyle;
