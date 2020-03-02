import {StyleSheet} from 'react-native';
import * as themes from './styles.constants';

const commonStyles = StyleSheet.create({
  dialogContent: {
    marginTop: 15,
    alignItems: 'center',
  },
  dialogBox: {
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    borderRadius: 30,
  },
  // dialogTitle: {
  //   backgroundColor: 'red',
  // },
  dialogTitleError: {
    backgroundColor: 'red',
  },
  dialogWarning: {
    backgroundColor: themes.MEDIUMGREY,
  },
  dialogTitleSuccess: {
    backgroundColor: 'green',
  },
  dialogTitleText: {
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dialogStatusMessageText: {
    fontWeight: 'bold',
    fontSize: themes.STATUS_MESSAGE_TEXT_SIZE,
  },
  dialogButton: {
    borderTopWidth: 1,
    borderColor: themes.LIST_BORDER_COLOR,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  dialogButtonText: {
    color: 'black',
  },
  // List Styles
  rowContainer: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderColor: themes.LIST_BORDER_COLOR,
  },
  rowContainerInverse: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderColor: themes.LIST_BORDER_COLOR,
    backgroundColor: themes.PRIMARY_ACCENT_COLOR,
  },
  row: {
    // flexDirection: 'row',
    height: themes.ROW_HEIGHT,
  },
  fixedWidthSide: {
    justifyContent: 'center',
  },
  fillWidthSide: {
    flex: 1,
    justifyContent: 'center',
  },
  itemRightIconsContainer: {
    flexDirection: 'row',
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 0.5,
    borderColor: themes.LIST_BORDER_COLOR,
  },
  listItemTitle: {
    color: themes.PRIMARY_ITEM_TEXT_COLOR,
    fontSize: themes.PRIMARY_TEXT_SIZE,
  },
  standardButton: {
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    height: 50,
    borderColor: themes.PRIMARY_BACKGROUND_COLOR,
    borderWidth: 1,
    marginLeft: 5,
    marginRight: 5
  },
  standardButtonText: {
    color: themes.PRIMARY_ACCENT_COLOR,
    fontSize: themes.PRIMARY_TEXT_SIZE,
  },
  standardDescriptionText: {
    color: themes.SECONDARY_ITEM_TEXT_COLOR,
    fontSize: themes.SMALL_TEXT_SIZE,
  },
});

export default commonStyles;
