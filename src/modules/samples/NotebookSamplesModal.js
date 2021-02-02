import React from 'react';
import {Platform} from 'react-native';

import DragAnimation from '../../shared/ui/DragAmination';
import Modal from '../../shared/ui/modal/Modal';
import uiStyles from '../../shared/ui/ui.styles';
import AddSample from './AddSample';

const NotebookSamplesModal = (props) => {

  const renderNotebookSamplesModalContent = () => {
    return (
      <Modal
        close={props.close}
        buttonTitleLeft={'Undo'}
        textStyle={{fontWeight: 'bold'}}
        onPress={props.onPress}
        style={uiStyles.modalPosition}
      >
        <AddSample/>
      </Modal>
    );
  };

  if (Platform.OS === 'android') return renderNotebookSamplesModalContent();
  else return <DragAnimation>{renderNotebookSamplesModalContent()}</DragAnimation>;
};

export default NotebookSamplesModal;
