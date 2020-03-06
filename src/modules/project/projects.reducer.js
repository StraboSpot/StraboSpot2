import {projectReducers} from './project.constants';

const initialState = {
  project: {},
  datasets: {},
};

export const projectsReducer = (state = initialState, action) => {
  switch (action.type) {
    case projectReducers.PROJECTS:
      return {
        ...state,
        project: action.project,
      };
    case projectReducers.PROJECT_ADD:
      return {
        ...state,
        project: action.description,
      };
    case projectReducers.PROJECT_CLEAR:
      return {
        ...state,
        project: {},
      };
    case projectReducers.UPDATE_PROJECT:
      console.log(action.field, action.value);
      const updatedProject = {
        ...state.project,
        [action.field]: action.value,
        modified_timestamp: Date.now(),
        date: new Date(),
      };
      return {
        ...state,
        project: updatedProject,
      };
    case projectReducers.DATASETS.DATASET_ADD:

      return {
        ...state,
        datasets: {...state.datasets, [action.dataset.id]: action.dataset},
      };
    case projectReducers.DATASETS.DATASETS_UPDATE: {
      return {
        ...state,
        datasets: action.datasets,
      };
    }
    case projectReducers.DATASETS.DATASETS_CLEAR:
      return {
        ...state,
        datasets: {},
      };
    case projectReducers.DATASETS.ADD_SPOTS_IDS_TO_DATASET: {
      const spotIds = state.datasets[action.datasetId].spotIds ?
        [...state.datasets[action.datasetId].spotIds, ...action.spotIds] : action.spotIds;
      const spotIdsUnique = [...new Set(spotIds)];
      const dataset = {...state.datasets[action.datasetId], spotIds: spotIdsUnique};
      return {
        ...state,
        datasets: {...state.datasets, [action.datasetId]: dataset},
      };
    }
    case projectReducers.DATASETS.DELETE_SPOT_ID: {
      console.log(action.datasetId, '&', action.filteredList);
      const dataset = {...state.datasets[action.datasetId], spotIds: action.filteredList};
      return {
        ...state,
        datasets: {...state.datasets, [action.datasetId]: dataset},
        modified_timestamp: Date.now(),
      };
    }
  }
  return state;
};
