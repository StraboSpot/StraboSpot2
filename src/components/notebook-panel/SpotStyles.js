import {StyleSheet} from 'react-native';
import * as themes from '../../themes/ColorThemes';

const spotStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themes.LIGHTGREY,
  },
  content: {
    padding: 0,
    backgroundColor: themes.LIGHTGREY,
  },
  header: {
    backgroundColor: themes.LIGHTGREY,
    padding: 10,
    flexDirection: 'row'
  },
  headerText: {
    textAlign: 'left',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#b2b2b7'
  },
  iconButton: {
    height: 25,
    width: 25,
  },
  listContainer: {
    backgroundColor: themes.LIGHTGREY
  },
  listStyle: {
    backgroundColor: 'white',
    marginTop: 5,
    marginBottom: 5,
  },
  listContent: {
    flex: 2,
    flexDirection: 'row',
  },
  sectionStyle: {
    flexDirection: 'row',
    height: 150
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
