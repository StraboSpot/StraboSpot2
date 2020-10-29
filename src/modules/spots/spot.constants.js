export const generalKeysIcons = {
  orientation_data: require('../../assets/icons/Measurement_transparent.png'),
  _3d_structures: require('../../assets/icons/3DStructure_transparent.png'),
  notes: require('../../assets/icons/Note_transparent.png'),
  images: require('../../assets/icons/Photo_transparent.png'),
  samples: require('../../assets/icons/Sample_transparent.png'),
  other_features: require('../../assets/icons/QuestionMark_pressed.png'),
  pet: require('../../assets/icons/Petrology_transparent.png'),
  fabrics: require('../../assets/icons/Fabric_transparent.png'),
  tags: require('../../assets/icons/Tag_transparent.png'),
};

export const sedKeysIcons = {
  strat_section: require('../../assets/icons/SedStratColumn_transparent.png'),
  interval: require('../../assets/icons/QuestionMark_pressed.png'),
  lithologies: require('../../assets/icons/SedLithologies_transparent.png'),
  bedding: require('../../assets/icons/SedBedding_transparent.png'),
  structures: require('../../assets/icons/SedStructure_transparent.png'),
  diagenesis: require('../../assets/icons/SedDiagenesis_transparent.png'),
  fossils: require('../../assets/icons/SedFossil_transparent.png'),
  interpretations: require('../../assets/icons/SedInterpretation_transparent.png'),
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
