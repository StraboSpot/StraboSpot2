import {StyleSheet} from 'react-native';

import * as themes from '../../styles.constants';

  const modalStyle = StyleSheet.create({
    modalContainer: {
      width: 300,
      maxHeight:'90%',
      backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
      borderRadius: 20,
      overflow: 'hidden',
      zIndex: 1,
      padding: 0,
    },
    modalPosition: {
      position: 'absolute',
      left: 70,
      bottom: 20,
      borderRadius: 20,
    },
    sideModalPosition: {
      position: 'absolute',
      left: 100,
      bottom: 20,
      borderRadius: 20,
    },
    modalTitle: {
      fontWeight: 'bold',
      fontSize: 18,
      textAlign: 'center',
    },
    modalTop: {
      alignItems: 'center',
      flexDirection: 'row',
      backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
      minHeight: 40,
    },
    textStyle: {
      fontSize: themes.MODAL_TEXT_SIZE,
      color: themes.WARNING_COLOR,
      textAlign: 'center',
    },
    textContainer: {
      alignItems: 'center',
    },
  });

export default modalStyle;
