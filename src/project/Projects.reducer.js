import {projectReducers} from './Project.constants';

const initialState = {
  project: {}
};

export const projectsReducer = (state = initialState, action) => {
  switch (action.type) {
    case projectReducers.PROJECTS:
      return {
        ...state,
        project: action.project
      }
  }
  return state;
};
