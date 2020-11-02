import React, {useState} from 'react';
import {Alert, FlatList, View} from 'react-native';

import {Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import * as themes from '../../shared/styles.constants';
import SectionDivider from '../../shared/ui/SectionDivider';
import {MODALS} from '../home/home.constants';
import {setModalVisible} from '../home/home.slice';
import {NOTEBOOK_PAGES} from '../notebook-panel/notebook.constants';
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
    if (sectionType === sectionTypes.PLANAR) {
      return spot.properties.orientation_data.filter(measurement => {
        return (measurement.type === 'planar_orientation' || measurement.type === 'tabular_orientation') && !measurement.associated_orientation;
      });
    }
    else if (sectionType === sectionTypes.LINEAR) {
      return spot.properties.orientation_data.filter(measurement => {
        return measurement.type === 'linear_orientation' && !measurement.associated_orientation;
      });
    }
    else if (sectionType === sectionTypes.PLANARLINEAR) {
      return spot.properties.orientation_data.filter(measurement => {
        return (measurement.type === 'planar_orientation' || measurement.type === 'linear_orientation' || measurement.type === 'tabular_orientation') && measurement.associated_orientation;
      });
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
    // props.setSelectedAttributes([item]);
    dispatch(setSelectedAttributes([item]));
    dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.MEASUREMENTDETAIL));
  };


  const identifyAll = (type) => {
    const data = getSectionData(type);
    console.log('Identify All:', data);
    setMultiSelectMode();
    // props.setSelectedAttributes(data);
    dispatch(setSelectedAttributes(data));
    dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.MEASUREMENTDETAIL));
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
    dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.MEASUREMENTDETAIL));
  };

  const renderMeasurements = (type) => {
    const data = getSectionData(type);
    const selectedIds = getIdsOfSelected();
    return (
      <View style={{maxHeight: '25%'}}>
        <FlatList
          data={data.reverse()}
          renderItem={item =>
            <MeasurementItem
              item={item}
              selectedIds={selectedIds}
              onPress={() => onMeasurementPressed(item.item, type)}/>}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    );
  };

  const renderSectionDivider = (dividerText) => {
    const dataThisSection = spot.properties.orientation_data ? getSectionData(dividerText) : [];
    return (
      <View style={((multiSelectMode && dividerText === multiSelectMode) || !multiSelectMode)
        ? styles.measurementsSectionDividerWithButtonsContainer
        : styles.measurementsSectionDividerContainer}>
        <View style={styles.measurementsSectionDividerTextContainer}>
          <SectionDivider dividerText={dividerText}/>
        </View>
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
              {modalVisible !== 'Notebook Compass Modal' && <Button
                titleStyle={styles.measurementsSectionDividerButtonText}
                title={'Add'}
                type={'clear'}
                onPress={() => addMeasurement(dividerText)}
              />}
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

  const renderSectionDividerShortcutView = (dividerText) => {
    return (
      <View style={styles.measurementsSectionDividerContainer}>
        <SectionDivider dividerText={dividerText}/>
      </View>
    );
  };

  const renderMeasurementsNotebookView = () => {
    return (
      <View style={styles.measurementsContentContainer}>
        <ReturnToOverviewButton
          onPress={() => {
            dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.OVERVIEW));
            dispatch(setModalVisible({modal: null}));
          }}
        />
        {renderSectionDivider(sectionTypes.PLANAR)}
        {spot.properties.orientation_data && renderMeasurements(sectionTypes.PLANAR)}
        {renderSectionDivider(sectionTypes.LINEAR)}
        {spot.properties.orientation_data && renderMeasurements(sectionTypes.LINEAR)}
        {renderSectionDivider(sectionTypes.PLANARLINEAR)}
        {spot.properties.orientation_data && renderMeasurements(sectionTypes.PLANARLINEAR)}
      </View>
    );
  };

  const renderMeasurementsShortcutView = () => {
    return (
      <View style={{backgroundColor: themes.PRIMARY_BACKGROUND_COLOR}}>
        {renderSectionDividerShortcutView(sectionTypes.PLANAR)}
        {spot.properties.orientation_data && renderMeasurements(sectionTypes.PLANAR)}
        {renderSectionDividerShortcutView(sectionTypes.LINEAR)}
        {spot.properties.orientation_data && renderMeasurements(sectionTypes.LINEAR)}
        {renderSectionDividerShortcutView(sectionTypes.PLANARLINEAR)}
        {spot.properties.orientation_data && renderMeasurements(sectionTypes.PLANARLINEAR)}
      </View>
    );
  };

  return (
    <React.Fragment>
      {modalVisible === MODALS.SHORTCUT_MODALS.COMPASS ? renderMeasurementsShortcutView() : renderMeasurementsNotebookView()}
    </React.Fragment>
  );
};

export default MeasurementsPage;
