import {StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const samplesStyle = StyleSheet.create({
  buttonContainer: {
    flex: 15,
    alignItems: 'center',
    paddingBottom: 10,
  },
  header: {
    justifyContent: 'center',
    alignContent: 'center',
    padding: 15,
    color: themes.SECONDARY_HEADER_TEXT_COLOR,
    fontSize: themes.PRIMARY_TEXT_SIZE,
  },
  samplesContainer: {
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  input: {
    flex: 30,
  },
  inputContainer: {
    borderBottomWidth: 0,
    borderRadius: 10,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    marginBottom: 10,
  },
  inputText: {
    paddingLeft: 10,
    fontSize: 16,
  },
  listLabel: {
    marginLeft: 10,
  },
  listText: {
    marginLeft: 5,
    color: themes.SECONDARY_ITEM_TEXT_COLOR,
  },
  notebookListContainer: {
    flex: 1,
    borderBottomWidth: 1,
    padding: 5,
    borderBottomColor: themes.LIST_CHEVRON_COLOR,
  },
  headingText: {
    fontSize: themes.PRIMARY_TEXT_SIZE - 3,
    fontWeight: 'bold',
    textAlign: 'center',
    color: themes.SECONDARY_ITEM_TEXT_COLOR,
  },
  listHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderContainer: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  text: {
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE + 5,
  },
  textbox: {
    fontSize: 14,
    paddingLeft: 10,
    height: 75,
    borderRadius: 10,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    marginBottom: 10,
  },
  textboxContainer: {
    paddingLeft: 10,
    paddingRight: 10,
  },
  modalPosition: {
    position: 'absolute',
    left: 70,
    bottom: 10,
  },
  modalPositionShortcutView: {
    position: 'absolute',
    left: 70,
    bottom: 70,
  },
  sampleContentContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  samplesListContainer: {
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    padding: 5,
    paddingTop: 0,
    justifyContent: 'space-between',
  },
});

export default samplesStyle;
