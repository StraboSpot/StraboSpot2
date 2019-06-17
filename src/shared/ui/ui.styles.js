import {StyleSheet} from 'react-native';
import * as themes from '../../themes/ColorThemes';

const styles = StyleSheet.create({
  sliderTextContainer: {
    width: '100%',
    justifyContent: 'space-between',
    // paddingBottom: 5,
    paddingRight: 10,
    paddingLeft: 10,
    flexDirection: 'row'
  },
  sliderText: {
    color: themes.MEDIUMGREY,
    fontSize: 16
  },
  sliderContainer: {
    width: 150,
    // flex: 1,
    // flexDirection: 'column',
    // justifyContent: 'center',
    alignItems: 'center'
  },
  slider: {
    width: 200,
    // marginTop: 0,
    // margin: 0,
    paddingRight: 10,
    paddingLeft: 10,
  },
});

export default styles;
