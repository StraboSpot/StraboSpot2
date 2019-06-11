import {StyleSheet} from 'react-native';

const noteStyle = StyleSheet.create({
  container: {
  paddingTop: 25
  },
  inputContainer: {
    height: 300,
    backgroundColor: 'white',
    borderWidth: 1,
    // paddingTop: 25
  },
  notesOverviewContainer: {
    backgroundColor: 'white',
    padding: 10,
    flex: 1,
    flexDirection: 'row',
    // justifyContent: 'space-between'
  },
  buttonContainer: {
    // flexDirection: 'row',
  },
  editButton: {
    padding: 0
    // justifyContent: 'flex-start'
  }
});

export default noteStyle;

