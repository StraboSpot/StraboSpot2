export const FABRIC_TYPES = {
  fault_rock: 'Fault',
  igneous_rock: 'Igneous',
  metamorphic_rock: 'Metam.',
};

export const FIRST_ORDER_FABRIC_FIELDS = {
  fault_rock: ['structural_fabric', 'kinematic_fab'],
  igneous_rock: ['planar_fab', 'lin_fab', 'magmatic_str', 'solid_state_str'],
  metamorphic_rock: ['planar_fabric', 'linear_fab', 'other_met_fab', 'kinematic_ind'],
};
