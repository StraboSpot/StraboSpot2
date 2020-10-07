export const generalKeysIcons = {
  orientation_data: require('../../assets/icons/Measurement_transparent.png'),
  _3d_structures: require('../../assets/icons/3DStructure_transparent.png'),
  notes: require('../../assets/icons/Note_transparent.png'),
  images: require('../../assets/icons/Photo_transparent.png'),
  samples: require('../../assets/icons/Sample_transparent.png'),
  other_features: require('../../assets/icons/QuestionMark_pressed.png'),
  pet: require('../../assets/icons/QuestionMark_pressed.png'),
  fabrics: require('../../assets/icons/QuestionMark_pressed.png'),
  tags: require('../../assets/icons/Tag_transparent.png'),
};

export const sedKeysIcons = {
  strat_section: require('../../assets/icons/Lithologies.png'),
  interval: require('../../assets/icons/Lithologies.png'),
  lithologies: require('../../assets/icons/Lithologies.png'),
  bedding: require('../../assets/icons/Bedding.png'),
  structures: require('../../assets/icons/SedStructure_pressed.png'),
  diagenesis: require('../../assets/icons/Diagenesis.png'),
  fossils: require('../../assets/icons/Fossil.png'),
  interpretations: require('../../assets/icons/SedInterpretation.png'),
};

export const spotReducers = {
  ADD_SPOT: 'ADD_SPOT',
  ADD_SPOTS: 'ADD_SPOTS',
  ADD_SPOTS_FROM_DEVICE: 'ADD_SPOTS_FROM_DEVICE',
  CLEAR_SELECTED_SPOTS: 'CLEAR_SELECTED_SPOTS',
  CLEAR_SPOTS: 'CLEAR_SPOTS',
  DELETE_SPOT: 'DELETE_SPOT',
  EDIT_SPOT_IMAGE: 'EDIT_SPOT_IMAGE',
  EDIT_SPOT_IMAGES: 'EDIT_SPOT_IMAGES',
  EDIT_SPOT_PROPERTIES: 'EDIT_SPOT_PROPERTIES',
  SET_SELECTED_ATTRIBUTES: 'SET_SELECTED_ATTRIBUTES',
  SET_SELECTED_SPOT: 'SET_SELECTED_SPOT',
  SET_SELECTED_SPOT_NOTES_TIMESTAMP: 'SET_SELECTED_SPOT_NOTES_TIMESTAMP',
  SET_INTERSECTED_SPOTS_FOR_TAGGING: 'SET_INTERSECTED_SPOTS_FOR_TAGGING',
};
