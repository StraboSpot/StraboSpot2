// General Forms
import imagePropertiesSurvey from './images/image-properties-survey';
import imagePropertiesChoices from './images/image-properties-choices';
import projectDescriptionSurvey from './project/project-description-survey';
import traceSurvey from './trace/trace-survey';
import traceChoices from './trace/trace-choices';
import surfaceFeatureSurvey from './surface-feature/surface-feature-survey.json';
import surfaceFeatureChoices from './surface-feature/surface-feature-choices.json';

// Measurement forms
import linearOrientationSurvey from './measurement/linear-orientation-survey';
import linearOrientationChoices from './measurement/linear-orientation-choices';
import planarOrientationSurvey from './measurement/planar-orientation-survey';
import planarOrientationChoices from './measurement/planar-orientation-choices';
import tabularZoneOrientationSurvey from './measurement/tabular-zone-orientation-survey';
import tabularZoneOrientationChoices from './measurement/tabular-zone-orienation-choices';

const getMeasurementSurveyForBulkInput = (form) => {
  const fieldsToExclude = ['label', 'strike', 'dip_direction', 'dip', 'quality', 'trend', 'plunge', 'rake', 'rake_calculated'];
  return form.filter(field => !fieldsToExclude.includes(field.name));
};

const forms = {
  general: {
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
};

export default forms;
