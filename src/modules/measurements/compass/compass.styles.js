import {StyleSheet} from 'react-native';
import * as themes from '../../../shared/styles.constants';

const styles = StyleSheet.create({
  buttonContainer: {
    paddingBottom: 10,
  },
  compassContainer: {
    zIndex: 1,
    flex: 15,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    // backgroundColor: 'red',
    // borderBottomRightRadius: 20,
    // borderBottomLeftRadius: 20,
    width: '100%',
  },
  compassImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContainer: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 15,
  },
  itemTextStyle: {
    fontSize: 14,
    marginLeft: 10,
  },
  noSpotContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 700,
  },
  compassContentContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  sliderContainer: {
    alignItems: 'center',
    paddingTop: 10,
  },
  sliderTextContainer: {
    width: '100%',
    justifyContent: 'space-between',
    // paddingBottom: 5,
    paddingRight: 10,
    paddingLeft: 10,
    flexDirection: 'row',
  },
  sliderHeading: {
    fontWeight: 'bold',
    fontSize: themes.PRIMARY_TEXT_SIZE - 3,
    color: themes.SECONDARY_ITEM_TEXT_COLOR,
  },
  sliderText: {
    color: themes.SECONDARY_ITEM_TEXT_COLOR,
    fontSize: 16,
  },
  switchContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  switch: {
    justifyContent: 'flex-end',
  },
  strikeAndDipLine: {
    zIndex: 10,
    height: 125,
    width: 125,
    position: 'absolute',
    top: 40,
    resizeMode: 'contain',
  },
  toggleButtonsContainer: {
    backgroundColor: 'transparent',
    padding: 10,
  },
  toggleButtonsRowContainer: {
    borderBottomWidth: 1,
  },
  trendLine: {
    height: 105,
    width: 105,
    position: 'absolute',
    top: 50,
    resizeMode: 'contain',
  },
  modalPosition: {
    position: 'absolute',
    left: 70,
    bottom: 10,
  },
  modalPositionShortcutView: {
    position: 'absolute',
    left: 70,
    bottom: 20,
  },
});

export default styles;
