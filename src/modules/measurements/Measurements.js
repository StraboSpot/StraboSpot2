import React, {useState} from 'react';
import {Alert, FlatList, View} from 'react-native';

import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDivider from '../../shared/ui/SectionDivider';
import {MODALS} from '../home/home.constants';
import {setModalVisible} from '../home/home.slice';
import {NOTEBOOK_PAGES, NOTEBOOK_SUBPAGES} from '../notebook-panel/notebook.constants';
import {setCompassMeasurementTypes, setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import {setSelectedAttributes} from '../spots/spots.slice';
import {COMPASS_TOGGLE_BUTTONS} from './compass/compass.constants';
import MeasurementItem from './MeasurementItem';
import styles from './measurements.styles';

const MeasurementsPage = (props) => {
  const dispatch = useDispatch();
  const modalVisible = useSelector(state => state.home.modalVisible);
  const spot = useSelector(state => state.spot.selectedSpot);
  const [multiSelectMode, setMultiSelectMode] = useState();
  const [selectedFeaturesTemp, setSelectedFeaturesTemp] = useState([]);

  const sectionTypes = {
    PLANAR: 'Planar Measurements',
    LINEAR: 'Linear Measurements',
    PLANARLINEAR: 'P + L Measurements',
  };

  const addMeasurement = (sectionType) => {
    dispatch(setModalVisible({modal: MODALS.NOTEBOOK_MODALS.COMPASS}));

    let types = [];
    if (sectionType === sectionTypes.PLANAR) types = [COMPASS_TOGGLE_BUTTONS.PLANAR];
    else if (sectionType === sectionTypes.LINEAR) types = [COMPASS_TOGGLE_BUTTONS.LINEAR];
    else types = [COMPASS_TOGGLE_BUTTONS.PLANAR, COMPASS_TOGGLE_BUTTONS.LINEAR];
    dispatch(setCompassMeasurementTypes(types));
  };

  const getSectionData = (sectionType) => {
    if (isEmpty(spot.properties.orientation_data)) return [];
    if (sectionType === sectionTypes.PLANAR) {
      return (
        spot.properties.orientation_data.filter(measurement => {
          return (
            (measurement.type === 'planar_orientation' || measurement.type === 'tabular_orientation')
            && !measurement.associated_orientation
          );
        })
      );
    }
    else if (sectionType === sectionTypes.LINEAR) {
      return (
        spot.properties.orientation_data.filter(measurement => {
          return measurement.type === 'linear_orientation' && !measurement.associated_orientation;
        })
      );
    }
    else if (sectionType === sectionTypes.PLANARLINEAR) {
      return (
        spot.properties.orientation_data.filter(measurement => {
          return (measurement.type === 'planar_orientation' || measurement.type === 'linear_orientation'
            || measurement.type === 'tabular_orientation') && measurement.associated_orientation;
        })
      );
    }
  };

  const getIdsOfSelected = () => {
    return selectedFeaturesTemp.map(value => value.id);
  };

  const onMeasurementPressed = (item, type) => {
    if (!multiSelectMode) viewMeasurementDetail(item);
    else {
      if (type === multiSelectMode && (selectedFeaturesTemp.length === 0
        || (selectedFeaturesTemp.length > 0 && selectedFeaturesTemp[0].type === item.type))) {
        const i = selectedFeaturesTemp.find(selectedFeature => selectedFeature.id === item.id);
        if (i) setSelectedFeaturesTemp(selectedFeaturesTemp.filter(selectedFeature => selectedFeature.id !== item.id));
        else setSelectedFeaturesTemp([...selectedFeaturesTemp, item]);
        console.log('Adding selected feature to identify group ...');
      }
      else Alert.alert('Feature type mismatch!');
    }
  };

  const viewMeasurementDetail = (item) => {
    dispatch(setSelectedAttributes([item]));
    dispatch(setNotebookPageVisible(NOTEBOOK_SUBPAGES.MEASUREMENTDETAIL));
  };


  const identifyAll = (type) => {
    const data = getSectionData(type);
    console.log('Identify All:', data);
    setMultiSelectMode();
    // props.setSelectedAttributes(data);
    dispatch(setSelectedAttributes(data));
    dispatch(setNotebookPageVisible(NOTEBOOK_SUBPAGES.MEASUREMENTDETAIL));
  };

  const startSelecting = (type) => {
    console.log('Start Selecting for', type, ' ...');
    setSelectedFeaturesTemp([]);
    setMultiSelectMode(type);
  };

  const cancelSelecting = () => {
    setSelectedFeaturesTemp([]);
    setMultiSelectMode();
  };

  const endSelecting = () => {
    console.log('Identify Selected:', selectedFeaturesTemp);
    // props.setSelectedAttributes(selectedFeaturesTemp);
    dispatch(setSelectedAttributes(selectedFeaturesTemp));
    dispatch(setNotebookPageVisible(NOTEBOOK_SUBPAGES.MEASUREMENTDETAIL));
  };

  const renderMeasurements = (type) => {
    const data = getSectionData(type);
    const selectedIds = getIdsOfSelected();
    return (
      <FlatList
        keyExtractor={(item, index) => index.toString()}
        listKey={type}
        data={data.reverse()}
        renderItem={(item) =>
          <MeasurementItem
            item={item}
            selectedIds={selectedIds}
            onPress={() => onMeasurementPressed(item.item, type)}
          />
        }
        ItemSeparatorComponent={FlatListItemSeparator}
        ListEmptyComponent={<ListEmptyText text={'No ' + type}/>}
      />
    );
  };

  const renderSection = (sectionType) => {
    return (
      <React.Fragment>
        {renderSectionDivider(sectionType)}
        {renderMeasurements(sectionType)}
      </React.Fragment>
    );
  };

  const renderSectionDivider = (dividerText) => {
    const dataThisSection = spot.properties.orientation_data ? getSectionData(dividerText) : [];
    return (
      <View style={styles.measurementsSectionDividerContainer}>
        <SectionDivider dividerText={dividerText}/>
        <View style={styles.measurementsSectionDividerButtonContainer}>
          {multiSelectMode && dividerText === multiSelectMode && (
            <Button
              titleStyle={styles.measurementsSectionDividerButtonText}
              title={'Cancel'}
              type={'clear'}
              onPress={() => cancelSelecting()}
            />
          )}
          {multiSelectMode && selectedFeaturesTemp.length >= 1 && dividerText === multiSelectMode && (
            <Button
              titleStyle={styles.measurementsSectionDividerButtonText}
              title={'Identify Selected'}
              type={'clear'}
              onPress={() => endSelecting()}
            />
          )}
          {!multiSelectMode && (
            <View style={{flexDirection: 'row'}}>
              {modalVisible !== 'Notebook Compass Modal' && (
                <Button
                  titleStyle={styles.measurementsSectionDividerButtonText}
                  title={'Add'}
                  type={'clear'}
                  onPress={() => addMeasurement(dividerText)}
                />
              )}
              <React.Fragment>
                <Button
                  disabled={dataThisSection.length < 1}
                  titleStyle={styles.measurementsSectionDividerButtonText}
                  title={'Identify All'}
                  type={'clear'}
                  onPress={() => identifyAll(dividerText)}
                />
                <Button
                  disabled={dataThisSection.length < 1}
                  titleStyle={styles.measurementsSectionDividerButtonText}
                  title={'Select'}
                  type={'clear'}
                  onPress={() => startSelecting(dividerText)}
                />
              </React.Fragment>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.measurementsContentContainer}>
      <ReturnToOverviewButton
        onPress={() => {
          dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.OVERVIEW));
          dispatch(setModalVisible({modal: null}));
        }}
      />
      <FlatList
        keyExtractor={(sectionType) => sectionTypes[sectionType]}
        data={Object.values(sectionTypes)}
        renderItem={(item) => renderSection(item.item)}
      />
      {selectedFeaturesTemp.length >= 1 && (
        <View>
          <Button
            titleStyle={{color: themes.RED}}
            title={'Delete Measurement'}
            type={'clear'}
            onPress={() => console.log(selectedFeaturesTemp)}
          />
        </View>
      )}
    </View>
  );
};

export default MeasurementsPage;
