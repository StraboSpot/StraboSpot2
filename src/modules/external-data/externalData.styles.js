import {StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const externalDataStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
  },
  button: {
    width: 300,
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    alignItems: 'flex-end',
  },
  iconContainer: {
    paddingRight: 10,
    paddingLeft: 10,
  },
  iconButton: {
    padding: 0,
  },
  loadingSpinner: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 50,
  },
  overlayContainer: {
    width: '90%',
    height: '90%',
    borderRadius: 20,
  },
  textStyle: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default externalDataStyles;
