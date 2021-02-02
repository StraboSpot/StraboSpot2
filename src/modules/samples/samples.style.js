import {StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const samplesStyle = StyleSheet.create({
  buttonContainer: {
    flex: 15,
    alignItems: 'center',
    paddingBottom: 10,
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
  listText: {
    marginLeft: 5,
    color: themes.PRIMARY_TEXT_COLOR,
  },
  headingText: {
    fontSize: themes.PRIMARY_TEXT_SIZE - 3,
    fontWeight: 'bold',
    textAlign: 'center',
    color: themes.PRIMARY_TEXT_COLOR,
  },
  sliderContainer: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
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
  sampleContentContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
});

export default samplesStyle;
