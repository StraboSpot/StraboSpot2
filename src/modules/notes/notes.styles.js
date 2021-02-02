import {StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const noteStyle = StyleSheet.create({
  container: {
    paddingTop: 25,
  },
  inputContainer: {
    height: 300,
    paddingTop: 10,
    paddingLeft: 10,
  },
  notesOverviewContainer: {
    padding: 10,
    flex: 1,
    flexDirection: 'row',
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  editButton: {
    padding: 0,
  },
});

export default noteStyle;

