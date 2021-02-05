export const BACKUP_TO_DEVICE = 'BACKUP TO DEVICE';
export const BACKUP_TO_SERVER = 'BACKUP TO SERVER';
export const OVERWRITE = 'OVERWRITE';
export const UPLOAD_TO_SERVER = 'UPLOAD_TO_SERVER';
export const CANCEL = 'CANCEL';

export const DEFAULT_GEOLOGIC_TYPES_DICTIONARY = [
  {id: 1, name: 'geomorphic'},
  {id: 2, name: 'hydrologic'},
  {id: 3, name: 'paleontological'},
  {id: 4, name: 'igneous'},
  {id: 5, name: 'metamorphic'},
  {id: 6, name: 'sedimentological'},
  {id: 7, name: 'other'},
];

export const DEFAULT_GEOLOGIC_TYPES = [
  'geomorphic',
  'hydrologic',
  'paleontological',
  'igneous',
  'metamorphic',
  'sedimentological',
  'other',
];

export const DEFAULT_RELATIONSHIP_TYPES = [
  'cross-cuts',
  'mutually cross-cuts',
  'is cut by',
  'is younger than',
  'is older than',
  'is lower metamorphic grade than',
  'is higher metamorphic grade than',
  'is included within', 'includes',
  'merges with',
];
