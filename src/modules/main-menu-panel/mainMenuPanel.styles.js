import {StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const styles = StyleSheet.create({
  buttons: {
    color: themes.PRIMARY_ACCENT_COLOR,
    paddingLeft: 10,
    paddingRight: 10,
  },
  container: {
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    flex: 1,
  },
  documentListItem: {
    borderRadius: 15,
    margin: 5,
  },
  headerText: {
    color: themes.PRIMARY_TEXT_COLOR,
    flex: 3,
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mainMenuHeaderContainer: {
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    flexDirection: 'row',
    height: 70,
    justifyContent: 'center',
  },
  mainMenuHeaderTextContainer: {
    alignItems: 'center',
    flex: 4,
    flexDirection: 'row',
  },
  mainMenuIconContainer: {
    alignItems: 'flex-start',
    flex: 1,
    justifyContent: 'center',
  },
  settingsDrawer: {
    height: '100%',
    left: 0,
    position: 'absolute',
    width: 300,
    zIndex: 0,
  },
});

export default styles;
