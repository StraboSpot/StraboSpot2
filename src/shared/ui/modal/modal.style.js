import {Dimensions, Platform, StyleSheet} from 'react-native';
import * as themes from "../../styles.constants";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import Orientation from "react-native-orientation-locker";

const platformType = Platform.OS === 'ios' ? 'window' : 'screen';
const {width, height} = Dimensions.get(platformType);

const deviceWidth = () => {
  if (width < 500) return wp('75%');
  if (width >= 500 && width < 1099) return wp('25%');
  if (width >= 1100) return wp('20%');
};
const modalStyle = StyleSheet.create({
  modalContainer: {
    // height: 600,
    width: deviceWidth(),
    opacity: .90,
    // backgroundColor: 'pink',
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20
  },
  modalBottom: {
    // flex: 8,
    paddingBottom: 20,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20
  },
  modalTop: {
    zIndex: 100,
    // width: '100%',
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 10,
    paddingRight: 10,
    // backgroundColor: 'red',
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  textStyle: {
    fontSize: themes.PRIMARY_TEXT_SIZE,
    paddingLeft: 10
  },
  textContainer: {
    alignItems: 'center',
    paddingBottom: 10,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  }
});

export default modalStyle;
