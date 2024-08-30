import React from 'react';
import {View} from 'react-native';

import {useSelector} from 'react-redux';

import notebookStyles from './notebook.styles';
import NotebookContent from './NotebookContent';
import {SMALL_SCREEN} from '../../shared/styles.constants';

const NotebookPanel = ({closeNotebookPanel, createDefaultGeom, openMainMenuPanel, zoomToSpots}) => {
  console.log('Rendering NotebookPanel...');

  const isNotebookPanelVisible = useSelector(state => state.notebook.isNotebookPanelVisible);

  if (SMALL_SCREEN || isNotebookPanelVisible) {
    return (
      <View style={notebookStyles.notebookPanel}>
        <NotebookContent
          closeNotebookPanel={closeNotebookPanel}
          createDefaultGeom={createDefaultGeom}
          openMainMenuPanel={openMainMenuPanel}
          zoomToSpots={zoomToSpots}
        />
      </View>
    );
  }
};

export default NotebookPanel;
