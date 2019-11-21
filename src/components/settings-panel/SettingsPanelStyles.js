import {StyleSheet} from 'react-native';
import * as themes from '../../shared/styles.constants';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  navItemStyle: {
    padding: 3,
    marginLeft: 5,
  },
  navSectionStyle: {
    paddingBottom: 10,
    flex: 1,
  },
  listContainer: {
    flex: 6,
  },
  sectionHeading: {
    alignItems: 'flex-start',
    paddingLeft: 10,
    paddingTop: 10,
    backgroundColor: themes.LIST_HEADER_COLOR,
  },
  sectionHeadingTextStyle: {
    paddingTop: 5,
    paddingBottom: 5,
    fontWeight: 'bold',
    fontSize: themes.PRIMARY_TEXT_SIZE,
    color: themes.SECONDARY_ITEM_TEXT_COLOR,
  },
  footerContainer: {
    padding: 20,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
  },
  buttons: {
    paddingLeft: 10,
    paddingRight: 10,
    color: themes.BLUE,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
  },
  profileContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 10,
  },
  profileButtons: {
    marginTop: 0,
  },
  userButton: {
    alignItems: 'flex-end',
    marginTop: 10,
    paddingLeft: 25,
  },
  profileNameAndImageContainer: {
    flex: 2,
    alignItems: 'center',
    marginLeft: 0,
  },
  avatarImageContainer: {
    flex: 2,
    justifyContent: 'center',
  },
  avatarLabelContainer: {
    // flex: .75,
    // backgroundColor: 'pink',
    width: '100%',
    alignItems: 'center',
    marginBottom: 5,
  },
  avatarLabel: {
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
    marginRight: 10,
  },
  projectName: {
    flex: 2,
    alignContent: 'center',
  },
  projectNameText: {
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE + 5,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default styles;
