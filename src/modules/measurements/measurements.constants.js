import {COMPASS_TOGGLE_BUTTONS} from '../compass/compass.constants';

export const MEASUREMENT_KEYS = {
  PLANAR: 'planar_orientation',
  LINEAR: 'linear_orientation',
  PLANAR_LINEAR: 'planar_linear',
};

export const MEASUREMENT_TYPES = [
  {
    key: MEASUREMENT_KEYS.PLANAR,
    title: 'Planar Measurements',
    add_title: 'Plane',
    save_title: 'Planar Feature',
    form_keys: ['planar_orientation', 'tabular_orientation'],
    compass_toggles: [COMPASS_TOGGLE_BUTTONS.PLANAR],
  },
  {
    key: MEASUREMENT_KEYS.LINEAR,
    title: 'Linear Measurements',
    add_title: 'Line',
    save_title: 'Linear Feature',
    form_keys: ['linear_orientation'],
    compass_toggles: [COMPASS_TOGGLE_BUTTONS.LINEAR],
  },
  {
    key: MEASUREMENT_KEYS.PLANAR_LINEAR,
    title: 'P + L Measurements',
    add_title: 'P + L',
    save_title: 'Planar with Linear Feature',
    form_keys: ['planar_orientation', 'linear_orientation', 'tabular_orientation'],
    compass_toggles: [COMPASS_TOGGLE_BUTTONS.PLANAR, COMPASS_TOGGLE_BUTTONS.LINEAR],
  },
];

export const FIRST_ORDER_CLASS_FIELDS = ['feature_type', 'type'];

export const SECOND_ORDER_CLASS_FIELDS = ['other_feature', 'vorticity', 'bedding_type', 'contact_type',
  'foliation_type', 'fracture_type', 'vein_type', 'fault_or_sz_type', 'strat_type', 'intrusive_body_type',
  'injection_type', 'fracture_zone', 'fault_or_sz', 'damage_zone', 'alteration_zone', 'enveloping_surface'];
