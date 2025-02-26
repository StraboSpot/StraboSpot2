import React, {useState} from 'react';
import {TouchableOpacity, useWindowDimensions, View} from 'react-native';

import {Button, Icon, Overlay} from 'react-native-elements';
import {useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import {SMALL_SCREEN} from '../../shared/styles.constants';
import ButtonRounded from '../../shared/ui/ButtonRounded';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDivider from '../../shared/ui/SectionDivider';
import overlayStyles from '../home/overlays/overlay.styles';
import {imageStyles} from '../images';
import {SpotsList, SpotsListItem} from '../spots';

const ReportSpots = ({checkedSpotsIds, handleSpotChecked, updateSpotsInMapExtent}) => {

  const {height, width} = useWindowDimensions();
  const itemWidth = 300;
  const listWidth = SMALL_SCREEN ? width - 30 : width * 0.80 - 30;

  const [isSpotsListModalVisible, setIsSpotsListModalVisible] = useState(false);

  const spots = useSelector(state => state.spot.spots);

  const addAssociatedSpots = () => setIsSpotsListModalVisible(true);

  const checkedSpots = Object.entries(spots).reduce((acc, [spotId, spotObj]) => {
    return checkedSpotsIds.find(id => id.toString() === spotId) ? [...acc, spotObj] : acc;
  }, []);

  return (
    <>
      <View>
        <SectionDivider dividerText={'Associated Spots'}/>
        <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start'}}>
          <ButtonRounded
            icon={
              <Icon
                name={'plus-minus'}
                type={'material-community'}
                iconStyle={imageStyles.icon}
                color={commonStyles.iconColor.color}/>
            }
            title={'Add/Remove Spots'}
            titleStyle={commonStyles.standardButtonText}
            buttonStyle={imageStyles.buttonContainer}
            type={'outline'}
            onPress={addAssociatedSpots}
          />
          <ButtonRounded
            icon={
              <Icon
                name={'lasso'}
                type={'material-community'}
                iconStyle={imageStyles.icon}
                color={commonStyles.iconColor.color}/>
            }
            title={'Add Spots with Lasso'}
            titleStyle={commonStyles.standardButtonText}
            buttonStyle={imageStyles.buttonContainer}
            type={'outline'}
            onPress={addAssociatedSpots}
          />
        </View>

        <View style={{flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 5, paddingTop: 15}}>
          {isEmpty(checkedSpots) && <ListEmptyText text={'No Associated Spots'}/>}
          {checkedSpots.map(d => (
            <TouchableOpacity
              style={{borderWidth: 0.75, padding: 2, margin: 2, width: listWidth < 600 ? listWidth : itemWidth}}
            >
              <SpotsListItem
                // onPress={onPress}
                spot={d}
              />
            </TouchableOpacity>
          ))}
        </View>

      </View>
      {isSpotsListModalVisible && (
        <Overlay overlayStyle={[overlayStyles.overlayContainer, {height: height * 0.8}]}>
          <View style={{flex: 1}}>
            <View style={{alignItems: 'flex-end'}}>
              <Button
                onPress={() => setIsSpotsListModalVisible(false)}
                type={'clear'}
                icon={{name: 'close', type: 'ionicon', size: 20}}
                buttonStyle={{padding: 0}}
              />
            </View>
            <View style={{...commonStyles.buttonContainer, flex: 1}}>
              <SpotsList
                checkedItems={checkedSpotsIds}
                isCheckedList={true}
                onChecked={handleSpotChecked}
                updateSpotsInMapExtent={updateSpotsInMapExtent}
              />
            </View>
          </View>
        </Overlay>
      )}
    </>
  );
};

export default ReportSpots;
