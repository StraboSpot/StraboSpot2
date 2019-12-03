import {StyleSheet} from 'react-native';
import * as themes from '../../shared/styles.constants';

const styles = StyleSheet.create({
  settingsDrawer: {
    width: 300,
    height: '100%',
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: -1,
  },
  settingsPanelContainer: {
    flex: 1,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
  },
  container: {
    flex: 1,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  navItemStyle: {
    borderTopWidth: 1,
  },
  navButtonText: {
    color: themes.PRIMARY_ITEM_TEXT_COLOR,
    width: '100%',
    textAlign: 'left',
  },
  navSectionStyle: {
    flex: 1,
  },
  listContainer: {
    flex: 6,
  },
  sectionHeading: {
    alignItems: 'flex-start',
    paddingLeft: 10,
    paddingTop: 10,
    backgroundColor: themes.LIST_HEADER_COLOR,
  },
  sectionHeadingTextStyle: {
    textTransform: 'uppercase',
    paddingTop: 5,
    paddingBottom: 5,
    fontWeight: 'bold',
    fontSize: themes.PRIMARY_TEXT_SIZE,
    color: themes.SECONDARY_ITEM_TEXT_COLOR,
  },
  footerContainer: {
    padding: 20,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
  },
  buttons: {
    paddingLeft: 10,
    paddingRight: 10,
    color: themes.BLUE,
  },
  headerText: {
    flex: 3,
    fontWeight: 'bold',
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
    textAlign: 'center',
  },
  settingsPanelHeaderTextContainer: {
    flex: 3,
    alignItems: 'center',
  },
  settingsPanelIconContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  settingsPanelHeaderContainer: {
    height: 70,
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  settingsPanelHeaderText: {
    fontWeight: 'bold',
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
  },
});

export default styles;
