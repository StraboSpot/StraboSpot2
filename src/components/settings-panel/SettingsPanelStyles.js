import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    flex: 1,
    backgroundColor: 'lightgrey',
  },
  profile: {
    width: '90%',
    height: 125,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderColor: 'black'
  },

  textStyle: {
    fontSize: 22,
    color: 'lightgrey'
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
    backgroundColor: 'lightgrey',
  },
  sectionHeadingTextStyle: {
    paddingTop: 15,
    fontWeight: 'bold',
    fontSize: 18,
  },
  footerContainer: {
    padding: 20,
    backgroundColor: 'lightgrey'
  }
});

export default styles;
