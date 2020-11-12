import {Platform, StyleSheet} from 'react-native';

import {heightPercentageToDP as hp} from 'react-native-responsive-screen';

import * as themes from '../styles.constants';

const styles = StyleSheet.create({
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
  defaultCheckBox: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    padding: 0,
    margin: 0,
  },
  imageIcon: {
    width: 65,
    height: 65,
  },
  loadingContainer: {
    flex: 1,
    position: 'absolute',
    right: hp('60'),
    bottom: hp('50'),
    backgroundColor: 'transparent',
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
  modalPosition: {
    position: 'absolute',
    left: 70,
    bottom: 20,
  },
  modalPositionShortcutView: {
    position: 'absolute',
    left: 70,
    bottom: 20,
  },
  navButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  saveAndDeleteButtonStyles: {
    borderRadius: 15,
    width: 150,
  },
  saveAndDeleteButtonContainer: {
    alignItems: 'center',
    paddingTop: 10,
  },
  sectionDivider: {
    paddingLeft: 10,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  sectionDividerText: {
    fontSize: Platform.OS === 'ios' ? 16 : 20,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: themes.SECONDARY_HEADER_TEXT_COLOR,
  },
  sliderContainer: {
    flex:1,
    // width: 150,
    alignItems: 'center',
  },
  slider: {
    width: '90%',
    paddingRight: 10,
    paddingLeft: 10,
  },
  sliderTextContainer: {
    width: '100%',
    justifyContent: 'space-between',
    // paddingBottom: 5,
    paddingRight: 10,
    paddingLeft: 10,
    flexDirection: 'row',
  },
  sectionTitleContainer: {
    paddingTop: 0,
    paddingBottom: 9,
  },
  buttonText: {
    color: themes.PRIMARY_ACCENT_COLOR,
  },
  spacer: {
    padding: 10,
  },
  headerContainer: {
    height: 60,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
    fontWeight: 'bold',
  },
});

export default styles;
