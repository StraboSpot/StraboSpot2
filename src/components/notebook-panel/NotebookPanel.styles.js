import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: 500,
    height: '98%',
    borderBottomLeftRadius: 30,
    borderTopLeftRadius: 30,
    backgroundColor: '#d4d4d4',
    alignItems: 'flex-end',
    position: 'absolute', //Here is the trick
    bottom: 0, //Here is the trick
    right: 0,
    zIndex: 1,
  },

  // Inside Footer container
  footerContainer: {
    width: 470,
    height: 70,
    backgroundColor: 'white',
    // justifyContent: 'space-between',
    padding: 10,
    // flexDirection: 'row',
  },
  footerIconContainer: {
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginLeft: 60
  },
  footerIcon: {
    width: 40,
    height: 40
  },


  // Inside Header container
  headerButtonsContainer: {
    flex: 1,
    // paddingLeft: 50,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginLeft: 10
  },
  headerButtons: {
    marginLeft: 40,
    // width: 20,
    // height: 20,
  },
  headerContainer: {
    width: 470,
    height: 80,
    backgroundColor: 'white',
    justifyContent: 'flex-start',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#747474',
    flexDirection: 'row',
  },
  headerCoords: {
    paddingLeft: 0,
    marginTop: 3,
  },
  headerImage: {
    width: 60,
    height: 60,
  },
  headerSpotContainer: {
    paddingLeft: 10,
    paddingTop: 5
  },
  headerSpotName: {
    fontSize: 24,
    fontWeight: 'bold'
  },

  iconButton: {
    height: 25,
    width: 25,
    // padding: 20
  },
  imageContainer: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'space-between',
    paddingHorizontal: 10
  },
  subContainer: {
    flex: 1,
    width: 470,
    alignItems: 'flex-start',
  },
});

export default styles;
