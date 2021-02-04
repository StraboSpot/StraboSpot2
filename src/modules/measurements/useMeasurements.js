import {Alert} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import {LABEL_DICTIONARY} from '../form';
import {editedSpotProperties} from '../spots/spots.slice';

const useMeasurements = () => {
  const dispatch = useDispatch();

  const spot = useSelector(state => state.spot.selectedSpot);

  const removeMeasurementFromObj = (currentOrientationData, measurementToDelete) => {
    let aborted = false;
    let orientationDataCopy = JSON.parse(JSON.stringify(currentOrientationData));
    orientationDataCopy.forEach((measurement, i) => {
      if (measurementToDelete.id === measurement.id && !measurement.associated_orientation) orientationDataCopy[i] = {};
      else if (measurementToDelete.id === measurement.id && measurement.associated_orientation) {
        Alert.alert('Unable to Delete', 'Please delete the associated features before deleting the primary feature.');
        aborted = true;
        throw Error;
      }
      else if (measurement.associated_orientation) {
        measurement.associated_orientation.forEach((associatedMeasurement, j) => {
          if (measurementToDelete.id === associatedMeasurement.id) orientationDataCopy[i].associated_orientation[j] = {};
        });
        orientationDataCopy[i].associated_orientation = orientationDataCopy[i].associated_orientation.filter(
          associatedMeasurement => !isEmpty(associatedMeasurement));
      }
      if (measurement.associated_orientation && isEmpty(measurement.associated_orientation)) {
        delete orientationDataCopy[i].associated_orientation;
      }
    });
    if (!aborted) {
      orientationDataCopy = orientationDataCopy.filter(measurement => !isEmpty(measurement));
      return orientationDataCopy;
    }
  };

  const deleteMeasurements = (measurementsToDelete) => {
    console.log('Deleting measurements...', measurementsToDelete);

    let flattenedMeasurementsToDelete = measurementsToDelete.reduce((acc, meas) => {
      if (meas.associated_orientation) {
        const assocOrientations = meas.associated_orientation.reduce((acc1, aO) => [...acc1, aO], []);
        return [...acc, ...assocOrientations, meas];
      }
      else return [...acc, meas];
    }, []);

    let updatedOrientationData = spot.properties.orientation_data;
    flattenedMeasurementsToDelete.forEach(measurementToDelete => {
      updatedOrientationData = removeMeasurementFromObj(updatedOrientationData, measurementToDelete);
    });
    dispatch(editedSpotProperties({field: 'orientation_data', value: updatedOrientationData}));
  };

  const getLabel = (key) => {
    const measurementsDictionary = Object.values(LABEL_DICTIONARY.measurement).reduce(
      (acc, form) => ({...acc, ...form}), {});
    return measurementsDictionary[key] || key.replace(/_/g, ' ');
  };

  return [{
    deleteMeasurements: deleteMeasurements,
    getLabel: getLabel,
  }];
};

export default useMeasurements;
