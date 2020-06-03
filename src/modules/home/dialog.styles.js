import {StyleSheet} from 'react-native';
import * as themes from '../../shared/styles.constants';

const styles = StyleSheet.create({
  customBaseMapListContainer: {
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    // paddingLeft: 15,
    paddingBottom: 10,
    paddingTop: 10,
  },
  customBaseMapListText: {
    // fontSize: themes.PRIMARY_TEXT_SIZE,
  },
  dialogBox: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 300,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    borderRadius: 20,
  },
  dialogTitle: {
    backgroundColor: themes.PRIMARY_ACCENT_COLOR,
  },
  dialogTitleText: {
    color: themes.SECONDARY_BACKGROUND_COLOR,
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
    fontWeight: 'bold',
  },
  dialogContent: {
    borderTopWidth: 1,
    borderColor: 'lightgrey',
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,

  },
  dialogText: {
    color: themes.PRIMARY_ACCENT_COLOR,
  },
});

export default styles;
