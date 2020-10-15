import React from 'react';
import {ScrollView, Text, View} from 'react-native';

import {Icon, ListItem} from 'react-native-elements';
import {connect, useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import SectionDivider from '../../shared/ui/SectionDivider';
import {Modals} from '../home/home.constants';
import {setModalVisible} from '../home/home.slice';
import {NotebookPages} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import styles from './samples.style';

const SamplesNotebook = (props) => {
  const dispatch = useDispatch();
  const modalVisible = useSelector(state => state.home.modalVisible);
  const renderSampleList = () => {
    return props.spot.properties.samples.map(item => {
      // console.log('LIST', item);
      let oriented = item.oriented_sample === 'yes' ? 'Oriented' : 'Unoriented';

      return (
        <View key={item.id}>
          <ListItem
            key={item.id}
            containerStyle={styles.notebookListContainer}
          >
            <ListItem.Content>
              <ListItem.Title>{item.sample_id_name
                ? item.sample_id_name
                : <Text style={{color: 'grey'}}>Sample id: {item.id}</Text>}</ListItem.Title>
              <ListItem.Subtitle style={styles.listText}>{<Text
                numberOfLines={1}
                style={styles.listText}>{oriented} - {item.sample_description ? item.sample_description
                : 'No Description'}</Text>}</ListItem.Subtitle>
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
    });
  };

  const renderNotebookView = () => {
    return (
      <View>
        {props.notebookPageVisible === NotebookPages.SAMPLE && <ReturnToOverviewButton
          onPress={() => {
            dispatch(setNotebookPageVisible(NotebookPages.OVERVIEW));
            dispatch(setModalVisible({modal: null}));
          }}
        />}
        {props.notebookPageVisible === NotebookPages.SAMPLE && <SectionDivider dividerText='Samples'/>}
        {/*<FlatList*/}
        {/*  keyExtractor={(item, index) => index.toString()}*/}
        {/*  data={props.spot}*/}
        {/*  renderItem={renderItem}*/}
        {/*/>*/}
        <ScrollView>
          {props.spot.properties.samples ? renderSampleList()
            : <Text style={commonStyles.noValueText}>No Samples</Text>}
        </ScrollView>
      </View>
    );
  };

  const renderShortcutView = () => {
    return (
      <View style={styles.sampleContentContainer}>
        <SectionDivider dividerText='Samples'/>
        <ScrollView>
          {props.spot.properties.samples ? renderSampleList() : null}
        </ScrollView>
      </View>
    );
  };

  return (
    <React.Fragment>
      {modalVisible === Modals.SHORTCUT_MODALS.SAMPLE ? renderShortcutView() : renderNotebookView()}
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  return {
    spot: state.spot.selectedSpot,
    notebookPageVisible: isEmpty(state.notebook.visibleNotebookPagesStack)
      ? null
      : state.notebook.visibleNotebookPagesStack.slice(-1)[0],
  };
};

export default connect(mapStateToProps)(SamplesNotebook);

