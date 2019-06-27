import {StyleSheet} from 'react-native';
import * as themes from './styles.constants';

const commonStyles = StyleSheet.create({
  // List Styles
  rowContainer: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderColor: themes.LIST_BORDER_COLOR
  },
  row: {
    flexDirection:'row'
  },
  itemLeftTextContainer: {
    justifyContent: 'center',
    flex: 1
  },
  itemRightIconsContainer: {
    flexDirection: 'row'
  },
  listItem: {
    padding: 10,
    borderBottomWidth: .5,
    borderColor: themes.LIST_BORDER_COLOR,
  },
  listItemTitle: {
    color: themes.PRIMARY_ITEM_TEXT_COLOR,
    fontSize: 20,
  },
});

export default commonStyles;
