import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  compassContainer: {
    //flex: 1,
    //position: 'absolute',
    //top: 50
    // width: 200,
    // height: 200
  },
  measurementsListItem: {
    flex: 1,
    flexDirection: 'row',
  },
  textBubble: {
    borderRadius:10,
    borderWidth: 3,
    padding: 4,
    margin: 4
  },
  mainText: {
    borderColor: 'darkgray',
    backgroundColor: 'darkgray',
  },
  propertyText: {
    borderColor: 'white',
    backgroundColor: 'white'
  },
  horizontalLine: {
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    width: '100%'
  }
});

export default styles;
