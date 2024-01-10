import {StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const tagStyles = StyleSheet.create({
  listText: {
    color: themes.PRIMARY_TEXT_COLOR,
    fontSize: 12,
  },
  sectionContainer: {
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    padding: 10,
  },
});

export default tagStyles;

