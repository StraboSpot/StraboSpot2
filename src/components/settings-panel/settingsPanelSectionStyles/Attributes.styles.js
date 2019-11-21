import {StyleSheet} from 'react-native';
import * as themes from '../../../shared/styles.constants';

const attributesStyles = StyleSheet.create({
  listHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: 10,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
  },
  listContainer: {
    // padding: 5,
    paddingTop: 0,
    justifyContent: 'space-between',
  },
  headingText: {
    marginLeft: 10,
    fontWeight: '600',
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE - 2,
  },
  spotListListContainer: {
    flex: 1,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  text: {
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE + 5,
  },
  textContainer: {
    alignItems: 'center',
    paddingTop: 50,
  },
});

export default attributesStyles;
