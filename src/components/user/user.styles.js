import {StyleSheet} from 'react-native';
import * as themes from '../../shared/styles.constants';

const UserStyles = StyleSheet.create({
  profileContainer: {
    // flex: 1,
    // flexDirection: 'column',
    // paddingTop: 10,
  },
  profileButtons: {
    // marginTop: 0,
  },
  userButton: {
    // alignItems: 'flex-end',
    // marginTop: 10,
    // paddingLeft: 25,
  },
  profileNameAndImageContainer: {
    //flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    //marginLeft: 0,
    padding: 20,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  avatarImageContainer: {
    // flex: 2,
    // justifyContent: 'center',
  },
  avatarLabelContainer: {
    padding: 10,
  },
  avatarLabel: {
    fontWeight: 'bold',
    fontSize: themes.PRIMARY_TEXT_SIZE,
  },
  projectName: {
    // flex: 2,
    // alignContent: 'center',
  },
  projectNameText: {
    // fontSize: themes.PRIMARY_HEADER_TEXT_SIZE + 5,
    // fontWeight: 'bold',
    // textAlign: 'center',
  },
});

export default UserStyles;
