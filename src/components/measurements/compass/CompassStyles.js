import {Dimensions, Platform, StyleSheet} from 'react-native';
import * as themes from '../../../shared/styles.constants';
// import {widthPercentageToDP as wp} from "react-native-responsive-screen";

// const {width, height} = Dimensions.get('window');
//    let strikeLineFromTop = null;
//    let trendLineFromTop = null;


// const strikeLinePosition = () => {
//     if (width < 500) return wp('75%');
//     // if (width >= 1000 && width < 1099) return strikeLineFromTop= 62;
//   if (width >= 1100 && width < 1199) return strikeLineFromTop= 79;
//   if (width >= 1200 || (width >= 1000 && width < 1099)) return strikeLineFromTop= 62;
// };
// const trendLinePosition = () => {
//   if (width < 500) return wp('55%');
//   // if (width >= 1000 && width < 1099) return strikeLineFromTop= 67;
//   if (width >= 1100 && width < 1199) return trendLineFromTop= 84;
//   if (width >= 1200 || (width >= 1000 && width < 1099)) return trendLineFromTop= 67;
// };

const styles = StyleSheet.create({
  buttonContainer: {
    paddingBottom: 10,
  },
  compassContainer: {
    flex: 8,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
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
    paddingLeft: 15
  },
  itemTextStyle: {
    fontSize: 14,
    marginLeft: 10,
  },
  noSpotContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 700
  },
  compassContentContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  sliderContainer: {
    alignItems: 'center',
    paddingTop: 10
  },
  sliderHeading: {
    fontWeight: 'bold',
    fontSize: themes.PRIMARY_TEXT_SIZE - 3,
    color: themes.SECONDARY_ITEM_TEXT_COLOR
  },
    switchContainer: {
    flex: 1,
    alignItems: 'flex-end'
  },
  switch: {
    justifyContent: 'flex-end'
  },
  strikeAndDipLine: {
    zIndex: 10,
    height: 170,
    width: 170,
    position: 'absolute',
    top: 40,
    resizeMode: 'contain',
  },
  toggleButtonsContainer: {
    backgroundColor: 'transparent',
    padding: 10
  },
  toggleButtonsRowContainer: {
    borderBottomWidth: 1,
  },
  trendLine: {
    height: 150,
    width: 150,
    position: 'absolute',
    top: 50,
    resizeMode: 'contain',
  },
  modalPosition: {
    position: 'absolute',
    left: 70,
    bottom: 10
  },
  modalPositionShortcutView: {
    position: 'absolute',
    left: 70,
    bottom: 70
  },
});

export default styles;
