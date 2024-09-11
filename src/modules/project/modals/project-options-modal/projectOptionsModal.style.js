import {StyleSheet} from 'react-native';

import * as themes from '../../../../shared/styles.constants';

const projectOptionsModalStyle = StyleSheet.create({
  sectionViewButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 10,
  },
  backupViewInputHeaderText: {
    fontSize: 12,
    padding: 5,
    textAlign: 'center',
  },
  deleteButtonText: {
    color: 'red',
  },
  errorText: {
    color: 'red',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  projectNameText: {
    fontWeight: 'bold',
  },
  modalContainer: {
    position: 'absolute',
    top: '10%',
    width: 300,
    maxHeight: '90%',
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    borderRadius: 20,
  },
});

export default projectOptionsModalStyle;
