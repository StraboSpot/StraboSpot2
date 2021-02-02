import {StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const tagStyles = StyleSheet.create({
  listText: {
    fontSize: 12,
    color: themes.PRIMARY_TEXT_COLOR,
  },
  sectionContainer: {
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    padding: 10,
  },
});

export default tagStyles;

