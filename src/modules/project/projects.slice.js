import {createSlice, current} from '@reduxjs/toolkit';

import {isEmpty} from '../../shared/Helpers';
import {DEFAULT_GEOLOGIC_TYPES, DEFAULT_RELATIONSHIP_TYPES} from './project.constants';

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
    addedDatasets(state, action) {
      state.datasets = action.payload;
    },
    addedProject(state, action) {
      if (!action.payload.description) action.payload.description = {};
      if (!action.payload.description.project_name) action.payload.description.project_name = 'Unnamed';
      if (!action.payload.other_features) action.payload.other_features = DEFAULT_GEOLOGIC_TYPES;
      if (!action.payload.relationship_types) action.payload.relationship_types = DEFAULT_RELATIONSHIP_TYPES;
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
    addedTagToSelectedSpot(state, action) {
      state.addTagToSelectedSpot = action.payload;
    },
    clearedDatasets(state) {
      state.datasets = {};
      state.activeDatasetsIds = [];
      state.selectedDatasetId = {};
    },
    clearedProject(state) {
      state.project = {};
    },
    deletedDataset(state, action) {
      const {[action.payload]: deletedDataset, ...datasetsList} = state.datasets;  // Delete key with action.id from object
      state.datasets = datasetsList;
    },
    deletedSpotIdFromDataset(state, action) {
      const {dataset, spotId} = action.payload;
      const updatedSpotIds = dataset.spotIds.filter(id => id !== spotId);
      state.datasets[dataset.id].spotIds = updatedSpotIds;
      console.log(current(state));
    },
    doesBackupDirectoryExist(state, action) {
      state.deviceBackUpDirectoryExists = action.payload;
    },
    setActiveDatasets(state, action) {
      const {bool, dataset} = action.payload;
      if (bool) state.activeDatasetsIds = [...state.activeDatasetsIds, dataset];
      else state.activeDatasetsIds = state.activeDatasetsIds.filter(data => data !== dataset);
    },
    setSelectedDataset(state, action) {
      state.selectedDatasetId = action.payload;
    },
    setSelectedTag(state, action) {
      state.selectedTag = action.payload;
    },
    updatedDatasetProperties(state, action) {
      console.log('UpdatedDataset', action.payload);
      state.datasets[action.payload.id].name = action.payload.name;
    },
    updatedDatasets(state, action) {
      state.datasets = action.payload;
    },
    updatedProject(state, action) {
      const {field, value} = action.payload;
      if (field === 'description') {
        state.project.description = value;
      }
      else {
        if (field === 'tags' && !isEmpty(state.selectedTag)){
          state.selectedTag = value.find(tag => tag.id === state.selectedTag.id);
        }
      }
      state.project[field] = value;
      state.project.modified_timestamp = Date.now();
      state.project.date = new Date().toISOString();
    },
  },
})
;

export const {
  addedDataset,
  addedDatasets,
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
