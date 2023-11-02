import React from 'react';
import {FlatList, Platform, Text, View} from 'react-native';

import {ListItem, Overlay} from 'react-native-elements';
import {useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import overlayStyles from './overlay.styles';

const MapActionsDialog = (props) => {

  const currentBasemap = useSelector(state => state.map.currentBasemap);
  const currentImageBasemap = useSelector(state => state.map.currentImageBasemap);
  const stratSection = useSelector(state => state.map.stratSection);
  const {isInternetReachable, isConnected} = useSelector(state => state.home.isOnline);

  const actions = [
    {key: 'zoom', title: 'Zoom to Extent of Spots'},
    {key: 'saveMap', title: 'Save Map for Offline Use'},
    {key: 'stereonet', title: 'Lasso Spots for Stereonet'},
    // {key: 'zoomToOfflineMap', title: 'Zoom to Offline Map'},
    {key: 'addTag', title: 'Add Tag(s) to Spot(s)'},
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
          onPress={() => props.onPress(item.key)}
        >
          <ListItem.Title style={commonStyles.listItemTitle}>{item.title}</ListItem.Title>
        </ListItem>
      );
    }
  };

  return (
    <Overlay
      animationType={'slide'}
      isVisible={props.visible}
      overlayStyle={[overlayStyles.overlayContainer, props.overlayStyle]}
      onBackdropPress={props.onTouchOutside}
      backdropStyle={{backgroundColor: 'transparent'}}
    >
      <View style={[overlayStyles.titleContainer]}>
        <Text style={[overlayStyles.titleText]}>Map Actions</Text>
      </View>
      <View>
        <FlatList
          key={'mapActions'}
          data={actions}
          contentContainerStyle={{alignItems: 'center'}}
          renderItem={({item}) => mapActionItem(item)}
          ItemSeparatorComponent={FlatListItemSeparator}
        />
      </View>
    </Overlay>
  );
};

export default MapActionsDialog;
