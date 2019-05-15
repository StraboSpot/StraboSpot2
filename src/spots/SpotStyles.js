import {StyleSheet} from 'react-native';

const spotStyles = StyleSheet.create({
  imageContainer: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'space-between',
    marginLeft: 30
  },
  iconButton: {
    height: 25,
    width: 25,
  },
  listStyle: {
    backgroundColor: 'transparent',
    margin: 0,
    padding: 5,
    alignItems: 'flex-start',
  },
  listContent: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignContent: 'flex-start',
  },
  sectionStyle: {
    flexDirection: 'row',
    height: 100
  },
  textStyle: {
    fontSize: 20,
    color: '#000000',
    fontWeight: 'bold',
    paddingTop: 10,
    marginLeft: 15,
  },
});

export default spotStyles;
