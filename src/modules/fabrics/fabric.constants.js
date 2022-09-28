export const FABRIC_TYPES = {
  fault_rock: 'Structural',
  igneous_rock: 'Igneous',
  metamorphic_rock: 'Metam.',
};

export const FIRST_ORDER_FABRIC_FIELDS = {
  fault_rock: ['structural_fabric', 'linear_structural_fabrics', 'spatial_config', 'kinematic_fab'],
  igneous_rock: ['planar_fab', 'lin_fab', 'magmatic_str', 'mag_kin_fab'],
  metamorphic_rock: ['planar_fabric', 'linear_fab', 'other_met_fab', 'kinematic_fab'],
};
