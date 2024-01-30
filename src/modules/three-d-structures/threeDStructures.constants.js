export const THREE_D_STRUCTURE_TYPES = {
  FOLD: 'fold',
  FAULT: 'fault',
  TENSOR: 'tensor',
  OTHER: 'other',
};

export const FOLD_MEASUREMENTS_KEYS = {
  group_xf0sv21: {
    trend: 'Trend',
    plunge: 'Plunge',
    quality: 'Measurement_Quality',
  },
  group_kx3ya56: {
    strike: 'Strike',
    dip_direction: 'Azimuthal_Dip_Direction',
    dip: 'Dip',
    quality: 'Measurement_Quality_001',
  },
  group_fold_foliation: {
    strike: 'fold_fol_strike',
    dip_direction: 'fold_fol_dip_direction',
    dip: 'fold_fol_dip',
    quality: 'fold_fol_quality',
  },
};

export const FAULT_MEASUREMENTS_KEYS = {
  group_ov4gw94: {
    strike: 'strike',
    dip_direction: 'dip_direction',
    dip: 'dip',
    quality: 'quality',
  },
};

export const BOUDINAGE_MEASUREMENTS_KEYS = {
  group_boudin_plane: {
    strike: 'boudinage_strike',
    dip_direction: 'boudinage_dip_direction',
    dip: 'boudinage_dip',
  },
  group_primary_neckline: {
    trend: 'boudinage_trend',
    plunge: 'boudinage_plunge',
  },
  group_secondary_neckline: {
    trend: 'boudinage_2nd_trend',
    plunge: 'boudinage_2nd_plunge',
  },
};

export const MULLION_MEASUREMENTS_KEYS = {
  group_ao6yo60: {
    strike: 'mullion_strike',
    dip_direction: 'mullion_dip_direction',
    dip: 'mullion_dip',
  },
  group_db5vg51: {
    trend: 'mullion_trend',
    plunge: 'mullion_plunge',
    quality: 'mullion_linear_measure_quality',
  },
};
