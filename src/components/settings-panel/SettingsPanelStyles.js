import {StyleSheet} from 'react-native';
import * as themes from '../../shared/styles.constants';

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    flex: 1,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
  },
  profile: {
    width: '90%',
    height: 125,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    borderBottomWidth: 1,
    borderColor: 'black'
  },
  navItemStyle: {
    padding: 3,
  },
  navSectionStyle: {
    backgroundColor: 'transparent',
    marginLeft: 20,
    paddingBottom:10,
    borderBottomWidth: 1,
    flex: 1,
  },
  sectionHeading : {
    alignItems: 'flex-start',
    marginLeft: 10,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
  },
  sectionHeadingTextStyle: {
    paddingTop: 15,
    fontWeight: 'bold',
    fontSize: themes.PRIMARY_TEXT_SIZE,
  },
  footerContainer: {
    padding: 20,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR
  }
});

export default styles;
