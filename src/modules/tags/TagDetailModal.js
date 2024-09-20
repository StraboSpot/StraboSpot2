import React from 'react';
import {FlatList, useWindowDimensions, View} from 'react-native';

import {Button, Overlay} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import {SMALL_SCREEN} from '../../shared/styles.constants';
import alert from '../../shared/ui/alert';
import SaveAndCancelButtons from '../../shared/ui/SaveAndCancelButtons';
import overlayStyles from '../home/overlays/overlay.styles';
import {setSidePanelVisible} from '../main-menu-panel/mainMenuPanel.slice';
import {useTags} from '../tags';

const TagDetailModal = ({
                          closeModal,
                          isVisible,
                          type,
                        }) => {
  const {height} = useWindowDimensions();

  const dispatch = useDispatch();
  const selectedTag = useSelector(state => state.project.selectedTag);
  const {deleteTag, renderTagForm, saveForm} = useTags();

  const confirmDeleteTag = () => {
    alert(
      'Delete Tag',
      'Are you sure you want to delete ' + selectedTag.name + '?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => doDeleteTag(),
        },
      ],
      {cancelable: false},
    );
  };

  const doDeleteTag = () => {
    closeModal();
    dispatch(setSidePanelVisible({bool: false}));
    deleteTag(selectedTag);
  };

  const renderCancelSaveButtons = () => {
    return (
      <View>
        <SaveAndCancelButtons
          cancel={() => closeModal()}
          save={() => saveFormAndClose()}
        />
      </View>
    );
  };

  const saveFormAndClose = () => {
    saveForm().then(() => {
      console.log('Finished saving tag data');
      closeModal();
    }, () => {
      console.log('Error saving tag data');
    });
  };

  return (
    <Overlay
      isVisible={isVisible}
      overlayStyle={SMALL_SCREEN ? overlayStyles.overlayContainerFullScreen
        : {...overlayStyles.overlayContainer, maxHeight: height * 0.80}}
      fullScreen={SMALL_SCREEN}
      animationType={'slide'}
    >
      <>
        {renderCancelSaveButtons()}
        <FlatList
          ListHeaderComponent={
            <>
              {renderTagForm(type)}
              {!isEmpty(selectedTag) && (
                <Button
                  titleStyle={{color: themes.RED}}
                  title={'Delete Tag'}
                  type={'clear'}
                  onPress={() => confirmDeleteTag()}
                />
              )}
            </>
          }
        />
      </>
    </Overlay>
  );
};

export default TagDetailModal;
