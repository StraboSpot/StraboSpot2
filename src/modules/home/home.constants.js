import AddIntervalModal from '../maps/strat-section/AddIntervalModal';
import AddMeasurementModal from '../measurements/AddMeasurementModal';
import ShortcutNotesModal from '../notes/ShortcutNotesModal';
import {NOTEBOOK_PAGES, PAGE_KEYS} from '../page/page.constants';
import DailyNotesModal from '../project/description/DailyNotesModal';
import SampleModal from '../samples/SampleModal';
import {AddTagsToSpotsShortcutModal, FeatureTagsModal, TagsShortcutModal} from '../tags';

export const MODAL_KEYS = {
  // Get the notebook modal keys from the notebook constants
  NOTEBOOK: NOTEBOOK_PAGES.reduce((acc, p) => {
    const key = Object.keys(PAGE_KEYS).find(k => PAGE_KEYS[k] === p.key);
    return p.modal_component ? {...acc, [key]: p.key} : acc;
  }, {}),
  SHORTCUTS: {
    GEOLOGIC_UNITS: 'geologic_units',
    MEASUREMENT: 'measurement',
    SAMPLE: 'sample',
    NOTE: 'note',
    TAG: 'tag',
    SKETCH: 'sketch',
    PHOTO: 'photo',
  },
  OTHER: {
    ADD_TAGS_TO_SPOTS: 'AddTagsToSpots',
    FEATURE_TAGS: 'FeatureTags',
    GEOLOGIC_UNITS: 'geologic_unit',
    DAILY_NOTES: 'daily_setup',
    ADD_INTERVAL: 'add_interval',
  },
};

export const NOTEBOOK_MODELS = NOTEBOOK_PAGES.reduce((acc, p) => p.modal_component ? [...acc, p] : acc, []);

export const SHORTCUT_MODALS = [
  {
    key: MODAL_KEYS.SHORTCUTS.GEOLOGIC_UNITS,
    label: 'Geologic Units',
    action_label: 'Shortcut Mode: \nAdd Geologic Unit',
    icon_src: require('../../assets/icons/GeologicUnitButtonShortcut.png'),
    icon_pressed_src: require('../../assets/icons/GeologicUnitButtonShortcut_pressed.png'),
    modal_component: TagsShortcutModal,
    notebook_modal_key: MODAL_KEYS.NOTEBOOK.TAGS,
  }, {
    key: MODAL_KEYS.SHORTCUTS.TAG,
    label: 'Tag',
    action_label: 'Shortcut Mode: \nAdd Tags',
    icon_src: require('../../assets/icons/TagButtonShortcut.png'),
    icon_pressed_src: require('../../assets/icons/TagButtonShortcut_pressed.png'),
    modal_component: TagsShortcutModal,
    notebook_modal_key: MODAL_KEYS.NOTEBOOK.TAGS,
  }, {
    key: MODAL_KEYS.SHORTCUTS.MEASUREMENT,
    label: 'Measurement',
    action_label: 'Shortcut Mode: \nTake a Measurement',
    icon_src: require('../../assets/icons/MeasurementButtonShortcut.png'),
    icon_pressed_src: require('../../assets/icons/MeasurementButtonShortcut_pressed.png'),
    modal_component: AddMeasurementModal,
    notebook_modal_key: MODAL_KEYS.NOTEBOOK.MEASUREMENTS,
  }, {
    key: MODAL_KEYS.SHORTCUTS.SAMPLE,
    label: 'Sample',
    action_label: 'Shortcut Mode: \nAdd a Sample',
    icon_src: require('../../assets/icons/SampleButtonShortcut.png'),
    icon_pressed_src: require('../../assets/icons/SampleButtonShortcut_pressed.png'),
    modal_component: SampleModal,
    notebook_modal_key: MODAL_KEYS.NOTEBOOK.SAMPLES,
  }, {
    key: MODAL_KEYS.SHORTCUTS.NOTE,
    label: 'Note',
    action_label: 'Shortcut Mode: \nAdd a Note',
    icon_src: require('../../assets/icons/NoteButtonShortcut.png'),
    icon_pressed_src: require('../../assets/icons/NoteButtonShortcut_pressed.png'),
    modal_component: ShortcutNotesModal,
    notebook_modal_key: PAGE_KEYS.NOTES,
  }, {
    key: MODAL_KEYS.SHORTCUTS.PHOTO,
    label: 'Photo',
    action_label: 'Add a Photo',
    icon_src: require('../../assets/icons/PhotoButtonShortcut.png'),
    icon_pressed_src: require('../../assets/icons/PhotoButtonShortcut.png'),
  }, {
    key: MODAL_KEYS.SHORTCUTS.SKETCH,
    label: 'Sketch',
    actiion_label: 'Add a Sketch',
    icon_src: require('../../assets/icons/SketchButtonShortcut.png'),
    icon_pressed_src: require('../../assets/icons/SketchButtonShortcut.png'),
  },
];

const OTHER_MODALS = [
  {
    key: MODAL_KEYS.OTHER.ADD_TAGS_TO_SPOTS,
    label: 'Add Tags To Spots',
    modal_component: AddTagsToSpotsShortcutModal,
  }, {
    key: MODAL_KEYS.OTHER.FEATURE_TAGS,
    label: 'Add Feature Tags',
    modal_component: FeatureTagsModal,
  }, {
    key: MODAL_KEYS.OTHER.DAILY_NOTES,
    label: 'Daily Notes',
    modal_component: DailyNotesModal,
  }, {
    key: MODAL_KEYS.OTHER.ADD_INTERVAL,
    label: 'Add Interval',
    modal_component: AddIntervalModal,
  },
];

export const MODALS = [...NOTEBOOK_MODELS, ...SHORTCUT_MODALS, ...OTHER_MODALS];
