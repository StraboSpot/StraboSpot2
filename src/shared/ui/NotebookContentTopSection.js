import React from 'react';
import {Text, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import {MODALS} from '../../modules/home/home.constants';
import {setModalVisible} from '../../modules/home/home.slice';
import {imageStyles} from '../../modules/images';
import {NOTEBOOK_PAGES} from '../../modules/notebook-panel/notebook.constants';
import {setNotebookPageVisible} from '../../modules/notebook-panel/notebook.slice';
import ReturnToOverviewButton from '../../modules/notebook-panel/ui/ReturnToOverviewButton';
import {setMultipleFeaturesTaggingEnabled} from '../../modules/project/projects.slice';
import {setSelectedAttributes} from '../../modules/spots/spots.slice';
import commonStyles from '../common.styles';
import ButtonRounded from './ButtonRounded';

const NotebookContentTopSection = (props) => {
  const dispatch = useDispatch();
  const isMultipleFeaturesTaggingEnabled = useSelector(state => state.project.isMultipleFeaturesTaggingEnabled);

  const taggingMultipleFeatures = () => {
    dispatch(setMultipleFeaturesTaggingEnabled(true));
    dispatch(setSelectedAttributes([]));
    dispatch(setModalVisible({modal: MODALS.NOTEBOOK_MODALS.FEATURE_TAGS}));
  };

  return (
    <View>
      {!isMultipleFeaturesTaggingEnabled && (
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <ReturnToOverviewButton
            onPress={() => {
              dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.OVERVIEW));
              if (props.returnToOverviewAction) props.returnToOverviewAction();
            }}
          />
          <ButtonRounded
            title={'Tag/Untag Features(s)'}
            titleStyle={commonStyles.standardDescriptionText}
            buttonStyle={[imageStyles.buttonContainer, {padding: 5}]}
            type={'outline'}
            onPress={() => taggingMultipleFeatures()}
          />
        </View>
      )}
      {isMultipleFeaturesTaggingEnabled && (
        <View>
          <Text style={[{fontWeight: 'bold', textAlign: 'center', padding: 5}]}> Select Features and Check Tags </Text>
          <Text style={[{textAlign: 'justify', paddingHorizontal: 10, paddingBottom: 10}]}>
            If features with different tags are selected, only common tags will appear selected.
            Checking a tag applies it to all selected features.
          </Text>
        </View>
      )}
    </View>
  );
};

export default NotebookContentTopSection;
