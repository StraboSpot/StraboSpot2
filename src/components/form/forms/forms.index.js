// Measurement forms
import linearOrientationSurvey from './measurement/linear-orientation-survey';
import linearOrientationChoices from './measurement/linear-orientation-choices';
import planarOrientationSurvey from './measurement/planar-orientation-survey';
import planarOrientationChoices from './measurement/planar-orientation-choices';
import tabularZoneOrientationSurvey from './measurement/tabular-zone-orientation-survey';
import tabularZoneOrientationChoices from './measurement/tabular-zone-orienation-choices';
import imagePropertiesSurvey from './images/image_properties-survey';
import imagePropertiesChoices from './images/image_properties-choices';

const getMeasurementSurveyForBulkInput = (form) => {
  const fieldsToExclude = ['label', 'strike', 'dip_direction', 'dip', 'quality', 'trend', 'plunge', 'rake', 'rake_calculated'];
  return form.filter(field => !fieldsToExclude.includes(field.name));
};

const forms = {
  'measurement': {
    'linear_orientation': {
      'survey': linearOrientationSurvey,
      'choices': linearOrientationChoices,
    },
    'planar_orientation': {
      'survey': planarOrientationSurvey,
      'choices': planarOrientationChoices,
    },
    'tabular_orientation': {
      'survey': tabularZoneOrientationSurvey,
      'choices': tabularZoneOrientationChoices,
    },
  },
  'measurement_bulk': {
    'linear_orientation': {
      'survey': getMeasurementSurveyForBulkInput(linearOrientationSurvey),
      'choices': linearOrientationChoices,
    },
    'planar_orientation': {
      'survey': getMeasurementSurveyForBulkInput(planarOrientationSurvey),
      'choices': planarOrientationChoices,
    },
    'tabular_orientation': {
      'survey': getMeasurementSurveyForBulkInput(tabularZoneOrientationSurvey),
      'choices': tabularZoneOrientationChoices,
    },
  },
  'images': {
    'survey': imagePropertiesSurvey,
    'choices': imagePropertiesChoices,
  },
};

export default forms;
