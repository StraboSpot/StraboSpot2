import {StyleSheet} from 'react-native';
import * as themes from '../shared/styles.constants';

const spotListStyle = StyleSheet.create({

  headingText: {
    marginLeft: 10,
    fontWeight: '600',
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE - 2,
  },
  listHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spotListListContainer: {
    flex: 1,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
});

export default spotListStyle;
