// Measurement forms
import linearOrientationSurvey from './measurement/linear-orientation-survey';
import linearOrientationChoices from './measurement/linear-orientation-choices';
import planarOrientationSurvey from './measurement/planar-orientation-survey';
import planarOrientationChoices from './measurement/planar-orientation-choices';
import tabularZoneOrientationSurvey from './measurement/tabular-zone-orientation-survey';
import tabularZoneOrientationChoices from './measurement/tabular-zone-orienation-choices';

const forms = {
 'measurement': {
    'linear_orientation': {
      'survey': linearOrientationSurvey,
      'choices': linearOrientationChoices
    },
   'planar_orientation': {
     'survey': planarOrientationSurvey,
     'choices': planarOrientationChoices
   },
   'tabular_zone_orientation': {
     'survey': tabularZoneOrientationSurvey,
     'choices': tabularZoneOrientationChoices
   },
 }
};

export default forms;