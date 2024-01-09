import React, {useRef, useState} from 'react';
import {Pressable, Text, View} from 'react-native';

import {Picker} from '@react-native-picker/picker';
import {Icon} from 'react-native-elements';
import {useSelector} from 'react-redux';

import {SpotsList, SpotsListItem} from './index';
import {isEmpty} from '../../shared/Helpers';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDivider from '../../shared/ui/SectionDivider';
import styles from '../../shared/ui/ui.styles';
import {ImageGallery} from '../images';
import SamplesMenuItem from '../samples/SamplesMenuItem';

const SpotNavigator = ({closeSpotsNavigator, openNotebookPanel, openSpotInNotebook}) => {
  console.log('Rendering SpotsNavigator...');

  const selectedSpot = useSelector(state => state.spot.selectedSpot);

  const pickerRef = useRef();

  const pickerKeys = {SPOTS: 'spots', IMAGES: 'images', SAMPLES: 'samples'};
  const [pickerKey, setPickerKey] = useState(pickerKeys.SPOTS);

  const pickerLabels = {
    [pickerKeys.SPOTS]: 'SPOTS LISTS',
    [pickerKeys.SAMPLES]: 'SAMPLES',
    [pickerKeys.IMAGES]: 'IMAGE GALLERY',
  };

  const openSpotInNotebookFromNavigator = (spot, notebookPage, attributes) => {
    closeSpotsNavigator();
    openSpotInNotebook(spot, notebookPage, attributes);
  };

  return (
    <>
      <SectionDivider dividerText={'Current Spot'}/>
      {isEmpty(selectedSpot) ? <ListEmptyText text={'No Selected Spot'}/>
        : <SpotsListItem onPress={openSpotInNotebook} spot={selectedSpot}/>}
      <Pressable
        onPress={() => pickerRef.current.focus()}
        style={{paddingLeft: 10, paddingTop: 8, paddingBottom: 2}}
      >
        <View style={{flexDirection: 'row', justifyContent: 'flex-start'}}>
          <Text style={styles.sectionDividerText}>{pickerLabels[pickerKey]}</Text>
          <Icon name={'caret-down-outline'} type={'ionicon'} size={20}
          />
        </View>
        <Picker
          onValueChange={setPickerKey}
          ref={pickerRef}
          selectedValue={pickerKey}
          style={{display: 'none', opacity: 0, height: 0, width: 0}}
        >
          <Picker.Item label={pickerLabels[pickerKeys.SPOTS]} value={pickerKeys.SPOTS}/>
          <Picker.Item label={pickerLabels[pickerKeys.IMAGES]} value={pickerKeys.IMAGES}/>
          <Picker.Item label={pickerLabels[pickerKeys.SAMPLES]} value={pickerKeys.SAMPLES}/>
        </Picker>
      </Pressable>
      {pickerKey === pickerKeys.SPOTS && <SpotsList onPress={openSpotInNotebook}/>}
      {pickerKey === pickerKeys.IMAGES && <ImageGallery openSpotInNotebook={openSpotInNotebook}/>}
      {pickerKey === pickerKeys.SAMPLES && (
        <SamplesMenuItem
          openSpotInNotebook={openSpotInNotebookFromNavigator}
          openNotebookPanel={openNotebookPanel}
        />
      )}
    </>
  );
};

export default SpotNavigator;
