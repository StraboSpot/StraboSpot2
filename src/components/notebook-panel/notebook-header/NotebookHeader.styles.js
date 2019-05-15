import {StyleSheet} from 'react-native';

const notebookHeaderStyles = StyleSheet.create({
    headerContentContainer: {
      flex: 1,
      flexDirection: 'row',
    },
    headerButtons: {
      paddingTop: 20
    },
    headerContainer: {
      borderBottomWidth: 1,
      height: 100,
      padding: 10,
    },
    headerCoords: {
      color: 'blue',
      fontSize: 16
    },
    headerImage: {
      resizeMode: 'contain',
    },
    headerCoordsContainer: {
      height: 30
    },
    headerSpotName: {
      fontSize: 32,
      fontWeight: 'bold'
    },
    headerSpotNameContainer: {
      height: 50,
      paddingTop: 10
    },
    headerSymbolIcon: {
      padding: 5
    },
    headerSpotNameAndCoordsContainer: {
      paddingLeft: 10,
      paddingRight: 10,
      flex: 8,
      flexDirection: 'column'
    }
});

export default notebookHeaderStyles;

