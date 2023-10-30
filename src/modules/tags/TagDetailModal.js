import React from 'react';
import { Dimensions, FlatList, Platform, View} from 'react-native';

import {Button, Overlay} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import * as themes from '../../shared/styles.constants';
import alert from '../../shared/ui/alert';
import SaveAndCloseButton from '../../shared/ui/SaveAndCloseButtons';
import {setSidePanelVisible} from '../main-menu-panel/mainMenuPanel.slice';
import {useTagsHook} from '../tags';

const platform = Platform.OS === 'ios' ? 'window' : 'screen';
const dimensions = Dimensions.get(platform);

const TagDetailModal = (props) => {
  const dispatch = useDispatch();
  const selectedTag = useSelector(state => state.project.selectedTag);
  const [useTags] = useTagsHook();

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
          onPress: () => deleteTag(),
        },
      ],
      {cancelable: false},
    );
  };

  const deleteTag = () => {
    props.closeModal();
    dispatch(setSidePanelVisible({bool: false}));
    useTags.deleteTag(selectedTag);
  };

  const renderCancelSaveButtons = () => {
    return (
      <View>
        <SaveAndCloseButton
          cancel={() => props.closeModal()}
          save={() => saveFormAndClose()}
        />
      </View>
    );
  };

  const saveFormAndClose = () => {
    useTags.saveForm().then(() => {
      console.log('Finished saving tag data');
      props.closeModal();
    }, () => {
      console.log('Error saving tag data');
    });
  };

  return (
    <Overlay
      isVisible={props.isVisible}
      overlayStyle={{
        maxHeight: dimensions.height - 20,
        width: 350,
        borderRadius: 20,
        backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
        padding: 0,
      }}
    >
      <View style={{maxHeight: '100%'}}>
        {renderCancelSaveButtons()}
        <FlatList
          ListHeaderComponent={
            <React.Fragment>
              {useTags.renderTagForm(props.type)}
              <Button
                titleStyle={{color: themes.RED}}
                title={'Delete Tag'}
                type={'clear'}
                onPress={() => confirmDeleteTag()}
              />
            </React.Fragment>
          }
        />
      </View>
    </Overlay>
  );
};

export default TagDetailModal;
