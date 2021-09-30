import {useDispatch} from 'react-redux';

import {isEmpty, toTitleCase} from '../../shared/Helpers';
import {useFormHook} from '../form';
import {editedSpotProperties} from '../spots/spots.slice';
import {ROCK_SECOND_ORDER_TYPE_FIELDS} from './sed.constants';

const useSed = () => {
  const dispatch = useDispatch();

  const [useForm] = useFormHook();

  const deleteSedFeature = (key, spot, selectedFeature) => {
    let editedSedData = spot.properties.sed ? JSON.parse(JSON.stringify(spot.properties.sed)) : {};
    if (!editedSedData[key]) editedSedData[key] = [];
    editedSedData[key] = editedSedData[key].filter(type => type.id !== selectedFeature.id);
    if (isEmpty(editedSedData[key])) delete editedSedData[key];
    dispatch(editedSpotProperties({field: 'sed', value: editedSedData}));
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

  const saveSedFeature = async (key, spot, formCurrent) => {
    try {
      await formCurrent.submitForm();
      if (useForm.hasErrors(formCurrent)) {
        useForm.showErrors(formCurrent);
        throw Error;
      }
      console.log('Saving', key, 'data to Spot ...');
      let editedFeatureData = formCurrent.values;
      let editedSedData = spot.properties.sed ? JSON.parse(JSON.stringify(spot.properties.sed)) : {};
      if (!editedSedData[key] || !Array.isArray(editedSedData[key])) editedSedData[key] = [];
      editedSedData[key] = editedSedData[key].filter(type => type.id !== editedFeatureData.id);
      editedSedData[key].push(editedFeatureData);
      dispatch(editedSpotProperties({field: 'sed', value: editedSedData}));
      // await formCurrent.resetForm();
    }
    catch (err) {
      console.log('Error saving', key, err);
      throw Error;
    }
  };

  return {
    deleteSedFeature: deleteSedFeature,
    getRockTitle: getRockTitle,
    saveSedFeature: saveSedFeature,
  };
};

export default useSed;
