import {Alert} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import {getNewId, isEmpty, toTitleCase} from '../../shared/Helpers';
import {useFormHook} from '../form';
import {setStratSection} from '../maps/maps.slice';
import {PAGE_KEYS} from '../page/page.constants';
import {editedSpotProperties} from '../spots/spots.slice';
import {
  INTERPRETATIONS_SUBPAGES,
  LITHOLOGY_SUBPAGES,
  ROCK_SECOND_ORDER_TYPE_FIELDS,
  STRUCTURE_SUBPAGES,
} from './sed.constants';

const useSed = () => {
  const dispatch = useDispatch();
  const stratSection = useSelector(state => state.map.stratSection);

  const [useForm] = useFormHook();

  const deleteSedFeature = (key, spot, selectedFeature) => {
    if (Object.values(LITHOLOGY_SUBPAGES).includes(key)) key = PAGE_KEYS.LITHOLOGIES;
    else if (Object.values(STRUCTURE_SUBPAGES).includes(key)) key = PAGE_KEYS.STRUCTURES;
    else if (Object.values(INTERPRETATIONS_SUBPAGES).includes(key)) key = PAGE_KEYS.INTERPRETATIONS;

    let editedSedData = spot.properties.sed ? JSON.parse(JSON.stringify(spot.properties.sed)) : {};
    if (!editedSedData[key]) editedSedData[key] = [];
    if (key === PAGE_KEYS.STRAT_SECTION) {
      // ToDo Check if any spots mapped on this strat section before deleting
      console.log('Delete not implemented yet.');
      Alert.alert('Notice', 'Unable to delete. This feature has not been implemented yet.');
    }
    else if (key === PAGE_KEYS.BEDDING) {
      if (editedSedData[key].beds) {
        editedSedData[key].beds = editedSedData[key].beds.filter(type => type.id !== selectedFeature.id);
      }
      if (isEmpty(editedSedData[key].beds)) delete editedSedData[key].beds;
      if (isEmpty(editedSedData[key])) delete editedSedData[key];
    }
    else {
      editedSedData[key] = editedSedData[key].filter(type => type.id !== selectedFeature.id);
      if (isEmpty(editedSedData[key])) delete editedSedData[key];
    }
    dispatch(editedSpotProperties({field: 'sed', value: editedSedData}));
  };

  const getBeddingTitle = (bedding) => {
    const formName = ['sed', 'bedding'];
    const fieldName = 'package_geometry';
    const choiceLabels = useForm.getLabels(bedding[fieldName], formName);
    if (isEmpty(choiceLabels)) return 'Unknown Bed';
    else return choiceLabels;
  };

  const getIntervalTitle = (character, interval) => {
    const formName = ['sed', 'interval'];
    return (interval.interval_thickness ? useForm.getLabel(interval.interval_thickness, formName)
        : 'Unknown Thickness')
      + (interval.thickness_units ? useForm.getLabel(interval.thickness_units, formName)
        : ' Unknown Units')
      + (character ? ' ' + useForm.getLabel(character, formName) : ' Unknown Character');
  };

  const getRockTitle = (rock) => {
    const formName = ['sed', 'lithologies'];
    const mainLabel = useForm.getLabel(rock.primary_lithology, formName);
    const labelsArr = ROCK_SECOND_ORDER_TYPE_FIELDS.reduce((acc, fieldName) => {
      if (rock[fieldName]) {
        const choiceLabel = useForm.getLabels(rock[fieldName], formName);
        return [...acc, choiceLabel.toUpperCase()];
      }
      else return acc;
    }, []);
    if (isEmpty(labelsArr)) return toTitleCase(mainLabel);
    else return toTitleCase(mainLabel) + ' - ' + labelsArr.join(', ');
  };

  const getStratSectionTitle = (inStratSection) => {
    const formName = ['sed', PAGE_KEYS.STRAT_SECTION];
    const columnProfile = inStratSection.column_profile ? useForm.getLabel(inStratSection.column_profile, formName)
      : 'Unknown Profile';
    const columnYUnits = inStratSection.column_y_axis_units
      ? useForm.getLabel(inStratSection.column_y_axis_units, formName) : 'Unknown Units';
    return (inStratSection.section_well_name || 'Unknown Section/Well Name') + ' - ' + columnProfile
      + ' (' + columnYUnits + ')';
  };

  const saveSedBedFeature = async (key, spot, formCurrent, isLeavingPage) => {
    await saveSedFeature(key, spot, formCurrent, isLeavingPage, 'beds');
  };

  const saveSedFeature = async (key, spot, formCurrent, isLeavingPage, subKey) => {
    if (Object.values(LITHOLOGY_SUBPAGES).includes(key)) key = PAGE_KEYS.LITHOLOGIES;
    else if (Object.values(STRUCTURE_SUBPAGES).includes(key)) key = PAGE_KEYS.STRUCTURES;
    else if (Object.values(INTERPRETATIONS_SUBPAGES).includes(key)) key = PAGE_KEYS.INTERPRETATIONS;

    try {
      await formCurrent.submitForm();
      let editedFeatureData = useForm.showErrors(formCurrent, isLeavingPage);
      console.log('Saving', key, 'data to Spot ...');
      let editedSedData = spot.properties.sed ? JSON.parse(JSON.stringify(spot.properties.sed)) : {};
      if (subKey) {
        if (!editedSedData[key]) editedSedData[key] = {};
        if (!editedSedData[key][subKey]) editedSedData[key][subKey] = [];
        let i = editedSedData[key][subKey].findIndex(b => b.id === editedFeatureData.id);
        if (i === -1) i = editedSedData[key][subKey].length;
        editedSedData[key][subKey].splice(i, 1, editedFeatureData);
      }
      else if (key === PAGE_KEYS.BEDDING) editedSedData[key] = editedFeatureData;
      else if (key === PAGE_KEYS.INTERVAL) {
        const {character, ...intervalData} = editedFeatureData;
        if (character) editedSedData.character = character;
        else if (editedSedData.character) delete editedSedData.character;
        editedSedData.interval = intervalData;
      }
      else if (key === PAGE_KEYS.STRAT_SECTION) {
        editedSedData[key] = Object.entries(editedSedData[key]).reduce((acc, [k, v]) => {
          return k === 'strat_section_id' || k === 'images' ? {...acc, [k]: v} : acc;
        }, {});
        editedSedData[key] = {...editedSedData[key], ...editedFeatureData};
      }
      else {
        if (!editedSedData[key] || !Array.isArray(editedSedData[key])) editedSedData[key] = [];
        let i = editedSedData[key].findIndex(b => b.id === editedFeatureData.id);
        if (i === -1) i = editedSedData[key].length;
        editedSedData[key].splice(i, 1, editedFeatureData);
      }
      dispatch(editedSpotProperties({field: 'sed', value: editedSedData}));

      // Update strat section for map if matches edited strat section
      const stratSectionSettings = editedSedData.strat_section || {};
      if (stratSectionSettings.strat_section_id && stratSection.strat_section_id === stratSectionSettings.strat_section_id) {
        dispatch(setStratSection(stratSectionSettings));
      }
    }
    catch (err) {
      Alert.alert('Error Saving', 'Unable to save changes.');
      console.log('Error saving', key, err);
      throw Error;
    }
  };

  const saveSedFeatureValuesFromTemplates = (key, spot, activeTemplates) => {
    let editedSedData = spot.properties.sed ? JSON.parse(JSON.stringify(spot.properties.sed)) : {};
    if (!editedSedData[key] || !Array.isArray(editedSedData[key])) editedSedData[key] = [];
    activeTemplates.forEach((t) => editedSedData[key].push({...t.values, id: getNewId()}));
    dispatch(editedSpotProperties({field: 'sed', value: editedSedData}));
  };


  return {
    deleteSedFeature: deleteSedFeature,
    getBeddingTitle: getBeddingTitle,
    getIntervalTitle: getIntervalTitle,
    getRockTitle: getRockTitle,
    getStratSectionTitle: getStratSectionTitle,
    saveSedBedFeature: saveSedBedFeature,
    saveSedFeature: saveSedFeature,
    saveSedFeatureValuesFromTemplates: saveSedFeatureValuesFromTemplates,
  };
};

export default useSed;
