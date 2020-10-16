import React from 'react';
import {ScrollView, Text, View} from 'react-native';

import {Icon, ListItem} from 'react-native-elements';
import {connect} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import SectionDivider from '../../shared/ui/SectionDivider';
import {homeReducers, Modals} from '../home/home.constants';
import {notebookReducers, NotebookPages} from '../notebook-panel/notebook.constants';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import styles from './samples.style';

const samplesNotebook = (props) => {
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
    });
  };

  const renderNotebookView = () => {
    return (
      <View>
        {props.notebookPageVisible === NotebookPages.SAMPLE && (
          <ReturnToOverviewButton
            onPress={() => {
              props.setNotebookPageVisible(NotebookPages.OVERVIEW);
              props.setModalVisible(null);
            }}
          />
        )}
        {props.notebookPageVisible === NotebookPages.SAMPLE && <SectionDivider dividerText='Samples'/>}
        {/*<FlatList*/}
        {/*  keyExtractor={(item, index) => index.toString()}*/}
        {/*  data={props.spot}*/}
        {/*  renderItem={renderItem}*/}
        {/*/>*/}
        <ScrollView>
          {props.spot.properties.samples
            ? renderSampleList()
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
      {props.modalVisible === Modals.SHORTCUT_MODALS.SAMPLE ? renderShortcutView() : renderNotebookView()}
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  return {
    spot: state.spot.selectedSpot,
    modalVisible: state.home.modalVisible,
    notebookPageVisible: isEmpty(state.notebook.visibleNotebookPagesStack)
      ? null
      : state.notebook.visibleNotebookPagesStack.slice(-1)[0],
  };
};

const mapDispatchToProps = {
  setNotebookPageVisible: (page) => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: page}),
  setModalVisible: (modal) => ({type: homeReducers.SET_MODAL_VISIBLE, modal: modal}),
};

export default connect(mapStateToProps, mapDispatchToProps)(samplesNotebook);

