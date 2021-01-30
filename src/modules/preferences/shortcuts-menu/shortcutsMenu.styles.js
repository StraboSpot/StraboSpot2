import {StyleSheet} from 'react-native';

import * as themes from '../../../shared/styles.constants';

const styles = StyleSheet.create({
  textContainer: {
    alignItems: 'center',
    padding: 10,
  },
  textStyle: {
    fontSize: themes.PRIMARY_TEXT_SIZE,
    color: themes.PRIMARY_TEXT_COLOR,
    fontWeight: 'bold',
  },
});

export default styles;
