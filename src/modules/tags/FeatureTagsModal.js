import React from 'react';

import {useDispatch, useSelector} from 'react-redux';

import TagsNotebookModal from './TagsNotebookModal';
import {setModalVisible} from '../home/home.slice';
import {MODAL_KEYS} from '../page/page.constants';
import {setMultipleFeaturesTaggingEnabled} from '../project/projects.slice';
import {setSelectedAttributes} from '../spots/spots.slice';

const FeatureTagsModal = () => {
  const dispatch = useDispatch();
  const modalVisible = useSelector(state => state.home.modalVisible);
  const renderFeatureTagsModal = () => {
    return (
      <TagsNotebookModal
        close={() => {
          dispatch(setMultipleFeaturesTaggingEnabled(false));
          dispatch(setModalVisible({modal: null}));
          dispatch(setSelectedAttributes([]));
        }}
        isFeatureLevelTagging={modalVisible === MODAL_KEYS.OTHER.FEATURE_TAGS}
      />
    );
  };

  return renderFeatureTagsModal();
};

export default FeatureTagsModal;
