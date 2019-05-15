import {StyleSheet} from 'react-native';
import * as themes from '../../themes/ColorThemes';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: 500,
    height: '100%',
    borderBottomLeftRadius: 30,
    borderTopLeftRadius: 30,
    backgroundColor: themes.LIGHTGREY,
    position: 'absolute', //Here is the trick
    right: 0,
    zIndex: 1,
  },
  imageContainer: {
    flex: 1,
    padding: 10,
    paddingHorizontal: 10
  },
  viewContainer: {
    flex: 1,
  },
});

export default styles;
