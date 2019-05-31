import {StyleSheet} from 'react-native';

const notebookHeaderStyles = StyleSheet.create({
    headerContentContainer: {
      flex: 15,
      flexDirection: 'row',
    },
    headerButtons: {
      paddingTop: 20
    },
    headerCoords: {
      color: 'blue',
      fontSize: 16
    },
    headerImage: {
      resizeMode: 'contain',
    },
    headerCoordsContainer: {
      height: 30,
      marginLeft: 5
    },
    headerSpotName: {
      fontSize: 35,
      fontWeight: 'bold'
    },
    headerSpotNameContainer: {
      height: 50
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

