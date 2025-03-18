import React from 'react';

import * as turf from '@turf/turf';

import {FeatureHalosLayers, FeaturesNotSelectedLayers, FeaturesSelectedLayers} from './index';
import useMapSymbology from '../symbology/useMapSymbology';
import useMapFeatures from '../useMapFeatures';

const FeaturesLayers = ({spotsNotSelected, spotsSelected}) => {

  const {getSpotsAsFeatures} = useMapFeatures();
  const {addSymbology} = useMapSymbology();

  // Get selected and not selected Spots as features, split into multiple features if multiple orientations
  const featuresNotSelected = turf.featureCollection(getSpotsAsFeatures(addSymbology(spotsNotSelected)));
  const featuresSelected = turf.featureCollection(getSpotsAsFeatures(addSymbology(spotsSelected)));

  return (
    <>
      {/* Halos Around Point Features Layers */}
      <FeatureHalosLayers featuresNotSelected={featuresNotSelected} featuresSelected={featuresSelected}/>

      {/* Not Selected Features Layer */}
      <FeaturesNotSelectedLayers featuresNotSelected={featuresNotSelected}/>

      {/* Selected Features Layer */}
      <FeaturesSelectedLayers featuresSelected={featuresSelected}/>
    </>
  );
};

export default FeaturesLayers;
