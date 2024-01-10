import {StyleSheet} from 'react-native';

import * as themes from '../../shared/styles.constants';

const externalDataStyles = StyleSheet.create({
  button: {
    borderRadius: 20,
    elevation: 2,
    padding: 10,
    width: 300,
  },
  buttonClose: {
    alignItems: 'flex-end',
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  centeredView: {
    flex: 1,
  },
  iconButton: {
    padding: 0,
  },
  iconContainer: {
    paddingLeft: 10,
    paddingRight: 10,
  },
  loadingSpinner: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 50,
  },
  modalText: {
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    margin: 20,
    padding: 35,
  },
  overlayContainer: {
    borderRadius: 20,
    height: '90%',
    width: '90%',
  },
  textStyle: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default externalDataStyles;
