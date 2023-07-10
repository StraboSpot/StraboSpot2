import {StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const noteStyle = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  noteContainer: {
    marginTop: 10,
  },
  messageText: {
    padding: 15,
    textAlign: 'center',
    fontSize: themes.MEDIUM_TEXT_SIZE,
  },
});

export default noteStyle;

