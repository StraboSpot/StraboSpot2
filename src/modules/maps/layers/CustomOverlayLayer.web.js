import React from 'react';

import {Layer, Source} from 'react-map-gl';

import useMapURL from '../useMapURL';

const CustomMapLayer = ({basemap, customMap}) => {

  const {buildTileURL} = useMapURL();

  return (
    <Source
      key={customMap.id}
      id={customMap.id}
      type={'raster'}
      tiles={[buildTileURL(customMap)]}
    >
      <Layer
        // beforeId={'pointLayerSelectedHalo'}
        type={'raster'}
        id={customMap.id + 'Layer'}
        paint={{
          'raster-opacity': customMap.opacity && parseFloat(customMap.opacity.toString())
          && parseFloat(customMap.opacity.toString()) >= 0 && parseFloat(customMap.opacity.toString()) <= 1
            ? parseFloat(customMap.opacity.toString()) : 1,
        }}
      />
    </Source>
  );
};

export default CustomMapLayer;
