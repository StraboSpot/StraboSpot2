import {StyleSheet} from 'react-native';

const spotStyles = StyleSheet.create({
  imageContainer: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'space-between',
    paddingHorizontal: 10
  },
  iconButton: {
    height: 25,
    width: 25,
    // padding: 20
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
  textStyle: {
    fontSize: 20,
    color: '#000000',
    fontWeight: 'bold',
    paddingTop: 10
  },
});

export default spotStyles;
