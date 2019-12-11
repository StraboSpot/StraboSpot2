import {projectReducers} from './Project.constants';

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
    case projectReducers.DATASETS.DATASETS_UPDATE: {
      return {
        ...state,
        datasets: action.datasets,
      };
    }
    case projectReducers.DATASETS.ADD_SPOTS_IDS_TO_DATASET: {
      const dataset = {...state.datasets[action.datasetId], spotIds: action.spotIds};
      return {
        ...state,
        datasets: {...state.datasets, [action.datasetId]: dataset},
      };
    }
  }
  return state;
};
