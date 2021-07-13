import React, {useState} from 'react';
import {FlatList, View} from 'react-native';

import {Button, Icon, ListItem} from 'react-native-elements';
import {useDispatch} from 'react-redux';

import useDeviceHook from '../../services/useDevice';
import commonStyles from '../../shared/common.styles';
import {truncateText, urlValidator} from '../../shared/Helpers';
import {BLUE} from '../../shared/styles.constants';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import TextInputModal from '../../shared/ui/GeneralTextInputModal';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import {addedStatusMessage, clearedStatusMessages, setErrorMessagesModalVisible} from '../home/home.slice';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import {PAGE_KEYS} from '../page/page.constants';
import externalDataStyles from './ExternalData.styles';
import useExternalDataHook from './useExternalData';

const UrlData = (props) => {
  const useDevice = useDeviceHook();
  const dispatch = useDispatch();
  const [urlToEdit, setUrlToEdit] = useState({});
  const useExternalData = useExternalDataHook();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const editUrl = (urlToEdit, i) => {
    if (props.editable) {
      setUrlToEdit({index: i, url: urlToEdit});
      setIsEditModalVisible(true);
    }
    else dispatch(setNotebookPageVisible(PAGE_KEYS.DATA));
  };

  const renderURLEditModal = () => {
    return (
      <TextInputModal
        multiline={true}
        keyboardType={'url'}
        textInputStyle={{}}
        dialogTitle={'Edit Url'}
        visible={isEditModalVisible}
        onPress={() => saveEdits()}
        close={() => setIsEditModalVisible(false)}
        value={urlToEdit.url}
        onChangeText={(text) => setUrlToEdit({...urlToEdit, url: text})}
      />
    );
  };

  const renderUrlListItem = (urlItem, i) => {
    return (
      <ListItem containerStyle={commonStyles.listItem}>
        <ListItem.Content style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <ListItem.Title
            style={[commonStyles.listItemTitle, {color: BLUE}]}
            onPress={() => useDevice.openURL(urlItem)}>
            {truncateText(urlItem, 33)}
          </ListItem.Title>

          <View style={{flexDirection: 'row'}}>
            <Button
              buttonStyle={externalDataStyles.iconButton}
              type={'clear'}
              onPress={() => editUrl(urlItem, i)}
              icon={
                <Icon
                  name='edit'
                  type={'material'}
                  size={20}
                  color='darkgrey'
                  containerStyle={externalDataStyles.iconContainer}
                />
              }
            />
            {props.editable && (
              <Button
                buttonStyle={externalDataStyles.iconButton}
                type={'clear'}
                onPress={() => props.initializeDelete('url', urlItem)}
                icon={
                  <Icon
                    name='trash'
                    type={'font-awesome'}
                    size={20}
                    color='darkgrey'
                    containerStyle={externalDataStyles.iconContainer}
                  />
                }
              />
            )}
          </View>
        </ListItem.Content>
      </ListItem>
    );
  };

  const saveEdits = () => {
    try {
      if (urlValidator(urlToEdit.url)) {
        useExternalData.saveEdits(urlToEdit);
        setIsEditModalVisible(false);
      }
      else throw Error('Not valid URL.');
    }
    catch (err) {
      console.error('Error saving edits', err);
      dispatch(clearedStatusMessages());
      dispatch(addedStatusMessage('Please make sure you enter a valid url.'));
      dispatch(setErrorMessagesModalVisible(true));
    }
  };

  return (
    <View>
      <FlatList
        keyExtractor={(index) => index}
        data={props.spot.properties?.data?.urls}
        renderItem={({item, index}) => renderUrlListItem(item, index)}
        ItemSeparatorComponent={FlatListItemSeparator}
        ListEmptyComponent={<ListEmptyText text={'No URLs saved'}/>}
      />
      {renderURLEditModal()}
    </View>
  );
};

export default UrlData;
