import React from 'react';
import {ScrollView, Text, View} from 'react-native';

import {Icon, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import SectionDivider from '../../shared/ui/SectionDivider';
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

  const renderSampleList = () => {
    return (
      samples.map(item => {
        // console.log('LIST', item);
        let oriented = item.oriented_sample === 'yes' ? 'Oriented' : 'Unoriented';

        return (
          <View key={item.id}>
            <ListItem
              key={item.id}
              containerStyle={styles.notebookListContainer}
              onPress={() => onSamplePressed(item)}
            >
              <ListItem.Content>
                <ListItem.Title>{item.sample_id_name
                  ? item.sample_id_name
                  : <Text style={{color: 'grey'}}>Sample id: {item.id}</Text>}
                </ListItem.Title>
                <ListItem.Subtitle style={styles.listText}>
                  {<Text
                    numberOfLines={1}
                    style={styles.listText}>{oriented} -
                    {item.sample_description ? item.sample_description : 'No Description'}
                  </Text>}
                </ListItem.Subtitle>
              </ListItem.Content>
              <Icon
                name='ios-information-circle-outline'
                type='ionicon'
                color={themes.PRIMARY_ACCENT_COLOR}
                onPress={() => console.log('Samples item pressed', item.id)}
              />
              <ListItem.Chevron/>
            </ListItem>
          </View>
        );
      })
    );
  };

  const renderNotebookView = () => {
    return (
      <View>
        {notebookPageVisible === NOTEBOOK_PAGES.SAMPLE && (
          <ReturnToOverviewButton
            onPress={() => {
              dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.OVERVIEW));
              dispatch(setModalVisible({modal: null}));
            }}
          />
        )}
        {notebookPageVisible === NOTEBOOK_PAGES.SAMPLE && <SectionDivider dividerText='Samples'/>}
        <ScrollView>
          {samples ? renderSampleList() : <Text style={commonStyles.noValueText}>No Samples</Text>}
        </ScrollView>
      </View>
    );
  };

  const renderShortcutView = () => {
    return (
      <View style={styles.sampleContentContainer}>
        <SectionDivider dividerText='Samples'/>
        <ScrollView>
          {samples && renderSampleList()}
        </ScrollView>
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
