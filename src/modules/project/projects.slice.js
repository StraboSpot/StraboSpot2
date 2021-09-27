import {createSlice} from '@reduxjs/toolkit';

import {isEmpty} from '../../shared/Helpers';
import {DEFAULT_GEOLOGIC_TYPES, DEFAULT_RELATIONSHIP_TYPES} from './project.constants';

const initialProjectState = {
  activeDatasetsIds: [],
  selectedDatasetId: undefined,
  project: {},
  datasets: {},
  databaseEndpoint: {
    url: null,
    isSelected: false,
  },
  deviceBackUpDirectoryExists: false,
  isTestingMode: false,
  selectedProject: {
    project: '',
    source: '',
  },
  selectedTag: {},
  isMultipleFeaturesTaggingEnabled: false,
  addTagToSelectedSpot: false,
};

const projectSlice = createSlice({
  name: 'project',
  initialState: initialProjectState,
  reducers: {
    addedCustomFeatureTypes(state, action) {
      state.project.other_features = action.payload;
      state.project.modified_timestamp = Date.now();
    },
    addedDataset(state, action) {
      state.datasets = {...state.datasets, [action.payload.id]: action.payload};
      state.project.modified_timestamp = Date.now();
    },
    addedDatasets(state, action) {
      state.datasets = action.payload;
    },
    addedMeasurementTemplates(state, action) {
      state.project.templates.measurementTemplates = action.payload;
      state.project.modified_timestamp = Date.now();
    },
    addedProject(state, action) {
      if (!action.payload.description) action.payload.description = {};
      if (!action.payload.description.project_name) action.payload.description.project_name = 'Unnamed';
      if (!action.payload.other_features) action.payload.other_features = DEFAULT_GEOLOGIC_TYPES;
      if (!action.payload.relationship_types) action.payload.relationship_types = DEFAULT_RELATIONSHIP_TYPES;
      if (!action.payload.templates) {
        action.payload.templates = {
          useMeasurementTemplates: false,
          measurementTemplates: [],
          activeMeasurementTemplates: [],
        };
      }
      if (!action.payload.useContinuousTagging) action.payload.useContinuousTagging = false;
      state.project = action.payload;
    },
    addedProjectDescription(state, action) {
      state.project = action.payload;
    },
    addedSpotsIdsToDataset(state, action) {
      const {datasetId, spotIds} = action.payload;
      const timestamp = Date.now();
      const spotIdsInDataset = state.datasets[datasetId].spotIds
        ? [...state.datasets[action.payload.datasetId].spotIds, ...spotIds]
        : spotIds;
      const spotIdsUnique = [...new Set(spotIdsInDataset)];
      const dataset = {...state.datasets[datasetId], modified_timestamp: timestamp, spotIds: spotIdsUnique};
      state.datasets = {...state.datasets, [datasetId]: dataset};
      state.project.modified_timestamp = timestamp;
    },
    addedNeededImagesToDataset(state, action) {
      const {datasetId, images} = action.payload;
      const timestamp = Date.now();
      const imagesInDataset = state.datasets[datasetId].images
        ? {...state.datasets[datasetId].images, ...images}
        : images;
      state.datasets = {
        ...state.datasets,
        [datasetId]: {...state.datasets[datasetId], modified_timestamp: timestamp, images: imagesInDataset},
      };
      state.project.modified_timestamp = timestamp;
    },
    addedTagToSelectedSpot(state, action) {
      state.addTagToSelectedSpot = action.payload;
      state.project.modified_timestamp = Date.now();
    },
    clearedDatasets(state) {
      state.datasets = {};
      state.activeDatasetsIds = [];
      state.selectedDatasetId = undefined;
    },
    clearedProject(state) {
      state.project = {};
    },
    deletedDataset(state, action) {
      const {[action.payload]: deletedDataset, ...datasetsList} = state.datasets;  // Delete key with action.id from object
      state.datasets = datasetsList;
      state.activeDatasetsIds = state.activeDatasetsIds.filter(activeDatasetId => activeDatasetId !== action.payload);
      state.project.modified_timestamp = Date.now();
    },
    deletedSpotIdFromTags(state, action) {
      const spotId = action.payload;
      if (!isEmpty(state.project.tags)) {
        const updatedTags = state.project.tags.map(tag => {
          let updatedTag = JSON.parse(JSON.stringify(tag));
          if (updatedTag.spots?.includes(spotId)) {
            updatedTag.spots = updatedTag.spots.filter(id => id !== spotId);
            if (isEmpty(updatedTag.spots)) delete updatedTag.spots;
          }
          if (updatedTag.features && updatedTag.features[spotId]) {
            delete updatedTag.features[spotId];
            if (isEmpty(updatedTag.features)) delete updatedTag.features;
          }
          return updatedTag;
        });
        state.project.tags = updatedTags;
        state.project.modified_timestamp = Date.now();
        state.selectedTag = updatedTags.find(tag => tag.id === state.selectedTag.id) || {};
      }
    },
    deletedSpotIdFromDataset(state, action) {
      const {datasetId, spotId} = action.payload;
      const timestamp = Date.now();
      const dataset = state.datasets[datasetId];
      const updatedSpotIds = dataset.spotIds.filter(id => id !== spotId);
      const updatedDataset = {...dataset, modified_timestamp: timestamp, spotIds: updatedSpotIds};
      state.datasets = {...state.datasets, [datasetId]: updatedDataset};
      state.project.modified_timestamp = timestamp;
    },
    deletedSpotIdFromDatasets(state, action) {
      const spotId = action.payload;
      const timestamp = Date.now();
      const updatedDatatsets = Object.entries(state.datasets).reduce((acc, [datasetId, dataset]) => {
        const remainingSpotIds = dataset.spotIds?.filter(id => id !== spotId) || [];
        return {...acc, [datasetId]: {...dataset, modified_timestamp: timestamp, spotIds: remainingSpotIds}};
      }, {});
      state.datasets = updatedDatatsets;
      state.project.modified_timestamp = timestamp;
    },
    doesBackupDirectoryExist(state, action) {
      state.deviceBackUpDirectoryExists = action.payload;
    },
    setActiveDatasets(state, action) {
      const {bool, dataset} = action.payload;
      if (bool) state.activeDatasetsIds = [...new Set([...state.activeDatasetsIds, dataset])];
      else state.activeDatasetsIds = state.activeDatasetsIds.filter(id => id !== dataset);
    },
    setActiveMeasurementTemplates(state, action) {
      state.project.templates.activeMeasurementTemplates = action.payload;
    },
    setDatabaseEndpoint(state, action) {
      if (isEmpty(action.payload)) {
        state.databaseEndpoint = initialProjectState.databaseEndpoint;
      }
      else state.databaseEndpoint = action.payload;
    },
    setSelectedDataset(state, action) {
      state.selectedDatasetId = action.payload;
    },
    setSelectedProject(state, action) {
      const {project, source} = action.payload;
      state.selectedProject.project = project;
      state.selectedProject.source = source;
    },
    setSelectedTag(state, action) {
      state.selectedTag = action.payload;
    },
    setTestingMode(state, action) {
      state.isTestingMode = action.payload;
    },
    setMultipleFeaturesTaggingEnabled(state, action) {
      state.isMultipleFeaturesTaggingEnabled = action.payload;
    },
    setUseMeasurementTemplates(state, action) {
      state.project.templates.useMeasurementTemplates = action.payload;
    },
    setUseContinuousTagging(state, action) {
      state.project.useContinuousTagging = action.payload;
    },
    updatedDatasetProperties(state, action) {
      const timestamp = Date.now();
      console.log('UpdatedDataset', action.payload);
      state.datasets[action.payload.id].name = action.payload.name;
      state.datasets[action.payload.id].modified_timestamp = timestamp;
      state.project.modified_timestamp = timestamp;
    },
    updatedDatasets(state, action) {
      state.datasets = action.payload;
    },
    updatedProject(state, action) {
      const {field, value} = action.payload;
      if (field === 'description') state.project.description = value;
      else if (field === 'preferences') state.project.preferences = value;
      else if (field === 'tags' && !isEmpty(state.selectedTag)) {
        state.selectedTag = value.find(tag => tag.id === state.selectedTag.id);
      }
      state.project[field] = value;
      state.project.modified_timestamp = Date.now();
    },
  },
});

export const {
  addedCustomFeatureTypes,
  addedDataset,
  addedDatasets,
  addedMeasurementTemplates,
  addedProject,
  addedProjectDescription,
  addedNeededImagesToDataset,
  addedSpotsIdsToDataset,
  addedTagToSelectedSpot,
  clearedDatasets,
  clearedProject,
  deletedDataset,
  deletedSpotIdFromDataset,
  deletedSpotIdFromDatasets,
  deletedSpotIdFromTags,
  doesBackupDirectoryExist,
  setActiveDatasets,
  setActiveMeasurementTemplates,
  setDatabaseEndpoint,
  setSelectedDataset,
  setSelectedProject,
  setSelectedTag,
  setTestingMode,
  setMultipleFeaturesTaggingEnabled,
  setUseContinuousTagging,
  setUseMeasurementTemplates,
  updatedDatasetProperties,
  updatedDatasets,
  updatedProject,
} = projectSlice.actions;

export default projectSlice.reducer;
