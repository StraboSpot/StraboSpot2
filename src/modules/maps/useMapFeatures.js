import {Alert} from 'react-native';

import Clipboard from '@react-native-community/clipboard';
import * as turf from '@turf/turf';
import moment from 'moment';

import useSpotsHook from '../spots/useSpots';

const useMapFeatures = (props) => {

  const [useSpots] = useSpotsHook();

  // Get Spots within (points) or intersecting (line or polygon) the drawn polygon
  const getLassoedSpots = (features, drawnPolygon) => {
    let selectedSpots;
    try {
      const selectedFeaturesIds = [];
      features.forEach(feature => {
        if (turf.booleanWithin(feature, drawnPolygon)
          || (feature.geometry.type === 'LineString' && turf.lineIntersect(feature, drawnPolygon).features.length > 0)
          || (feature.geometry.type === 'Polygon' && turf.booleanOverlap(feature, drawnPolygon))) {
          selectedFeaturesIds.push(feature.properties.id);
        }
      });
      const selectedSpotsIds = [...new Set(selectedFeaturesIds)]; // Remove duplicate ids
      selectedSpots = useSpots.getSpotsByIds(selectedSpotsIds);
    }
    catch (e) {
      console.log('Error getting Spots within or intersecting the drawn polygon', e);
    }
    //console.log('Spots in given polygon:', selectedSpots);
    return selectedSpots;
  };

  const getStereonet = async (spots) => {
    let hasData = false;

    //build data here
    const headers = [
      'No.',
      'Type',
      'Structure',
      'Color',
      'Trd/Strk',
      'Plg/Dip',
      'Longitude',
      'Latitude',
      'Horiz ± m',
      'Elevation',
      'Elev ± m',
      'Time',
      'Day',
      'Month',
      'Year',
      'Notes',
    ];

    let planes = [];
    let lines = [];
    let row = [];
    let out = [];

    spots.forEach(spot => {

      let longitude = 999;
      let latitude = 99;
      let trendStrike = '';
      let plungeDip = '';
      let notes = '';
      let spotOrientations = [];
      const d = getTimeAndDateFromModifiedTimestamp(spot.properties.modified_timestamp);

      if (spot.geometry.type === 'Point') {
        longitude = spot.geometry.coordinates[0];
        latitude = spot.geometry.coordinates[1];
      }


      // Gather individual orientation data measurements.
      if (spot.properties.orientation_data) {
        spot.properties.orientation_data.forEach(od => {
          spotOrientations.push(od);
          if (od.associated_orientation) od.associated_orientation.forEach(ao => spotOrientations.push(ao));
        });
      }

      spotOrientations.forEach(od => {
        console.log('Spot Orientation', od);
        console.log(d.time, '\n', d.day, '\n', d.month, '\n', d.year);
        if (od.type === 'planar_orientation' || od.type === 'tabular_orientation') {
          if (od.strike && od.dip) {
            trendStrike = od.strike;
            plungeDip = od.dip;
            if (od.notes) notes = od.notes;
            row = [
              '',
              'P',
              'Strabo Planes',
              '000000000',
              trendStrike,
              plungeDip,
              longitude,
              latitude,
              '',
              '0',
              '',
              d.time,
              d.day,
              d.month,
              d.year,
              notes,
            ];
            planes.push(row);
          }
        }
        else if (od.type === 'linear_orientation') {
          if (od.trend && od.plunge) {
            trendStrike = od.trend;
            plungeDip = od.plunge;
            if (od.notes) notes = od.notes;
            row = [
              '',
              'L',
              'Strabo Lines',
              '000000000',
              trendStrike,
              plungeDip,
              longitude,
              latitude,
              '',
              '0',
              '',
              d.time,
              d.day,
              d.month,
              d.year,
              notes,
            ];
            lines.push(row);
          }
        }
      });
    });

    if (lines.length > 0 || planes.length > 0) {
      let recordNum = 1;
      out.push(headers.join('\t'));
      if (planes.length > 0) {
        planes.forEach(plane => {
          plane[0] = recordNum;
          out.push(plane.join('\t'));
          recordNum++;
        });
      }
      if (lines.length > 0) {
        lines.forEach(line => {
          line[0] = recordNum;
          out.push(line.join('\t'));
          recordNum++;
        });
      }
      out = out.join('\n');
      out = out + '\n';
      hasData = true;
    }

    if (hasData) {
      await Clipboard.setString(out);
      Alert.alert(
        'Success!',
        'Data has been copied to clipboard.',
      );
    }
    else {
      Alert.alert(
        'Error!',
        'Your selected spots contained no valid stereonet data.',
      );
    }
  };

  const getTimeAndDateFromModifiedTimestamp = (field) => {
    return {
      time: moment(field).format('HH:mm:ss'),
      day: moment(field).format('D'),
      month: moment(field).format('MM'),
      year: moment(field).format('YYYY'),
    };
  };

  return [{
    getLassoedSpots: getLassoedSpots,
    getStereonet: getStereonet,
  }];
};

export default useMapFeatures;
