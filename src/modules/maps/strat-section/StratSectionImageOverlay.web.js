import React from 'react';

import {Layer, Source} from 'react-map-gl';

const StratSectionImageOverlay = ({coordQuad, id, imageOpacity, url}) => {
  console.log('Rendering StratSectionImageOverlay...');

  return (
    <Source
      id={'imageOverlay' + id}
      type={'image'}
      coordinates={coordQuad}
      url={url}
    >
      <Layer
        // beforeId={'pointLayerColoHalo'}
        type={'raster'}
        id={'imageOverlayLayer' + id}
        paint={{
          'raster-opacity': imageOpacity && parseFloat(imageOpacity.toString())
          && parseFloat(imageOpacity.toString()) >= 0 && parseFloat(imageOpacity.toString()) <= 1
            ? parseFloat(imageOpacity.toString()) : 1,
        }}
        slot={'top'}
      />
    </Source>
  );
};

export default StratSectionImageOverlay;
