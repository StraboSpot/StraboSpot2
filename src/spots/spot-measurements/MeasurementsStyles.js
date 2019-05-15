import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  compassContainer: {
    //flex: 1,
    //position: 'absolute',
    //top: 50
    // width: 200,
    // height: 200,
    marginBottom: 25
  },
  backButton: {
    marginTop: 10,
    alignItems: 'flex-start'
  },
  measurementsListItem: {
    flex: 1,
    flexDirection: 'row',
  },
  textBubble: {
    borderRadius: 10,
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
  },
  measurementDetailContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start'
  },
  navButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  rightContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  measurementDetailSwitches: {
    backgroundColor: 'skyblue',
    height: 40
  }
});

export default styles;
