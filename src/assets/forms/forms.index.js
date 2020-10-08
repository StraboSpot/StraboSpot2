import geographySurvey from './geography/geography-survey.json';
import imagePropertiesChoices from './images/image-properties-choices.json';
import imagePropertiesSurvey from './images/image-properties-survey.json';
import linearOrientationChoices from './measurement/linear-orientation-choices';
import linearOrientationSurvey from './measurement/linear-orientation-survey';
import planarOrientationChoices from './measurement/planar-orientation-choices';
import planarOrientationSurvey from './measurement/planar-orientation-survey';
import tabularZoneOrientationChoices from './measurement/tabular-zone-orienation-choices';
import tabularZoneOrientationSurvey from './measurement/tabular-zone-orientation-survey';
import namingConventionsSurvey from './preferences/naming-conventions-survey.json';
import projectDescriptionSurvey from './project/project-description-survey.json';
import sampleChoices from './sample/sample-choices.json';
import sampleSurvey from './sample/sample-survey.json';
import surfaceFeatureChoices from './surface-feature/surface-feature-choices.json';
import surfaceFeatureSurvey from './surface-feature/surface-feature-survey.json';
import tagsChoices from './tags/tags-choices.json';
import tagsSurvey from './tags/tags-survey.json';
import traceChoices from './trace/trace-choices.json';
import traceSurvey from './trace/trace-survey.json';

const getMeasurementSurveyForBulkInput = (form) => {
  const fieldsToExclude = ['label', 'strike', 'dip_direction', 'dip', 'quality', 'trend', 'plunge', 'rake', 'rake_calculated'];
  return form.filter(field => !fieldsToExclude.includes(field.name));
};

const forms = {
  general: {
    geography: {
      survey: geographySurvey,
    },
    images: {
      survey: imagePropertiesSurvey,
      choices: imagePropertiesChoices,
    },
    project_description: {
      survey: projectDescriptionSurvey,
    },
    trace: {
      survey: traceSurvey,
      choices: traceChoices,
    },
    sample: {
      survey: sampleSurvey,
      choices: sampleChoices,
    },
    surface_feature: {
      survey: surfaceFeatureSurvey,
      choices: surfaceFeatureChoices,
    },
  },
  measurement: {
    linear_orientation: {
      survey: linearOrientationSurvey,
      choices: linearOrientationChoices,
    },
    planar_orientation: {
      survey: planarOrientationSurvey,
      choices: planarOrientationChoices,
    },
    tabular_orientation: {
      survey: tabularZoneOrientationSurvey,
      choices: tabularZoneOrientationChoices,
    },
  },
  measurement_bulk: {
    linear_orientation: {
      survey: getMeasurementSurveyForBulkInput(linearOrientationSurvey),
      choices: linearOrientationChoices,
    },
    planar_orientation: {
      survey: getMeasurementSurveyForBulkInput(planarOrientationSurvey),
      choices: planarOrientationChoices,
    },
    tabular_orientation: {
      survey: getMeasurementSurveyForBulkInput(tabularZoneOrientationSurvey),
      choices: tabularZoneOrientationChoices,
    },
  },
  preferences: {
    naming_conventions: {
      survey: namingConventionsSurvey,
    },
  },
  project: {
    tags: {
      survey: tagsSurvey,
      choices: tagsChoices,
    },
  },
};

export default forms;
