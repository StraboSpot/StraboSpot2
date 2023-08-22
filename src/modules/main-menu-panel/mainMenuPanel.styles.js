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
    paddingLeft: 10,
    paddingRight: 10,
    color: themes.PRIMARY_ACCENT_COLOR,
  },
  headerText: {
    flex: 3,
    fontWeight: 'bold',
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
    textAlign: 'center',
  },
  mainMenuHeaderTextContainer: {
    flex: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainMenuIconContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  mainMenuHeaderContainer: {
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    paddingTop: 15,
    height: 70,
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

export default styles;
