import React, {useEffect, useState} from 'react';
import {FlatList, Text, View} from 'react-native';

import {Icon} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import * as SharedUI from '../../shared/ui';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import SectionDivider from '../../shared/ui/SectionDivider';
import imageStyles from '../images/images.styles';
import useImagesHook from '../images/useImages';
import {PAGE_KEYS} from '../page/page.constants';
import ReturnToOverviewButton from '../page/ui/ReturnToOverviewButton';
import {SpotsListItem} from '../spots';
import {setSelectedSpot} from '../spots/spots.slice';
import useNestingHook from './useNesting';

const Nesting = () => {
  const dispatch = useDispatch();

  const [useNesting] = useNestingHook();
  const [useImages] = useImagesHook();

  const notebookPageVisible = useSelector(state => (
    !isEmpty(state.notebook.visibleNotebookPagesStack) && state.notebook.visibleNotebookPagesStack.slice(-1)[0]
  ));
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const spots = useSelector((state) => state.spot.spots);
  const [parentGenerations, setParentGenerations] = useState();
  const [childrenGenerations, setChildrenGenerations] = useState();

  useEffect(() => {
    console.log('UE Nesting [spots]');
    if (notebookPageVisible === PAGE_KEYS.NESTING) updateNest();
  }, [spots, selectedSpot]);

  const goToSpotNesting = (spot) => {
    dispatch(setSelectedSpot(spot));
  };

  const renderItem = (spot) => {
    if (spot && spot.properties) {
      if (spot.properties.image_basemap) {
        return (
          <View style={{flex: 1, flexDirection: 'row'}}>
            <View style={{alignSelf: 'center'}}>
              {renderImageBasemapThumbnail(spot.properties.image_basemap)}
            </View>
            <View style={{flex: 1, alignSelf: 'center'}}>
              {renderName(spot)}
            </View>
          </View>
        );
      }
      else return renderName(spot);
    }
  };

  const renderName = (spot) => {
    return (
      <SpotsListItem
        doShowSubspots={true}
        spot={spot}
        onPress={() => goToSpotNesting(spot)}
      />
    );
  };

  const renderImageBasemapThumbnail = (imageId) => {
    return (
      <View style={imageStyles.thumbnailContainer}>
        <SharedUI.ImageButton
          source={{uri: useImages.getLocalImageURI(imageId)}}
          style={imageStyles.thumbnail}
        />
      </View>
    );
  };

  const renderGeneration = (type, generation, i, length) => {
    const levelNum = type === 'Parents' ? length - i : i + 1;
    const generationText = levelNum + (levelNum === 1 ? ' Level' : ' Levels') + (type === 'Parents' ? ' Up' : ' Down');
    const groupedGeneration = generation.reduce(
      (r, v, i, a, k = v.properties.image_basemap) => ((r[k] || (r[k] = [])).push(v), r), {});
    console.log('groupedGeneration', groupedGeneration);
    return (
      <View>
        {type === 'Children' && (
          <Icon type={'material-icons'} name={'south'} containerStyle={{paddingLeft: 8, alignItems: 'flex-start'}}/>
        )}
        <Text style={{paddingLeft: 10}}>{generationText}</Text>
        {Object.entries(groupedGeneration).map(([key, value], b) => {
          if (key !== 'undefined') {
            return (
              <View style={{
                flex: 1,
                flexDirection: 'row',
                borderWidth: 1,
                borderColor: 'black',
                marginLeft: 10,
                marginRight: 10,
                marginTop: 2,
                marginBottom: 2,
              }}>
                <View style={{alignSelf: 'center'}}>
                  {renderImageBasemapThumbnail(key)}
                </View>
                <View style={{flex: 1}}>
                  {renderGroup(type, i, value, b)}
                </View>
              </View>
            );
          }
          else return renderGroup(type, i, value, b);
        })}
        {type === 'Parents' && (
          <Icon type={'material-icons'} name={'north'} containerStyle={{paddingLeft: 8, alignItems: 'flex-start'}}/>
        )}
      </View>
    );
  };

  const renderGenerations = (type) => {
    const generationData = type === 'Parents' ? parentGenerations : childrenGenerations;
    if (!isEmpty(generationData)) {
      return (
        <View>
          <FlatList
            listKey={type}
            keyExtractor={(item) => item.toString()}
            data={type === 'Parents' ? generationData.reverse() : generationData}
            renderItem={({item, index}) => renderGeneration(type, item, index, generationData.length)}
          />
        </View>
      );
    }
  };

  const renderGroup = (type, i, group, b) => {
    return (
      <FlatList
        listKey={type + i + b}
        keyExtractor={(item) => item.toString()}
        data={group}
        renderItem={({item}) => renderName(item)}
        ItemSeparatorComponent={FlatListItemSeparator}
      />
    );
  };

  const renderSelf = self => {
    return (
      <View style={{borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'black'}}>
        {renderItem(self)}
      </View>
    );
  };

  const updateNest = () => {
    if (!isEmpty(selectedSpot)) {
      console.log('Updating Nest for Selected Spot ...');
      console.log('Selected Spot:', selectedSpot);
      setParentGenerations(useNesting.getParentGenerationsSpots(selectedSpot, 10));
      setChildrenGenerations(useNesting.getChildrenGenerationsSpots(selectedSpot, 10));
    }
  };

  return (
    <View style={{flex: 1}}>
      <ReturnToOverviewButton/>
      <SectionDivider dividerText='Nesting'/>
      <FlatList
        ListHeaderComponent={renderGenerations('Parents')}
        ListFooterComponent={renderGenerations('Children')}
        keyExtractor={(item) => item.toString()}
        data={[selectedSpot]}
        renderItem={({item}) => renderSelf(item)}
      />
    </View>
  );
};

export default Nesting;
