import React, {useEffect, useState} from 'react';
import {FlatList, Text, View} from 'react-native';

import {Avatar, Icon, ListItem} from 'react-native-elements';
import {useSelector, useDispatch} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import SectionDivider from '../../shared/ui/SectionDivider';
import {NotebookPages} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import {useSpotsHook} from '../spots';
import {spotReducers} from '../spots/spot.constants';
import {setSelectedSpot} from '../spots/spots.slice';
import {useTagsHook} from '../tags';
import useNestingHook from './useNesting';

const Nesting = (props) => {
  const dispatch = useDispatch();
  const [useNesting] = useNestingHook();
  const [useSpots] = useSpotsHook();
  const [useTags] = useTagsHook();

  const notebookPageVisible = useSelector(state => (
    !isEmpty(state.notebook.visibleNotebookPagesStack) && state.notebook.visibleNotebookPagesStack.slice(-1)[0]
  ));
  const selectedSpot = useSelector(state => state.spot.selectedSpot);
  const spots = useSelector((state) => state.spot.spots);
  const [parentGenerations, setParentGenerations] = useState();
  const [childrenGenerations, setChildrenGenerations] = useState();

  useEffect(() => {
    console.log('UE NESTING [spots]');

    if (notebookPageVisible === NotebookPages.NESTING) updateNest();
  }, [spots, selectedSpot]);

  const goToSpotNesting = (spot) => {
    // dispatch({type: spotReducers.SET_SELECTED_SPOT, spot: spot});
    dispatch(setSelectedSpot(spot));
  };

  const renderDataIcons = (item) => {
    const keysFound = useSpots.getSpotDataKeys(item);
    if (!isEmpty(useTags.getTagsAtSpot(item.properties.id))) keysFound.push('tags');

    return (
      <React.Fragment>
        {keysFound.map(key => {
          return (
            <Avatar
              source={useSpots.getSpotDataIconSource(key)}
              size={20}
              key={key}
              title={key}  // used as placeholder while loading image
            />
          );
        })}
      </React.Fragment>
    );
  };

  const renderName = (item) => {
    if (item && item.properties) {
      const children = useNesting.getChildrenGenerationsSpots(item, 10);
      const numSubspots = children.flat().length;
      return (
        <ListItem
          key={item.properties.id}
          onPress={() => goToSpotNesting(item)}
          containerStyle={{padding: 5, paddingLeft: 10}}
        >
          <Avatar source={useSpots.getSpotGemometryIconSource(item)} size={20}/>
          <ListItem.Content>
            <ListItem.Title>{item.properties.name}</ListItem.Title>
            <ListItem.Subtitle>[{numSubspots} subspot{numSubspots !== 1 && 's'}]</ListItem.Subtitle>
          </ListItem.Content>
          {renderDataIcons(item)}
          <ListItem.Chevron/>
        </ListItem>
      );
    }
  };

  const renderGeneration = (type, generation, i, length) => {
    const levelNum = type === 'Parents' ? length - i : i + 1;
    const generationText = levelNum + (levelNum === 1 ? ' Level' : ' Levels') + (type === 'Parents' ? ' Up' : ' Down');
    return (
      <View>
        {type === 'Children' && (
          <Icon type={'material-icons'} name={'south'} containerStyle={{paddingLeft: 8, alignItems: 'flex-start'}}/>
        )}
        <Text style={{paddingLeft: 10}}>{generationText}</Text>
        <FlatList
          listKey={type + i}
          keyExtractor={(item) => item.toString()}
          data={generation}
          renderItem={({item}) => renderName(item)}
        />
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

  const renderSelf = self => {
    return (
      <View style={{borderWidth: 1, borderColor: 'black'}}>
        {renderName(self)}
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
      <ReturnToOverviewButton
        onPress={() => dispatch(setNotebookPageVisible(NotebookPages.OVERVIEW))}
      />
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
