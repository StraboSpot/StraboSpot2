import {Dimensions, StyleSheet} from 'react-native';
import * as themes from '../../themes/ColorThemes';

const width = Dimensions.get('window').width * .75;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start'
  },
  divider: {
    height: 30,
    justifyContent: 'center',
    backgroundColor: themes.LIGHTGREY
  },
  header: {
    fontSize: 100,
    color: 'green',
    alignItems: 'center',
  },
  spotContainer: {
    backgroundColor: themes.LIGHTGREY,
    flex: 1,
    width: '100%',
    height: '95%',
  },
  spotDividerText: {
    fontSize: 20,
    paddingLeft: 10,
    textTransform: 'uppercase',
    color: themes.DARKGREY
  },
  spotFieldTitles: {
    fontWeight: 'bold',
    fontSize: 20,
    marginLeft: 15,
    paddingTop: 5,
  },
  spotFieldValues: {
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 35,
    paddingTop: 5,
    paddingBottom: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    paddingBottom: 10,
  },
  button: {
    marginTop: 10,
    marginBottom: 10,
    marginRight: 0,
    flexDirection: 'row'
  }
});

export default styles;
