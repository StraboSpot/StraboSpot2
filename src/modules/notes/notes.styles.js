import {StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const noteStyle = StyleSheet.create({
  container: {
    paddingTop: 25,
  },
  inputContainer: {
    height: 300,
    borderWidth: 1,
    // paddingTop: 25
  },
  notesOverviewContainer: {
    padding: 10,
    flex: 1,
    flexDirection: 'row',
    // justifyContent: 'space-between',
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  buttonContainer: {
    // flexDirection: 'row',
  },
  editButton: {
    padding: 0,
    // justifyContent: 'flex-start'
  },
});

export default noteStyle;

