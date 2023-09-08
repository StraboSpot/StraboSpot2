import {Platform, StyleSheet} from 'react-native';

import * as themes from '../styles.constants';

const styles = StyleSheet.create({
  accessPointIcon: {
    height: 30,
    width: 30,
  },
  alignItemsToCenter: {
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 50,
  },
  batteryLevelGreen: {
    color: 'green',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 1,
  },
  batteryLevelYellow: {
    color: 'yellow',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 1,
  },
  batteryLevelRed: {
    color: 'red',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 1,
  },
  customEndpointContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  customEndpointText: {
    fontSize: themes.MEDIUM_TEXT_SIZE,
    marginEnd: 30,
    textAlign: 'center',
  },
  customEndpointSwitchContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 50,
  },
  customEndpointVerifyButtonContainer: {
    alignItems: 'center',
    padding: 20,
  },
  verifyButtonStyle: {
    borderRadius: 15,
    paddingRight: 20,
    paddingLeft: 20,
  },
  customEndpointVerifyIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customEndpointVerifyInputContainer: {
    flexDirection: 'row',
    width: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIcon: {
    width: Platform.OS === 'web' ? 50 : 65,
    height: Platform.OS === 'web' ? 50 : 65,
  },
  iconContainer: {
    flexDirection: 'row',
    position: 'absolute',
    top: 10,
    width: '100%',
    zIndex: -1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 50,
  },
  itemSeparator: {
    borderTopWidth: 1,
    borderColor: themes.LIGHTGREY,
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 10,
    paddingRight: 10,
  },
  backButton: {
    marginTop: 10,
    alignItems: 'flex-start',
  },
  navButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  saveAndDeleteButtonStyles: {
    borderRadius: 15,
    paddingRight: 20,
    paddingLeft: 20,
  },
  saveAndDeleteButtonContainer: {
    alignItems: 'center',
    paddingTop: 10,
  },
  sectionDivider: {
    paddingLeft: 10,
    paddingTop: 8,
    paddingBottom: 2,
    flexShrink: 1,
  },
  sectionDividerText: {
    fontSize: themes.MEDIUM_TEXT_SIZE,
    fontWeight: 'bold',
    // textTransform: 'uppercase',
    color: themes.PRIMARY_TEXT_COLOR,
  },
  sectionDividerWithButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderBackground: {
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
  },
  sliderContainer: {
    flex: 1,
    alignItems: 'center',
  },
  slider: {
    width: '100%',
  },
  sliderTextContainer: {
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  sliderLabel: {
    fontSize: themes.SMALL_TEXT_SIZE,
    // marginRight: 10,
  },
  buttonText: {
    color: themes.PRIMARY_ACCENT_COLOR,
  },
  spacer: {
    padding: 10,
  },
  littleSpacer: {
    padding: 5,
  },
  headerContainer: {
    height: 60,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default styles;
