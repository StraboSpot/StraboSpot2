import React, {useState} from 'react';

import MapboxGL from '@rnmapbox/maps';

import {FeatureHalosLayers, FeaturesNotSelectedLayers, FeaturesSelectedLayers} from './index';
import {STRAT_PATTERNS} from '../strat-section/stratSection.constants';
import {MAP_SYMBOLS} from '../symbology/mapSymbology.constants';
import useMapSymbology from '../symbology/useMapSymbology';
import useMapFeatures from '../useMapFeatures';

const FeaturesLayers = ({isStratStyleLoaded, spotsNotSelected, spotsSelected}) => {
  const [symbols, setSymbol] = useState({...MAP_SYMBOLS, ...STRAT_PATTERNS});

  const {getSpotsAsFeatures} = useMapFeatures();
  const {addSymbology} = useMapSymbology();

  // Get selected and not selected Spots as features, split into multiple features if multiple orientations
  console.log('Getting Spots Not Selected as Features...');
  const featuresNotSelected = getSpotsAsFeatures(addSymbology(spotsNotSelected));
  console.log('Getting Spots Selected as Features...');
  const featuresSelected = getSpotsAsFeatures(addSymbology(spotsSelected));

  return (
    <>
      {/* Halos Around Point Features Layers */}
      <FeatureHalosLayers featuresNotSelected={featuresNotSelected} featuresSelected={featuresSelected}/>

      <MapboxGL.Images
        images={symbols}
        onImageMissing={(imageKey) => {
          setSymbol({...symbols, [imageKey]: symbols.default_point});
        }}
      />

      {/* Not Selected Features Layer */}
      <FeaturesNotSelectedLayers featuresNotSelected={featuresNotSelected} isStratStyleLoaded={isStratStyleLoaded}/>

      {/* Selected Features Layer */}
      <FeaturesSelectedLayers featuresSelected={featuresSelected} isStratStyleLoaded={isStratStyleLoaded}/>
    </>
  );
};

export default FeaturesLayers;
