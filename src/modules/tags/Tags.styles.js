import {StyleSheet} from 'react-native';
import * as themes from '../../shared/styles.constants';

const tagStyles = StyleSheet.create({
  rightTitleListStyle: {
    color: themes.SECONDARY_ITEM_TEXT_COLOR,
  },
  noTagsText: {
    textAlign: 'center',
    fontWeight: '200',
    fontSize: themes.MEDIUM_TEXT_SIZE,
  },
  sectionContainer: {
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 5,
    // height: 200
  },
});

export default tagStyles;

