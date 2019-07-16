import {StyleSheet} from 'react-native';
import * as themes from './styles.constants';

const commonStyles = StyleSheet.create({
  // List Styles
  rowContainer: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderColor: themes.LIST_BORDER_COLOR
  },
  rowContainerInverse: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderColor: themes.LIST_BORDER_COLOR,
    backgroundColor: themes.PRIMARY_ACCENT_COLOR
  },
  row: {
    flexDirection: 'row',
    height: themes.ROW_HEIGHT
  },
  fixedWidthSide: {
    justifyContent: 'center'
  },
  fillWidthSide: {
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
    fontSize: themes.PRIMARY_TEXT_SIZE,
  },
});

export default commonStyles;
