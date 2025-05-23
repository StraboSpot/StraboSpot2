import React from 'react';
import {FlatList, Platform, Text, View} from 'react-native';

import {ListItem, Overlay} from '@rn-vui/base';
import {useSelector} from 'react-redux';

import overlayStyles from './overlay.styles';
import commonStyles from '../../../shared/common.styles';
import FlatListItemSeparator from '../../../shared/ui/FlatListItemSeparator';

const MapActionsOverlay = ({
                             onPress,
                             onTouchOutside,
                             overlayStyle,
                             visible,
                           }) => {

  const currentBasemap = useSelector(state => state.map.currentBasemap);
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const stratSection = useSelector(state => state.map.stratSection);
  const {isInternetReachable, isConnected} = useSelector(state => state.connections.isOnline);

  const actions = [
    {key: 'zoom', title: 'Zoom to Extent of Spots'},
    {key: 'saveMap', title: 'Save Map for Offline Use'},
    {key: 'stereonet', title: 'Lasso Spots for Stereonet'},
    // {key: 'zoomToOfflineMap', title: 'Zoom to Offline Map'},
    {key: 'addTag', title: 'Add Tag(s) to Spot(s)'},
    {key: 'addToReport', title: 'Add Spot(s) to Report'},
    {key: 'mapMeasurement', title: 'Measure Distance'},
    {key: 'stratSection', title: 'Strat Section Settings'},
  ];

  const mapActionItem = (item) => {
    if ((item.key === 'saveMap' && ((isInternetReachable && isConnected)
        || (!isInternetReachable && isConnected && currentBasemap?.source)) && Platform.OS !== 'web')
      || (item.key === 'stereonet' && Platform.OS === 'ios')
      || (item.key === 'stratSection' && stratSection)
      || (item.key === 'mapMeasurement' && !stratSection && !currentImageBasemap)
      || item.key !== 'saveMap' && item.key !== 'stereonet' && item.key !== 'stratSection'
      && item.key !== 'mapMeasurement') {
      return (
        <ListItem
          containerStyle={commonStyles.listItem}
          key={item.key}
          onPress={() => onPress(item.key)}
        >
          <ListItem.Title style={commonStyles.listItemTitle}>{item.title}</ListItem.Title>
        </ListItem>
      );
    }
  };

  return (
    <Overlay
      supportedOrientations={['portrait', 'landscape']}
      animationType={'slide'}
      backdropStyle={{backgroundColor: 'transparent'}}
      isVisible={visible}
      onBackdropPress={onTouchOutside}
      overlayStyle={[overlayStyles.overlayContainer, overlayStyle]}
    >
      <View style={[overlayStyles.titleContainer]}>
        <Text style={[overlayStyles.titleText]}>Map Actions</Text>
      </View>
      <FlatList
        key={'mapActions'}
        data={actions}
        contentContainerStyle={{alignItems: 'center'}}
        renderItem={({item}) => mapActionItem(item)}
        ItemSeparatorComponent={FlatListItemSeparator}
      />
    </Overlay>
  );
};

export default MapActionsOverlay;
