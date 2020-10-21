import {createSlice, current} from '@reduxjs/toolkit';

const initialProjectState = {
  activeDatasetsIds: [],
  selectedDatasetId: {},
  project: {},
  datasets: {},
  deviceBackUpDirectoryExists: false,
  selectedTag: {},
  addTagToSelectedSpot: false,
};

const projectSlice = createSlice({
  name: 'project',
  initialState: initialProjectState,
  reducers: {
    addedDataset(state, action) {
      state.datasets = {...state.datasets, [action.payload.id]: action.payload};
    },
    addedProject(state, action) {
      state.project = action.payload;
    },
    addedProjectDescription(state, action) {
      state.project = action.payload;
    },
    addedSpotsIdsToDataset(state, action) {
      const {datasetId, spotIds} = action.payload;
      const spotIdsInDataset = state.datasets[datasetId].spotIds
        ? [...state.datasets[action.payload.datasetId].spotIds, ...spotIds]
        : spotIds;
      const spotIdsUnique = [...new Set(spotIdsInDataset)];
      const dataset = {...state.datasets[datasetId], spotIds: spotIdsUnique};
      state.datasets = {...state.datasets, [datasetId]: dataset};
    },
    addedTagToSelectedSpot(state, action) {},
    clearedDatasets(state, action) {
      state.datasets = {};
      state.activeDatasetsIds = [];
      state.selectedDatasetId = {};
    },
    clearedProject(state, action) {state.project = {};},
    deletedDataset(state, action) {
      const {[action.payload]: deletedDataset, ...datasetsList} = state.datasets;  // Delete key with action.id from object
      state.datasets = datasetsList;
    },
    deletedSpotIdFromDataset(state, action) {},
    doesBackupDirectoryExist(state, action) {},
    setActiveDatasets(state, action) {
      const {bool, dataset}= action.payload;
      if (bool) state.activeDatasetsIds = [...state.activeDatasetsIds, dataset];
      else state.activeDatasetsIds = state.activeDatasetsIds.filter(data => data !== dataset);
    },
    setSelectedDataset(state, action) {
      state.selectedDatasetId = action.payload;
    },
    setSelectedTag(state, action) {},
    updatedDatasetProperties(state, action) {
      console.log('UpdatedDataset', action.payload);
      state.datasets[action.payload.id].name = action.payload.name;
    },
    updatedDatasets(state, action) {
      state.datasets = action.payload;
    },
    updatedProject(state, action) {},
  },
});

export const {
  addedDataset,
  addedProject,
  addedProjectDescription,
  addedSpotsIdsToDataset,
  addedTagToSelectedSpot,
  clearedDatasets,
  clearedProject,
  deletedDataset,
  deletedSpotIdFromDataset,
  doesBackupDirectoryExist,
  setActiveDatasets,
  setSelectedDataset,
  setSelectedTag,
  updatedDatasetProperties,
  updatedDatasets,
  updatedProject,
} = projectSlice.actions;

export default projectSlice.reducer;
