import {Alert} from 'react-native';

import {useSelector} from 'react-redux';

import useSpotsHook from '../../spots/useSpots';
import {SED_LABEL_DICTIONARY} from './stratSection.constants';

const useStratSectionCalculations = (props) => {
  const stratSection = useSelector(state => state.map.stratSection);

  const [useSpots] = useSpotsHook();

  const xInterval = 10;  // Horizontal spacing between grain sizes/weathering tick marks
  const yMultiplier = 20;  // 1 m interval thickness = 20 pixels

  // Calculate the geometry for an interval (single bed or interbedded)
  function calculateIntervalGeometry(stratSectionId, sedData) {
    const character = sedData.character;
    const interval = sedData.interval;
    const bedding = sedData.bedding;

    const intervalHeight = interval.interval_thickness * yMultiplier;
    const intervalWidth = getIntervalWidth(sedData, stratSectionId);
    const minX = 0;
    const minY = getSectionHeight();
    const maxX = minX + intervalWidth;
    const maxY = minY + intervalHeight;

    let geometry = {
      'type': 'Polygon',
      'coordinates': [[[minX, minY], [minX, maxY], [maxX, maxY], [maxX, minY], [minX, minY]]],
    };

    // If interbedded need to create a geometry collection with polygons for each bed
    if ((character === 'interbedded' || character === 'bed_mixed_lit') && bedding && bedding.beds
      && bedding.beds[1] && (bedding.beds[1].avg_thickness && bedding.beds[1].avg_thickness > 0
        || (bedding.beds[1].max_thickness && bedding.beds[1].max_thickness > 0 && bedding.beds[1].min_thickness
          && bedding.beds[1].min_thickness > 0)) && bedding.interbed_proportion > 0) {
      //const thickness1 = bedding.beds[0].avg_thickness ? bedding.beds[0].avg_thickness : (bedding.beds[0].max_thickness + bedding.beds[0].min_thickness) / 2;
      const thickness2 = bedding.beds[1].avg_thickness ? bedding.beds[1].avg_thickness : (bedding.beds[1].max_thickness + bedding.beds[1].min_thickness) / 2;

      // Per Casey: Don't use the data from Lithology 1 interbed thickness for plotting since it, along with interval
      // thickness, proportion and Lithology 2 interbed thickness are too many data numbers to plot all faithfully
      const y2 = thickness2 * yMultiplier < intervalHeight ? thickness2 * yMultiplier : intervalHeight;
      let interbedHeight2 = intervalHeight * (bedding.interbed_proportion / 100 || 0.5);  // secondary interbed
      interbedHeight2 = interbedHeight2 > y2 ? interbedHeight2 : y2;
      const interbedHeight1 = intervalHeight - interbedHeight2;                             // primary interbed

      const numInterbeds2 = interbedHeight2 / y2;
      const y1 = interbedHeight1 / numInterbeds2; // assume an equal number of beds for both lithologies so beds alternate

      const interbedIntervalWidth = getIntervalWidth(sedData, stratSectionId, true);
      let maxXBed = bedding.lithology_at_bottom_contact === 'lithology_2' ? interbedIntervalWidth : intervalWidth;
      let minYBed = JSON.parse(JSON.stringify(minY));
      let maxYBed = JSON.parse(JSON.stringify(minY));
      let currentBedHeight = bedding.lithology_at_bottom_contact === 'lithology_2' ? y2 : y1;
      const polyCoords = [];
      while (maxYBed < minY + intervalHeight) {
        maxYBed = minYBed + currentBedHeight <= minY + intervalHeight ? minYBed + currentBedHeight : minY + intervalHeight;
        const coords = [[minX, minYBed], [minX, maxYBed], [maxXBed, maxYBed], [maxXBed, minYBed], [minX, minYBed]];
        polyCoords.push(coords);
        currentBedHeight = currentBedHeight === y1 ? y2 : y1;
        maxXBed = maxXBed === intervalWidth ? interbedIntervalWidth : intervalWidth;
        minYBed = JSON.parse(JSON.stringify(maxYBed));
      }

      const geometries = [];
      polyCoords.forEach(polyCoord => {
        geometries.push({
          'type': 'Polygon',
          'coordinates': [polyCoord],
        });
      });

      geometry = {
        'type': 'GeometryCollection',
        'geometries': geometries,
      };
    }
    else if (character === 'interbedded' || character === 'bed_mixed_lit') {
      console.log('Not enough data to properly draw interval', sedData);
      Alert.alert(
        'Data Error!',
        'This interval is <b>interbedded</b> or <b>mixed</b> but there is not enough data to properly '
        + 'draw this interval. Check that you have entered all of the necessary bedding data for two lithologies. '
        + 'This includes the <b>Lithology 1: Interbed Relative Proportion (%)</b> and either the <b>Average '
        + 'Thickness</b> or both the <b>Maximum Thickness</b> and <b>Minimum Thickness</b> of the interbeds for '
        + 'both lithologies found on the <b>Bedding</b> page. ',
      );
    }
    return geometry;
  }

  function getIntervalWidth(sedData, stratSectionId, interbed) {
    const character = sedData.character;
    const lithologies = sedData.lithologies;
    const n = interbed ? 1 : 0;

    const defaultWidth = xInterval / 4;
    let i, intervalWidth = defaultWidth;
    // Unexposed/Covered
    if (character === 'unexposed_cove' || character === 'not_measured') intervalWidth = (0 + 1) * xInterval; // Same as clay
    else if (lithologies[n] && (character === 'bed' || character === 'bed_mixed_lit' || character === 'interbedded'
      || character === 'package_succe')) {
      // Weathering Column
      if (stratSection.column_profile === 'weathering_pro') {
        i = SED_LABEL_DICTIONARY.weathering.findIndex(weatheringOption => {
          return weatheringOption.name === lithologies[n].relative_resistance_weather;
        });
        intervalWidth = i === -1 ? defaultWidth : (i + 1) * xInterval;
      }
      // Basic Lithologies Column Profile
      else if (stratSection.column_profile === 'basic_lithologies') {
        if (lithologies[n].primary_lithology === 'organic_coal') i = 1;
        else if (lithologies[n].mud_silt_grain_size) i = 2;
        else if (lithologies[n].sand_grain_size) i = 3;
        else if (lithologies[n].congl_grain_size || lithologies[n].breccia_grain_size) i = 4;
        else if (lithologies[n].dunham_classification) i = 5;
        else i = 0;
        intervalWidth = i === -1 ? defaultWidth : (i + 2) * xInterval;
      }
      // Primary Lithology = siliciclastic
      else if (lithologies[n].primary_lithology === 'siliciclastic' && (lithologies[n].mud_silt_grain_size
        || lithologies[n].sand_grain_size || lithologies[n].congl_grain_size || lithologies[n].breccia_grain_size)) {
        i = SED_LABEL_DICTIONARY.clastic.findIndex(grainSizeOption => {
          return grainSizeOption.name === lithologies[n].mud_silt_grain_size
            || grainSizeOption.name === lithologies[n].sand_grain_size
            || grainSizeOption.name === lithologies[n].congl_grain_size
            || grainSizeOption.name === lithologies[n].breccia_grain_size;
        });
        intervalWidth = i === -1 ? defaultWidth : (i + 1) * xInterval;
      }
      // Primary Lithology = limestone or dolostone
      else if ((lithologies[n].primary_lithology === 'limestone' || lithologies[n].primary_lithology === 'dolostone')
        && lithologies[n].dunham_classification) {
        i = SED_LABEL_DICTIONARY.carbonate.findIndex(grainSizeOption => {
          return grainSizeOption.name === lithologies[n].dunham_classification;
        });
        intervalWidth = i === -1 ? defaultWidth : (i + 2.33) * xInterval;
      }
      // Other Lithologies
      else {
        i = SED_LABEL_DICTIONARY.lithologies.findIndex(grainSizeOption => {
          return grainSizeOption.name === lithologies[n].primary_lithology;
        });
        i = i - 3; // First 3 indexes are siliciclastic, limestone & dolostone which are handled above
        intervalWidth = i === -1 ? defaultWidth : (i + 2.66) * xInterval;
      }
    }
    else console.error('Sed data error:', lithologies[n]);
    return intervalWidth;
  }

  // Get the height (y) of the whole section
  function getSectionHeight() {
    const intervals = useSpots.getIntervalSpotsThisStratSection(stratSection.strat_section_id);
    return intervals.reduce((acc, i) => {
      const coords = i.geometry.coordinates || i.geometry.geometries.map(g => g.coordinates).flat();
      const ys = coords.flat().map(c => c[1]);
      const maxY = Math.max(...ys);
      return Math.max(acc, maxY);
    }, 0);
  }

  return {
    calculateIntervalGeometry: calculateIntervalGeometry,
  };
};

export default useStratSectionCalculations;
