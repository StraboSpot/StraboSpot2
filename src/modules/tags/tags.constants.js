export const tagTypes = {
  GEOLOGIC_UNIT: 'geologic_unit',
  CONCEPT: 'concept',
  DOCUMENTATION: 'documentation',
  ROSETTA: 'rosetta',
  EXPERIMENTAL_APPARATUS: 'experimental_apparatus',
  OTHER: 'other',
};

export const conceptType = [
  {
    label: 'Geologic Unit',
    name: 'geologic_unit',
  },
  {
    label: 'Concept',
    name: 'concept',
  },
  {
    label: 'Marker Layer',
    name: 'marker_layer',
  },
  {
    label: 'Documentation',
    name: 'documentation',
  },
  {
    label: 'Rosetta',
    name: 'rosetta',
  },
  {
    label: 'Experimental Apparatus',
    name: 'experimental_apparatus',
  },
  {
    label: 'Other',
    name: 'other',
  },
];

export const tagsReducers = {
  UPDATE_TAG: 'UPDATE_TAG',
  SELECTED_TAG: 'SELECTED_TAG',
};
