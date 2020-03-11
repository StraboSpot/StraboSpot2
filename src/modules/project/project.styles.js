import {StyleSheet} from 'react-native';
import * as themes from '../../shared/styles.constants';

const dialogStyles = StyleSheet.create({
  basicInfoContainer: {
    borderRadius: 10,
    marginTop: 5,
    marginBottom: 5,
  },
  basicInfoListItemContent: {
    // alignItems: 'flex-start',
  },
  basicInfoInputText: {
    paddingRight: 10,
    fontSize: 16,
  },
  sectionContainer: {
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    // height: 200
  },
  projectDescriptionPanel: {
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    borderLeftWidth: 1,
    width: 300,
    height: '100%',
    position: 'absolute',
    left: 0,
    right: 0,
  },
  listContainer: {
    height: 200,
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 10,
  },
  listItemTitleAndValue: {
    flex: 0,
  },
  listItems: {
    borderRadius: 10,
    padding: 7,
  },
  activeProjectButton: {
    margin: 10,
    borderRadius: 10,
  },
  activeDataSets: {
    padding: 10,
  },
  buttons: {
    // paddingLeft: 10,
    // paddingRight: 10,
    color: themes.BLUE,
  },
  dialogBox: {
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    borderRadius: 30,
  },
  dialogContent: {
    marginTop: 15,
    paddingBottom: 10
  },
  dialogContentText: {
    color: 'red',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dialogTitle: {
    backgroundColor: 'red',
  },
  dialogTitleText: {
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
    fontWeight: 'bold',
  },
  dialogButton: {
    borderTopWidth: 1,
    borderColor: themes.LIST_BORDER_COLOR,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  dialogButtonText: {
    color: 'black',
  },
  headerText: {
    flex: 3,
    fontWeight: 'bold',
    fontSize: 14,
    paddingLeft: 10,
    paddingBottom: 5,
  },
  progressCircleContainer: {
    alignItems: 'center',
    paddingTop: 15,
  },
  projectName: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: themes.PRIMARY_BACKGROUND_COLOR,
    paddingTop: 10,
    paddingBottom: 10,
    marginLeft: 10,
    marginRight: 10
  },
  projectDescriptionListContainer: {
    // borderRadius: 10,
    paddingBottom: 5,
    paddingTop: 5,
  },
  sidePanelHeaderContainer: {
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    height: 70,
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  sidePanelHeaderTextContainer: {
    // flex: 1,
    // backgroundColor: 'green',
    flexDirection: 'row',
    position: 'absolute',
    left: 0,
    top: 10,
    // justifyContent: 'center',
    // paddingLeft: 10,
    // paddingTop: 10,
  },
  signInText: {
    paddingBottom: 20,
    textAlign: 'center',
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
  },
  signInContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    borderTopWidth: 1,
  },
});

export default dialogStyles;
