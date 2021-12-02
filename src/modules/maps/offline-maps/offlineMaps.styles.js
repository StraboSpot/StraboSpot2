import {StyleSheet} from 'react-native';

import * as themes from '../../../shared/styles.constants';

const styles = StyleSheet.create({
  buttonContainer: {
    padding: 10,
    marginTop: 10,
  },
  dialogBoxStyle: {
    borderRadius: 30,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
  },
  modalButtonText: {
    paddingLeft: 10,
    paddingRight: 15,
  },
  itemContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemSubContainer: {
    width: '100%',
    justifyContent: 'space-evenly',
    flexDirection: 'row',
  },
  itemTextStyle: {
    fontSize: themes.PRIMARY_TEXT_SIZE,
  },
  itemSubTextStyle: {
    fontSize: 14,
  },
  saveModalContainer: {
    flex: 1,
    width: 300,
    // backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    // borderRadius: 20,
    // alignItems: 'center',
  },

  picker: {
    flex: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default styles;
