import DataOverview from '../external-data/DataOverview';
import ExternalData from '../external-data/ExternalData';
import AddFabricModal from '../fabrics/AddFabricModal';
import FabricsOverview from '../fabrics/FabricsOverview';
import FabricsPage from '../fabrics/FabricsPage';
import Geography from '../geography/Geography';
import ImagesOverview from '../images/ImagesOverview';
import ImagesViewPage from '../images/ImagesViewPage';
import AddMeasurementModal from '../measurements/AddMeasurementModal';
import MeasurementsOverview from '../measurements/MeasurementsOverview';
import MeasurementsPage from '../measurements/MeasurementsPage';
import Metadata from '../metadata/Metadata';
import Nesting from '../nesting/Nesting';
import NotesPage from '../notes/Notes';
import NotesOverview from '../notes/NotesOverview';
import OtherFeaturesOverview from '../other-features/OtherFeaturesOverview';
import OtherFeaturesPage from '../other-features/OtherFeaturesPage';
import AddMineralModal from '../petrology/AddMineralModal';
import AddReactionTextureModal from '../petrology/AddReactionTextureModal';
import AddRockModal from '../petrology/AddRockModal';
import MineralsPage from '../petrology/MineralsPage';
import ReactionTexturesPage from '../petrology/ReactionTexturesPage';
import RockAlterationOrePage from '../petrology/RockAlterationOrePage';
import RockFaultPage from '../petrology/RockFaultPage';
import RockIgneousPage from '../petrology/RockIgneousPage';
import RockMetamorphicPage from '../petrology/RockMetamorphicPage';
import RockSedimentaryPage from '../petrology/RockSedimentaryPage';
import TernaryPage from '../petrology/TernaryPage';
import SampleModal from '../samples/SampleModal';
import SamplesOverview from '../samples/SamplesOverview';
import SamplesPage from '../samples/SamplesPage';
import BasicSedPage from '../sed/BasicSedPage';
import BeddingPage from '../sed/BeddingPage';
import IntervalOverview from '../sed/IntervalOverview';
import IntervalPage from '../sed/IntervalPage';
import StratSectionPage from '../sed/StratSectionPage';
import {TagsAtSpotList, TagsNotebookModal} from '../tags';
import TagsNotebook from '../tags/TagsNotebook';
import AddThreeDStructureModal from '../three-d-structures/AddThreeDStructureModal';
import ThreeDStructuresOverview from '../three-d-structures/ThreeDStructuresOverview';
import ThreeDStructuresPage from '../three-d-structures/ThreeDStructuresPage';
import BasicOverviewList from './BasicOverviewList';
import Overview from './Overview';

export const PAGE_KEYS = {
  BEDDING: 'bedding',
  DATA: 'data',
  DIAGENESIS: 'diagenesis',
  FABRICS: 'fabrics',
  FOSSILS: 'fossils',
  GEOGRAPHY: 'geography',
  GEOLOGIC_UNITS: 'geologic_unit',
  IMAGES: 'images',
  INTERPRETATIONS: 'interpretations',
  INTERVAL: 'interval',
  LITHOLOGIES: 'lithologies',
  MEASUREMENTS: 'orientation_data',
  METADATA: 'metadata',
  MINERALS: 'minerals',
  NESTING: 'nesting',
  NOTES: 'notes',
  OTHER_FEATURES: 'other_features',
  OVERVIEW: 'overview',
  REACTIONS: 'reactions',
  ROCK_TYPE_ALTERATION_ORE: 'alteration_or',
  ROCK_TYPE_FAULT: 'fault',
  ROCK_TYPE_IGNEOUS: 'igneous',
  ROCK_TYPE_METAMORPHIC: 'metamorphic',
  ROCK_TYPE_SEDIMENTARY: 'sedimentary',
  SAMPLES: 'samples',
  STRAT_SECTION: 'strat_section',
  STRUCTURES: 'structures',
  TAGS: 'tags',
  TERNARY: 'ternary',
  THREE_D_STRUCTURES: '_3d_structures',
};

export const OVERVIEW_PAGE = {
  key: PAGE_KEYS.OVERVIEW,
  label: 'Overview',
  page_component: Overview,
};

export const PRIMARY_PAGES = [
  {
    key: PAGE_KEYS.GEOLOGIC_UNITS,
    label: 'Geologic Units',
    icon_src: require('../../assets/icons/GeologicUnit.png'),
    icon_pressed_src: require('../../assets/icons/GeologicUnit_pressed.png'),
    overview_component: TagsAtSpotList,
    page_component: TagsNotebook,
    modal_component: TagsNotebookModal,
    action_label: 'Add Geologic Units',
  }, {
    key: PAGE_KEYS.NOTES,
    label: 'Notes',
    icon_src: require('../../assets/icons/Note.png'),
    icon_pressed_src: require('../../assets/icons/Note_pressed.png'),
    overview_component: NotesOverview,
    page_component: NotesPage,
  }, {
    key: PAGE_KEYS.MEASUREMENTS,
    label: 'Measurements',
    icon_src: require('../../assets/icons/Measurement.png'),
    icon_pressed_src: require('../../assets/icons/Measurement_pressed.png'),
    overview_component: MeasurementsOverview,
    page_component: MeasurementsPage,
    modal_component: AddMeasurementModal,
    action_label: 'Take a Measurement',
  }, {
    key: PAGE_KEYS.IMAGES,
    label: 'Photos & Sketches',
    label_singular: 'Photo/Sketch',
    icon_src: require('../../assets/icons/Photo.png'),
    icon_pressed_src: require('../../assets/icons/Photo_pressed.png'),
    overview_component: ImagesOverview,
    page_component: ImagesViewPage,
  }, {
    key: PAGE_KEYS.TAGS,
    label: 'Tags',
    icon_src: require('../../assets/icons/Tag.png'),
    icon_pressed_src: require('../../assets/icons/Tag_pressed.png'),
    overview_component: TagsAtSpotList,
    page_component: TagsNotebook,
    modal_component: TagsNotebookModal,
    action_label: 'Add Spot Tags',
  }, {
    key: PAGE_KEYS.SAMPLES,
    label: 'Samples',
    icon_src: require('../../assets/icons/Sample.png'),
    icon_pressed_src: require('../../assets/icons/Sample_pressed.png'),
    overview_component: SamplesOverview,
    page_component: SamplesPage,
    modal_component: SampleModal,
    action_label: 'Add a Sample',
  },
];

export const SECONDARY_PAGES = [
  {
    key: PAGE_KEYS.THREE_D_STRUCTURES,
    label: '3D Structures',
    label_singular: '3D Structure',
    icon_src: require('../../assets/icons/3DStructure.png'),
    icon_pressed_src: require('../../assets/icons/3DStructure_pressed.png'),
    overview_component: ThreeDStructuresOverview,
    page_component: ThreeDStructuresPage,
    modal_component: AddThreeDStructureModal,
    action_label: 'Add a 3D Structure',
  }, {
    key: PAGE_KEYS.FABRICS,
    label: 'Fabrics',
    icon_src: require('../../assets/icons/Fabric.png'),
    icon_pressed_src: require('../../assets/icons/Fabric_pressed.png'),
    overview_component: FabricsOverview,
    page_component: FabricsPage,
    modal_component: AddFabricModal,
    action_label: 'Add a Fabric',
    testing: true,
  }, {
    key: PAGE_KEYS.OTHER_FEATURES,
    label: 'Other Features',
    icon_src: require('../../assets/icons/OtherFeatures.png'),
    icon_pressed_src: require('../../assets/icons/OtherFeatures_pressed.png'),
    overview_component: OtherFeaturesOverview,
    page_component: OtherFeaturesPage,
  }, {
    key: PAGE_KEYS.DATA,
    label: 'Data',
    label_singular: 'Data',
    icon_src: require('../../assets/icons/Data.png'),
    icon_pressed_src: require('../../assets/icons/Data_pressed.png'),
    page_component: ExternalData,
    overview_component: DataOverview,
  },
];

export const SUBPAGES = [
  {
    key: PAGE_KEYS.GEOGRAPHY,
    label: 'Geography',
    page_component: Geography,
  }, {
    key: PAGE_KEYS.NESTING,
    label: 'Nesting',
    page_component: Nesting,
  }, {
    key: PAGE_KEYS.METADATA,
    label: 'Metadata',
    page_component: Metadata,
  },
];

export const PET_PAGES = [
  {
    key: PAGE_KEYS.ROCK_TYPE_ALTERATION_ORE,
    label: 'Alteration, Ore Rocks',
    icon_src: require('../../assets/icons/Economic.png'),
    icon_pressed_src: require('../../assets/icons/Economic_pressed.png'),
    overview_component: BasicOverviewList,
    page_component: RockAlterationOrePage,
    modal_component: AddRockModal,
    action_label: 'Add an Alteration, Ore Rock',
  }, {
    key: PAGE_KEYS.ROCK_TYPE_FAULT,
    label: 'Fault & Shear Zone Rocks',
    icon_src: require('../../assets/icons/FaultRock.png'),
    icon_pressed_src: require('../../assets/icons/FaultRock_pressed.png'),
    overview_component: BasicOverviewList,
    page_component: RockFaultPage,
    modal_component: AddRockModal,
    action_label: 'Add a Fault or Shear Zone Rock',
  }, {
    key: PAGE_KEYS.ROCK_TYPE_IGNEOUS,
    label: 'Igneous Rocks',
    icon_src: require('../../assets/icons/Igneous.png'),
    icon_pressed_src: require('../../assets/icons/Igneous_pressed.png'),
    overview_component: BasicOverviewList,
    page_component: RockIgneousPage,
    modal_component: AddRockModal,
    action_label: 'Add an Igneous Rock',
  }, {
    key: PAGE_KEYS.ROCK_TYPE_METAMORPHIC,
    label: 'Metamorphic Rocks',
    icon_src: require('../../assets/icons/Metamorphic.png'),
    icon_pressed_src: require('../../assets/icons/Metamorphic_pressed.png'),
    overview_component: BasicOverviewList,
    page_component: RockMetamorphicPage,
    modal_component: AddRockModal,
    action_label: 'Add a Metamorphic Rock',
  }, {
    key: PAGE_KEYS.MINERALS,
    label: 'Minerals',
    icon_src: require('../../assets/icons/Minerals.png'),
    icon_pressed_src: require('../../assets/icons/Minerals_pressed.png'),
    overview_component: BasicOverviewList,
    page_component: MineralsPage,
    modal_component: AddMineralModal,
    action_label: 'Add Mineral Data',
  }, {
    key: PAGE_KEYS.REACTIONS,
    label: 'Reaction Textures',
    icon_src: require('../../assets/icons/Reactions.png'),
    icon_pressed_src: require('../../assets/icons/Reactions_pressed.png'),
    overview_component: BasicOverviewList,
    page_component: ReactionTexturesPage,
    modal_component: AddReactionTextureModal,
    action_label: 'Add a Reaction Texture',
    testing: true,
  }, {
    key: PAGE_KEYS.TERNARY,
    label: 'Ternary',
    label_singular: 'Ternary',
    icon_src: require('../../assets/icons/Ternary.png'),
    icon_pressed_src: require('../../assets/icons/Ternary_pressed.png'),
    page_component: TernaryPage,
    testing: true,
  },
];

export const SED_PAGES = [
  {
    key: PAGE_KEYS.ROCK_TYPE_SEDIMENTARY,
    label: 'Sedimentary Rocks',
    icon_src: require('../../assets/icons/Sedimentary.png'),
    icon_pressed_src: require('../../assets/icons/Sedimentary_pressed.png'),
    overview_component: BasicOverviewList,
    page_component: RockSedimentaryPage,
    modal_component: AddRockModal,
    action_label: 'Add a Sedimentary Rock',
  }, {
    key: PAGE_KEYS.STRAT_SECTION,
    label: 'Strat Section',
    label_singular: 'Strat Section',
    icon_src: require('../../assets/icons/SedStratColumn.png'),
    icon_pressed_src: require('../../assets/icons/SedStratColumn_pressed.png'),
    overview_component: BasicOverviewList,
    page_component: StratSectionPage,
  }, {
    key: PAGE_KEYS.INTERVAL,
    label: 'Interval',
    label_singular: 'Interval',
    icon_src: require('../../assets/icons/SedInterval.png'),
    icon_pressed_src: require('../../assets/icons/SedInterval_pressed.png'),
    overview_component: IntervalOverview,
    page_component: IntervalPage,
  }, {
    key: PAGE_KEYS.LITHOLOGIES,
    label: 'Lithologies',
    label_singular: 'Lithology',
    icon_src: require('../../assets/icons/SedLithologies.png'),
    icon_pressed_src: require('../../assets/icons/SedLithologies_pressed.png'),
    overview_component: BasicOverviewList,
    page_component: BasicSedPage,
  }, {
    key: PAGE_KEYS.BEDDING,
    label: 'Bedding',
    label_singular: 'Bedding',
    icon_src: require('../../assets/icons/SedBedding.png'),
    icon_pressed_src: require('../../assets/icons/SedBedding_pressed.png'),
    page_component: BeddingPage,
    overview_component: BasicOverviewList,
  }, {
    key: PAGE_KEYS.STRUCTURES,
    label: 'Structures',
    label_singular: 'Structure',
    icon_src: require('../../assets/icons/SedStructure.png'),
    icon_pressed_src: require('../../assets/icons/SedStructure_pressed.png'),
    overview_component: BasicOverviewList,
    page_component: BasicSedPage,
  }, {
    key: PAGE_KEYS.DIAGENESIS,
    label: 'Diagenesis',
    label_singular: 'Diagenesis',
    icon_src: require('../../assets/icons/SedDiagenesis.png'),
    icon_pressed_src: require('../../assets/icons/SedDiagenesis_pressed.png'),
    overview_component: BasicOverviewList,
    page_component: BasicSedPage,
  }, {
    key: PAGE_KEYS.FOSSILS,
    label: 'Fossils',
    label_singular: 'Fossil',
    icon_src: require('../../assets/icons/SedFossil.png'),
    icon_pressed_src: require('../../assets/icons/SedFossil_pressed.png'),
    overview_component: BasicOverviewList,
    page_component: BasicSedPage,
  }, {
    key: PAGE_KEYS.INTERPRETATIONS,
    label: 'Interpretations',
    label_singular: 'Interpretation',
    icon_src: require('../../assets/icons/SedInterpretation.png'),
    icon_pressed_src: require('../../assets/icons/SedInterpretation_pressed.png'),
    overview_component: BasicOverviewList,
    page_component: BasicSedPage,
  },
];

export const NOTEBOOK_PAGES = [OVERVIEW_PAGE, ...PRIMARY_PAGES, ...SECONDARY_PAGES, ...SUBPAGES, ...PET_PAGES, ...SED_PAGES];
