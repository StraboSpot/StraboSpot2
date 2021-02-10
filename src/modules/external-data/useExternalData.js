import {useDispatch, useSelector} from 'react-redux';

import {editedSpotProperties} from '../spots/spots.slice';

const useExternalData = () => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const saveCSV = (CSVObject) => {
    try {
      let savedTables;
      let editedData = spot.properties.data ? JSON.parse(JSON.stringify(spot.properties.data)) : {};
      if (spot.properties.data?.tables) savedTables = spot.properties.data.tables;
      console.log(savedTables);
      if (!editedData.tables) editedData.tables = [];
      editedData.tables.push(CSVObject);
      console.log(editedData);
      dispatch(editedSpotProperties({field: 'data', value: editedData}));
    }
    catch (err) {
      console.error('Error saving .CSV file');
    }
  };

  return {
    saveCSV: saveCSV,
  };
};

export default useExternalData;
