import {useDispatch} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import {useFormHook} from '../form';
import {PAGE_KEYS} from '../page/page.constants';
import {editedSpotProperties} from '../spots/spots.slice';
import {ABBREVIATIONS_WITH_LABELS, LABELS_WITH_ABBREVIATIONS} from './petrology.constants';

const usePetrology = () => {
  const dispatch = useDispatch();

  const [useForm] = useFormHook();

  const deletePetFeature = (key, spot, selectedFeature) => {
    let editedPetData = spot.properties.pet ? JSON.parse(JSON.stringify(spot.properties.pet)) : {};

    // Delete SS1 style rock data of given type
    if (selectedFeature.rock_type) {
      const survey = useForm.getSurvey(['pet_deprecated', key]);
      survey.forEach(f => delete editedPetData[f.name]);
      editedPetData.rock_type = editedPetData.rock_type.filter(t => t !== key);
      if (isEmpty(editedPetData.rock_type)) delete editedPetData.rock_type;
    }
    else {
      if (!editedPetData[key]) editedPetData[key] = [];
      editedPetData[key] = editedPetData[key].filter(type => type.id !== selectedFeature.id);
      if (isEmpty(editedPetData[key])) delete editedPetData[key];
    }
    dispatch(editedSpotProperties({field: 'pet', value: editedPetData}));
  };

  const getAbbrevFromFullMineralName = (name) => {
    const keyMatch = Object.keys(LABELS_WITH_ABBREVIATIONS).find(key => key.toLowerCase() === name.toLowerCase());
    if (keyMatch) return LABELS_WITH_ABBREVIATIONS[keyMatch].split(',')[0];
  };

  const getFullMineralNameFromAbbrev = (abbrev) => {
    return ABBREVIATIONS_WITH_LABELS[abbrev.toLowerCase()];
  };

  const getMineralTitle = (item) => {
    if (item.full_mineral_name && item.mineral_abbrev) return item.full_mineral_name + ' (' + item.mineral_abbrev + ')';
    else return item.full_mineral_name || '(' + item.mineral_abbrev + ')' || 'Unknown';
  };

  const getReactionTextureTitle = (item) => {
    const formName = ['pet', 'reactions'];
    return (item.reactions || 'Unknown')
      + (item.based_on && (' - ' + useForm.getLabels(item.based_on, formName).toUpperCase()));
  };

  const onMineralChange = async (formCurrent, name, value) => {
    console.log(name, 'changed to', value);
    if (name === 'mineral_abbrev') {
      const foundFullName = getFullMineralNameFromAbbrev(value);
      if (foundFullName) await formCurrent.setFieldValue('full_mineral_name', foundFullName);
      await formCurrent.setFieldValue('mineral_abbrev', value);
    }
    else if (name === 'full_mineral_name') {
      const foundAbbrev = getAbbrevFromFullMineralName(value);
      if (foundAbbrev) await formCurrent.setFieldValue('mineral_abbrev', foundAbbrev);
      await formCurrent.setFieldValue('full_mineral_name', value);
    }
    else await formCurrent.setFieldValue(name, value);
  };

  const savePetFeature = async (key, spot, formCurrent) => {
    try {
      await formCurrent.submitForm();
      if (useForm.hasErrors(formCurrent)) {
        useForm.showErrors(formCurrent);
        throw Error;
      }
      console.log('Saving', key, 'data to Spot ...');
      if (formCurrent.values.rock_type && (key === PAGE_KEYS.ROCK_TYPE_IGNEOUS
        || key === PAGE_KEYS.ROCK_TYPE_METAMORPHIC || key === PAGE_KEYS.ROCK_TYPE_ALTERATION_ORE)) {
        dispatch(editedSpotProperties({field: 'pet', value: formCurrent.values}));
      }
      else {
        let editedFeatureData = formCurrent.values;
        let editedPetData = spot.properties.pet ? JSON.parse(JSON.stringify(spot.properties.pet)) : {};
        if (!editedPetData[key]) editedPetData[key] = [];
        editedPetData[key] = editedPetData[key].filter(type => type.id !== editedFeatureData.id);
        editedPetData[key].push(editedFeatureData);
        dispatch(editedSpotProperties({field: 'pet', value: editedPetData}));
      }
      // await formCurrent.resetForm();
    }
    catch (err) {
      console.log('Error saving', key, err);
      throw Error;
    }
  };

  return {
    deletePetFeature: deletePetFeature,
    getMineralTitle: getMineralTitle,
    getReactionTextureTitle: getReactionTextureTitle,
    onMineralChange: onMineralChange,
    savePetFeature: savePetFeature,
  };
};

export default usePetrology;
