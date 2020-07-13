import {StyleSheet} from 'react-native';

// Constants
import * as themes from '../../shared/styles.constants';

const sidePanelStyles = StyleSheet.create({
  infoInputText: {
    // fontSize: 16,
    padding: 10,
  },
  textInputNameContainer: {
    // flexDirection: 'row',
    // alignItems: 'center',
    // borderColor: themes.MEDIUMGREY,
    borderWidth: 0.5,
    borderRadius: 10,
    backgroundColor: 'white',
    // marginBottom: 10,
    paddingLeft: 10,
    // paddingTop: 10,
  },
  textInputNameLabel: {
    flex: 1,
    paddingLeft: 5,
  },
  projectDescriptionListContainer: {
    borderColor: themes.PRIMARY_ITEM_TEXT_COLOR,
    backgroundColor: 'white',
    paddingLeft: 5,
    paddingBottom: 10,
    paddingTop: 10,
  },
  sectionContainer: {
    // flex: 1,
    // paddingTop: 10,
    // backgroundColor: 'red',
    justifyContent: 'center',
  },
});

export default sidePanelStyles;
