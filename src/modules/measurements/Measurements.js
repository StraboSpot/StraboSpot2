import React, {useEffect, useState} from 'react';
import {Alert, SectionList, View} from 'react-native';

import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import {WARNING_COLOR} from '../../shared/styles.constants';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDivider from '../../shared/ui/SectionDivider';
import uiStyles from '../../shared/ui/ui.styles';
import {COMPASS_TOGGLE_BUTTONS} from '../compass/compass.constants';
import {setCompassMeasurements, setCompassMeasurementTypes} from '../compass/compass.slice';
import {setModalVisible} from '../home/home.slice';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import {setSelectedAttributes} from '../spots/spots.slice';
import MeasurementItem from './MeasurementItem';
import styles from './measurements.styles';
import useMeasurementsHook from './useMeasurements';

const MeasurementsPage = (props) => {
  const dispatch = useDispatch();
  const modalVisible = useSelector(state => state.home.modalVisible);
  const spot = useSelector(state => state.spot.selectedSpot);
  const compassMeasurements = useSelector(state => state.compass.measurements);

  const [useMeasurements] = useMeasurementsHook();

  const [multiSelectMode, setMultiSelectMode] = useState();
  const [selectedFeaturesTemp, setSelectedFeaturesTemp] = useState([]);

  const SECTIONS = {
    PLANAR: {
      title: 'Planar Measurements',
      keys: ['planar_orientation', 'tabular_orientation'],
      compass_toggles: [COMPASS_TOGGLE_BUTTONS.PLANAR],
    },
    LINEAR: {
      title: 'Linear Measurements',
      keys: ['linear_orientation'],
      compass_toggles: [COMPASS_TOGGLE_BUTTONS.LINEAR],
    },
    PLANARLINEAR: {
      title: 'P + L Measurements',
      keys: ['linear_orientation', 'planar_orientation', 'tabular_orientation'],
      compass_toggles: [COMPASS_TOGGLE_BUTTONS.PLANAR, COMPASS_TOGGLE_BUTTONS.LINEAR],
    },
  };

  // Create a new measurement on grabbing new compass measurements
  useEffect(() => {
    if (!isEmpty(compassMeasurements)) {
      console.log('New compass measurement recorded in Measurements.', compassMeasurements);
      useMeasurements.createNewMeasurement();
      dispatch(setCompassMeasurements({}));
    }
  }, [compassMeasurements]);

  const addMeasurement = (type) => {
    dispatch(setCompassMeasurementTypes(SECTIONS[type].compass_toggles));
    dispatch(setModalVisible({modal: props.page.modal}));
  };

  const deleteMeasurements = (measurementsToDelete) => {
    useMeasurements.deleteMeasurements(measurementsToDelete);
    onSelectingCancel();
  };

  const deleteMeasurementsConfirm = (measurementsToDelete) => {
    const deleteText = 'Are you sure you want to delete '
      + (measurementsToDelete.length === 1 ? 'this measurement' : 'these measurements') + '?';
    Alert.alert(
      'Delete Measurement',
      deleteText,
      [{
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      }, {
        text: 'OK',
        onPress: () => deleteMeasurements(measurementsToDelete),
      }],
      {cancelable: false},
    );
  };

  const getIdsOfSelected = () => {
    return selectedFeaturesTemp.map(value => value.id);
  };

  const onIdentifyAll = (type, data) => {
    console.log('Identify All:', data);
    setMultiSelectMode();
    dispatch(setModalVisible({modal: null}));
    dispatch(setSelectedAttributes(data));
    dispatch(setNotebookPageVisible(props.page.subpage_key));
  };

  const onMeasurementPressed = (item, title) => {
    const sectionType = Object.keys(SECTIONS).find(k => SECTIONS[k].title === title);
    console.log('type', sectionType);
    if (!multiSelectMode) viewMeasurementDetail(item);
    else {
      if (sectionType === multiSelectMode && (selectedFeaturesTemp.length === 0
        || (selectedFeaturesTemp.length > 0 && selectedFeaturesTemp[0].type === item.type))) {
        const i = selectedFeaturesTemp.find(selectedFeature => selectedFeature.id === item.id);
        if (i) setSelectedFeaturesTemp(selectedFeaturesTemp.filter(selectedFeature => selectedFeature.id !== item.id));
        else setSelectedFeaturesTemp([...selectedFeaturesTemp, item]);
        console.log('Adding selected feature to identify group ...');
      }
      else Alert.alert('Feature type mismatch!');
    }
  };

  const onSelectingCancel = () => {
    setSelectedFeaturesTemp([]);
    setMultiSelectMode();
  };

  const onSelectingEnd = () => {
    console.log('Identify Selected:', selectedFeaturesTemp);
    if (selectedFeaturesTemp.length > 1) dispatch(setModalVisible({modal: null}));
    dispatch(setSelectedAttributes(selectedFeaturesTemp));
    dispatch(setNotebookPageVisible(props.page.subpage_key));
  };

  const onSelectingStart = (type) => {
    console.log('Start Selecting for', type, ' ...');
    setSelectedFeaturesTemp([]);
    setMultiSelectMode(type);
  };

  const renderSectionHeader = ({title, data}) => {
    const sectionType = Object.keys(SECTIONS).find(k => SECTIONS[k].title === title);
    return (
      <View style={[styles.measurementsSectionDividerContainer, uiStyles.sectionHeaderBackground]}>
        <SectionDivider dividerText={title}/>
        <View style={styles.measurementsSectionDividerButtonContainer}>
          {multiSelectMode && sectionType === multiSelectMode && (
            <Button
              titleStyle={styles.measurementsSectionDividerButtonText}
              title={'Cancel'}
              type={'clear'}
              onPress={() => onSelectingCancel()}
            />
          )}
          {multiSelectMode && selectedFeaturesTemp.length >= 1 && sectionType === multiSelectMode && (
            <Button
              titleStyle={styles.measurementsSectionDividerButtonText}
              title={'Identify Selected'}
              type={'clear'}
              onPress={() => onSelectingEnd()}
            />
          )}
          {!multiSelectMode && (
            <View style={{flexDirection: 'row'}}>
              {modalVisible !== 'Notebook Compass Modal' && (
                <Button
                  titleStyle={styles.measurementsSectionDividerButtonText}
                  title={'Add'}
                  type={'clear'}
                  onPress={() => addMeasurement(sectionType)}
                />
              )}
              <React.Fragment>
                <Button
                  disabled={data.length < 1}
                  titleStyle={styles.measurementsSectionDividerButtonText}
                  title={'Identify All'}
                  type={'clear'}
                  onPress={() => onIdentifyAll(sectionType, data)}
                />
                <Button
                  disabled={data.length < 1}
                  titleStyle={styles.measurementsSectionDividerButtonText}
                  title={'Select'}
                  type={'clear'}
                  onPress={() => onSelectingStart(sectionType)}
                />
              </React.Fragment>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderSections = () => {
    const sections = Object.values(SECTIONS).reduce((acc, {title, keys}) => {
      const data = spot?.properties?.orientation_data?.filter(meas => {
        return ((keys.length !== 3 && !meas.associated_orientation)
          || (keys.length === 3 && meas.associated_orientation)) && keys.includes(meas.type);
      }) || [];
      return [...acc, {title: title, data: data.reverse()}];
    }, []);

    return (
      <SectionList
        keyExtractor={(item, index) => item + index}
        sections={sections}
        renderSectionHeader={({section}) => renderSectionHeader(section)}
        renderItem={({item, i, section}) => (
          <MeasurementItem
            item={item}
            selectedIds={getIdsOfSelected()}
            onPress={() => onMeasurementPressed(item, section.title)}
          />
        )}
        renderSectionFooter={({section}) => {
          return section.data.length === 0 && <ListEmptyText text={'No ' + section.title}/>;
        }}
        stickySectionHeadersEnabled={true}
        ItemSeparatorComponent={FlatListItemSeparator}
      />
    );
  };

  const viewMeasurementDetail = (item) => {
    dispatch(setSelectedAttributes([item]));
    dispatch(setNotebookPageVisible(props.page.subpage_key));
  };

  return (
    <View style={styles.measurementsContentContainer}>
      <ReturnToOverviewButton/>
      {renderSections()}
      {selectedFeaturesTemp.length >= 1 && (
        <View>
          <Button
            titleStyle={{color: WARNING_COLOR}}
            title={'Delete Measurement' + (selectedFeaturesTemp.length === 1 ? '' : 's')}
            type={'clear'}
            onPress={() => deleteMeasurementsConfirm(selectedFeaturesTemp)}
          />
        </View>
      )}
    </View>
  );
};

export default MeasurementsPage;
