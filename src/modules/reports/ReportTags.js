import React, {useState} from 'react';
import {FlatList, Platform, ScrollView, TouchableOpacity, useWindowDimensions, View} from 'react-native';

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
import {TagsListItem, TagsModal} from '../tags';

const ReportTags = ({checkedTagsIds, handleTagChecked, handleTagPressed}) => {

  const {height, width} = useWindowDimensions();
  const itemWidth = 300;
  const listWidth = SMALL_SCREEN ? width - 30 : width * 0.80 - 30;

  const [isTagsListModalVisible, setIsTagsListModalVisible] = useState(false);

  const tags = useSelector(state => state.project.project?.tags) || [];

  const addAssociatedSpots = () => setIsTagsListModalVisible(true);

  const checkedTags = Object.values(tags).reduce((acc, tag) => {
    return checkedTagsIds.find(id => id.toString() === tag.id.toString()) ? [...acc, tag] : acc;
  }, []);

  return (
    <>
      <View>
        <SectionDivider dividerText={'Tags'}/>
        <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start'}}>
          <ButtonRounded
            icon={
              <Icon
                name={'plus-minus'}
                type={'material-community'}
                iconStyle={imageStyles.icon}
                color={commonStyles.iconColor.color}/>
            }
            title={'Add/Remove Tags'}
            titleStyle={commonStyles.standardButtonText}
            buttonStyle={imageStyles.buttonContainer}
            type={'outline'}
            onPress={addAssociatedSpots}
          />
        </View>

        <View style={{flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 5, paddingTop: 15}}>
          {isEmpty(checkedTags) && <ListEmptyText text={'No Tags'}/>}
          {checkedTags.map(t => (
            <TouchableOpacity
              key={t.id.toString()}
              style={{borderWidth: 0.75, padding: 2, margin: 2, width: listWidth < 600 ? listWidth : itemWidth}}
            >
              <TagsListItem isChevronVisible onPress={handleTagPressed} tag={t}/>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isTagsListModalVisible && (
        <Overlay overlayStyle={[overlayStyles.overlayContainer, {height: 500}]}>
          <View style={{alignItems: 'flex-end'}}>
            <Button
              onPress={() => setIsTagsListModalVisible(false)}
              type={'clear'}
              icon={{name: 'close', type: 'ionicon', size: 20}}
              buttonStyle={{padding: 0}}
            />
          </View>
          {Platform.OS === 'web' ? (
            <ScrollView>
              <TagsModal checkedTagsIds={checkedTagsIds} handleTagChecked={handleTagChecked}/>
            </ScrollView>
          ) : (
            <FlatList
              ListHeaderComponent={
                <TagsModal checkedTagsIds={checkedTagsIds} handleTagChecked={handleTagChecked}/>
              }
            />
          )}
        </Overlay>
      )}
    </>
  );
};

export default ReportTags;
