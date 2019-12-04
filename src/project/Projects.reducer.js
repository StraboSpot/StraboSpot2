import {projectReducers} from './Project.constants';

const initialState = {
  project: {},
  projectDatasets: null,
};

export const projectsReducer = (state = initialState, action) => {
  switch (action.type) {
    case projectReducers.PROJECTS:
      return {
        ...state,
        project: action.project,
      };
    case projectReducers.DATASETS.PROJECT_DATASETS:
      return {
        ...state,
        projectDatasets: action.datasets,
      };
  }
  return state;
};
