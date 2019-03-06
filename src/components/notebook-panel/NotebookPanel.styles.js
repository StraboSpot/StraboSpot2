import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: 500,
    height:'98%',
    borderBottomLeftRadius:30,
    borderTopLeftRadius: 30,
    backgroundColor: '#d4d4d4',
    alignItems: 'flex-end',
    position: 'absolute', //Here is the trick
    bottom: 0, //Here is the trick
    right: 0,
    zIndex: 1,
  },
  // Inside Header container
  spotContainer: {
    paddingLeft: 10,
    paddingTop: 5
  },
  footerIconContainer: {
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginLeft: 60
  },
  footerIcon:{
    width: 40,
    height: 40
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
  headerImage: {
    width: 60,
    height: 60,
  },
  footerContainer: {
    width: 470,
    height: 70,
    backgroundColor: 'white',
    // justifyContent: 'space-between',
    padding: 10,
    // flexDirection: 'row',
  },
  headerSpotName: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  headerCoords: {
    paddingLeft: 0,
    marginTop: 3,
    color: 'blue'
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
  listStyle: {
    backgroundColor: 'transparent',
    margin: 0,
    padding: 5,
    // alignItems: 'flex-start',
  },
  listContent: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sectionStyle: {
    flexDirection: 'row',
    // flexWrap: 'wrap',
    borderTopWidth: 1,
    width: 470,
    height: 100
  },
  subContainer: {
    flex: 1,
    width: 470,
    alignItems: 'flex-start',
  },
  textStyle: {
    fontSize: 20,
    color: '#000000',
    fontWeight: 'bold',
    paddingTop: 10
  },
});

export default styles;
