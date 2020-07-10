import {StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const tagStyles = StyleSheet.create({
  listContainer: {
    padding: 5,
  },
  listText: {
    fontSize: 14,
    color: themes.SECONDARY_ITEM_TEXT_COLOR,
  },
  noTagsText: {
    textAlign: 'center',
    fontWeight: '200',
    fontSize: themes.MEDIUM_TEXT_SIZE,
  },
  rightTitleListStyle: {
    color: themes.SECONDARY_ITEM_TEXT_COLOR,
  },
  sectionContainer: {
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    padding: 10,
  },

  // --- Modal Style ---
  modalView: {
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    maxHeight: '90%',
  },
});

export default tagStyles;

