import React from 'react';
import {FlatList, View} from 'react-native';

import {Icon, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import {PRIMARY_ACCENT_COLOR} from '../../shared/styles.constants';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDivider from '../../shared/ui/SectionDivider';
import SectionDividerWithRightButton from '../../shared/ui/SectionDividerWithRightButton';
import {MODALS} from '../home/home.constants';
import {setModalVisible} from '../home/home.slice';
import {NOTEBOOK_PAGES, NOTEBOOK_SUBPAGES} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import {setSelectedAttributes} from '../spots/spots.slice';
import styles from './samples.style';

const SamplesNotebook = () => {
  const dispatch = useDispatch();
  const modalVisible = useSelector(state => state.home.modalVisible);
  const notebookPageVisible = useSelector(state => (
    !isEmpty(state.notebook.visibleNotebookPagesStack) && state.notebook.visibleNotebookPagesStack.slice(-1)[0]
  ));
  const samples = useSelector(state => state.spot.selectedSpot.properties.samples);

  const renderSampleListItem = (item) => {
    let oriented = item.oriented_sample === 'yes' ? 'Oriented' : 'Unoriented';
    return (
      <ListItem
        containerStyle={commonStyles.listItem}
        key={item.id}
        onPress={() => onSamplePressed(item)}
        pad={5}
      >
        <ListItem.Content>
          <ListItem.Title style={commonStyles.listItemTitle}>{item.sample_id_name || 'Unknown'}</ListItem.Title>
          <ListItem.Subtitle>
            {oriented} - {item.sample_description ? item.sample_description : 'No Description'}
          </ListItem.Subtitle>
        </ListItem.Content>
        <Icon name={'information-circle-outline'} type={'ionicon'} color={PRIMARY_ACCENT_COLOR}/>
        <ListItem.Chevron/>
      </ListItem>
    );
  };

  const renderSampleList = () => {
    return (
      <FlatList
        data={samples}
        renderItem={({item}) => renderSampleListItem(item)}
        ItemSeparatorComponent={FlatListItemSeparator}
        ListEmptyComponent={<ListEmptyText text={'No Samples at this Spot'}/>}
      />
    );
  };

  const renderNotebookView = () => {
    return (
      <View>
        {notebookPageVisible === NOTEBOOK_PAGES.SAMPLE && (
          <React.Fragment>
            <ReturnToOverviewButton
              onPress={() => {
                dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.OVERVIEW));
                dispatch(setModalVisible({modal: null}));
              }}
            />
            <SectionDividerWithRightButton
              dividerText='Samples'
              buttonTitle={'Add'}
              onPress={() => dispatch(setModalVisible({modal: MODALS.NOTEBOOK_MODALS.SAMPLE}))}
            />
          </React.Fragment>
        )}
        {renderSampleList()}
      </View>
    );
  };

  const renderShortcutView = () => {
    return (
      <View style={styles.sampleContentContainer}>
        <SectionDivider dividerText='Samples'/>
        {renderSampleList()}
      </View>
    );
  };

  const onSamplePressed = (item) => {
    dispatch(setSelectedAttributes([item]));
    dispatch(setNotebookPageVisible(NOTEBOOK_SUBPAGES.SAMPLEDETAIL));
  };

  return (
    <React.Fragment>
      {modalVisible === MODALS.SHORTCUT_MODALS.SAMPLE ? renderShortcutView() : renderNotebookView()}
    </React.Fragment>
  );
};

export default SamplesNotebook;
