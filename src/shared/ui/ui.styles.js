import {Platform, StyleSheet} from 'react-native';
import * as themes from '../styles.constants';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';

const styles = StyleSheet.create({
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
    paddingLeft: 20,
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
  navButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sectionDivider: {
    paddingLeft: 10,
    justifyContent: 'center',
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
  },
  sectionDividerText: {
    fontSize: Platform.OS === 'ios' ? 13 : 16,
    textTransform: 'uppercase',
    color: themes.SECONDARY_HEADER_TEXT_COLOR,
  },
  sliderTextContainer: {
    width: '100%',
    justifyContent: 'space-between',
    // paddingBottom: 5,
    paddingRight: 10,
    paddingLeft: 10,
    flexDirection: 'row',
  },
  sliderText: {
    color: themes.SECONDARY_ITEM_TEXT_COLOR,
    fontSize: 16,
  },
  sliderContainer: {
    width: 150,
    alignItems: 'center',
  },
  slider: {
    width: 200,
    paddingRight: 10,
    paddingLeft: 10,
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
