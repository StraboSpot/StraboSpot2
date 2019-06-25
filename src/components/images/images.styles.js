import {Dimensions, StyleSheet} from "react-native";

const imageStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3e0d2',
  },
  closeInfoView: {
    fontWeight: 'bold',
    position: "absolute",
    right: 20,
    top: 30,
  },
  editButton: {
    // textAlign: 'center'
  },
  imageContainer: {
    backgroundColor: 'white',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  imageInfoButtons: {
    marginTop: 20
  },
  rightsideIcons: {
    position: "absolute",
    right: 10,
    bottom: 50,
  },
  galleryImageContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'center',
    justifyContent: 'space-around'
  },
  notebookImage: {
    width: 135,
    height: 100,
  },
  galleryImage: {
    height: 300,
    width: (Dimensions.get('window').width / 2) - 40,
    // width: 200,
    margin: 10
    // paddingTop: 50,
  },

  flatListStyle: {
    flex: 1
  },
  containerStyle: {
    justifyContent: 'center',
    flex: 1,
    marginTop: 20,
  },
  fullImageStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '50%',
    width: '98%',
    resizeMode: 'contain',
  },
  modelStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  closeButtonStyle: {
    width: 25,
    height: 25,
    top: 9,
    right: 9,
    position: 'absolute',
  },
});

export default imageStyles;
