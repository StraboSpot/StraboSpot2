import {Dimensions, StyleSheet} from 'react-native';

const width = Dimensions.get('window').width*.75;

const styles = StyleSheet.create({
  cardContainer: {
    flex:1,
    width: '50%',
    height: '95%',
    // alignContent: 'center'
  },
  container: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'flex-start'
  },
  divider: {
    height: 30,
    justifyContent: 'center',
  },
  header: {
    fontSize: 100,
    color: 'green',
    alignItems: 'center',
  },
  spotContainer: {
    // marginTop: 100,
    backgroundColor: '#d7e7ff',
    flex:1,
    width: '100%',
    height: '95%',
  },
  spotFieldTitles: {
    fontSize: 18,
    marginLeft: 15,
    fontWeight: 'bold',
    // marginTop: 10
  },
  spotFieldValues: {
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 15,
    paddingTop: 15,
    paddingBottom: 15,
  },
  locationContainer: {
    // width: '100%',
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'space-around',
    paddingTop: 0
  }
});

export default styles;
