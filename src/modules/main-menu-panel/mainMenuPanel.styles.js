import {StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const styles = StyleSheet.create({
  settingsDrawer: {
    width: 300,
    height: '100%',
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 0,
  },
  mainMenuContainer: {
    flex: 1,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
  },
  container: {
    flex: 1,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
  },
  buttons: {
    color: themes.PRIMARY_ACCENT_COLOR,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
    color: themes.PRIMARY_TEXT_COLOR,
  },
  mainMenuHeaderTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  mainMenuHeaderContainer: {
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default styles;
