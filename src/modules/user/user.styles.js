import {StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const UserStyles = StyleSheet.create({
  profileNameAndImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  avatarLabelContainer: {
    padding: 10,
  },
  avatarLabelName: {
    fontWeight: 'bold',
    fontSize: themes.PRIMARY_TEXT_SIZE,
  },
  avatarLabelEmail: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  dialogTitleContainer: {
    alignContent: 'center',
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
  },
});

export default UserStyles;
