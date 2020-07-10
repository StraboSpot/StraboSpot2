import {StyleSheet} from 'react-native';

import * as themes from './styles.constants';

const commonStyles = StyleSheet.create({
  buttonContainer: {
    paddingTop: 10,
  },
  buttonPadding: {
    padding: 10,
  },
  dialogContent: {
    flex: 1,
    marginTop: 15,
    alignItems: 'center',
  },
  dialogBox: {
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    borderRadius: 30,
    position: 'absolute',
    top: '15%',
  },
  dialogInputContainer: {
    width: 250,
    height: 40,
    backgroundColor: 'white',
  },
  dialogTitleError: {
    backgroundColor: 'red',
  },
  dialogWarning: {
    backgroundColor: 'red',
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
    fontWeight: '400',
    fontSize: themes.STATUS_MESSAGE_TEXT_SIZE,
    textAlign: 'center',
  },
  dialogButton: {
    borderTopWidth: 1,
    borderColor: themes.LIST_BORDER_COLOR,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  dialogButtonText: {
    color: 'black',
  },
  dialogConfirmText: {
    textAlign: 'center',
    paddingTop: 15,
  },
  dividerWithButton: {
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconColor: {
    color: themes.BLUE,
  },
  icons: {
    position: 'absolute',
    left: 35,
    top: 5,
  },
  noContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
  },
  noContentText: {
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
    fontWeight: 'bold',
  },
  noValueText: {
    textAlign: 'center',
    fontWeight: '200',
    fontSize: themes.MEDIUM_TEXT_SIZE,
  },
  panelContainerStyles: {
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    flex: 1,
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
    borderBottomWidth: 1,
    borderColor: themes.LIST_BORDER_COLOR,
  },
  listItemTitle: {
    fontWeight: themes.PRIMARY_LISTITEM_FONTWEIGHT,
    color: themes.PRIMARY_ITEM_TEXT_COLOR,
    fontSize: themes.PRIMARY_TEXT_SIZE,
  },
  sectionContainer: {
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    // borderRadius: 10,
    padding: 5,
    // height: 200
  },
  standardButtonContainer: {
    paddingTop: 5,
  },
  standardButton: {
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    height: 50,
    borderColor: themes.MEDIUMGREY,
    borderWidth: 1,
    borderRadius: 10,
    // marginLeft: 5,
    // marginRight: 5,
  },
  standardButtonText: {
    color: themes.PRIMARY_ACCENT_COLOR,
    fontSize: themes.SMALL_TEXT_SIZE,
  },
  standardDescriptionText: {
    color: themes.SECONDARY_ITEM_TEXT_COLOR,
    fontSize: themes.SMALL_TEXT_SIZE,
    textAlign: 'right',
  },
});

export default commonStyles;
