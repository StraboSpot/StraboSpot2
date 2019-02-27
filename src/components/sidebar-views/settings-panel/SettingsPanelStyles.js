import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    flex: 1,
    backgroundColor: 'lightgrey',
  },
  profile: {
    width: '100%',
    height: 150,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'black'
  },

  textStyle: {
    fontSize: 22,
    color: 'lightgrey'
  },

  navItemStyle: {
    padding: 10
  },
  navSectionStyle: {
    backgroundColor: 'transparent',
    marginLeft: 20,
    paddingBottom:10,
    borderBottomWidth: 1
  },
  sectionHeading : {
    alignItems: 'flex-start',
    marginLeft: 10,
    // borderBottomWidth: 3,
    // borderBottomColor: 'black',
    backgroundColor: 'lightgrey',
  },
  sectionHeadingTextStyle: {
    paddingTop: 10,
    fontWeight: 'bold',
    fontSize: 18,
  },
  footerContainer: {
    padding: 20,
    backgroundColor: 'lightgrey'
  }
});

export default styles;
