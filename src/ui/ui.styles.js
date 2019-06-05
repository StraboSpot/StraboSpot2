import {StyleSheet} from 'react-native';
import * as themes from '../themes/ColorThemes';

const styles = StyleSheet.create({
  sliderTextContainer: {
    width: 60,
    padding: 5
  },
  sliderText: {
    textAlign: 'center',
    color: themes.MEDIUMGREY
  },
  slideContainer: {
    width: 150
  },
  slider: {
    width: 125,
    marginTop: 5,
    paddingRight: 10,
    paddingLeft: 10,
  },
});

export default styles;
