import React, {useState} from 'react';
import {Alert, FlatList, Linking, Text, TextInput, View} from 'react-native';

import {Button, ButtonGroup, Icon, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {truncateText, urlValidator} from '../../shared/Helpers';
import {BLUE, PRIMARY_ACCENT_COLOR} from '../../shared/styles.constants';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import TextInputModal from '../../shared/ui/GeneralTextInputModal';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import SectionDivider from '../../shared/ui/SectionDivider';
import {formStyles} from '../form';
import {NOTEBOOK_PAGES} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import {editedSpotProperties} from '../spots/spots.slice';

const Data = (props) => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const [error, setError] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [urlToEdit, setUrlToEdit] = useState({});
  const [protocol, setProtocol] = useState('http://');
  const [url, setUrl] = useState('');

  const deleteUrl = (urlToDelete, index) => {
    const urlCopy = JSON.parse(JSON.stringify(spot.properties.data.urls));
    console.log(urlCopy);
    const filteredArr = urlCopy.filter(url => url !== urlToDelete);
    console.log(filteredArr);
    dispatch(editedSpotProperties({field: 'data', value: {urls: filteredArr}}));
  };

  const editUrl = (urlToEdit, i) => {
    console.log(urlToEdit, i);
    setUrlToEdit({index: i, url: urlToEdit});
    setIsEditModalVisible(true);
  };

  const renderUrlListItem = (url, i) => {
    return (
      <ListItem containerStyle={commonStyles.listItem}>
        <ListItem.Content style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <ListItem.Title
            style={[commonStyles.listItemTitle, {color: BLUE}]}
            onPress={() => openUrl(url)}>
            {truncateText(url, 33)}
          </ListItem.Title>
          <View style={{flexDirection: 'row'}}>
            <Icon
              name='edit'
              type={'material'}
              size={20}
              color='darkgrey'
              containerStyle={{paddingRight: 10, paddingLeft: 10}}
              onPress={() => editUrl(url, i)}
            />
            <Icon
              name='trash'
              type={'font-awesome'}
              size={20}
              color='darkgrey'
              containerStyle={{paddingRight: 10, paddingLeft: 10}}
              onPress={() => deleteUrl(url, i)}
            />
          </View>
        </ListItem.Content>
      </ListItem>
    );
  };

  const openUrl = async (urlToOpen) => {
    try {
      const supported = await Linking.canOpenURL(urlToOpen);
      console.log(supported);
      if (supported) await Linking.openURL(urlToOpen);
      else {
        console.log('Could not open:', urlToOpen);
      }
    }
    catch (err) {
      console.error('Error opening url', urlToOpen, ':', err);
    }
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

  const saveEdits = () => {
    const urlArrCopy = JSON.parse(JSON.stringify(spot.properties.data.urls));
    urlArrCopy.splice(urlToEdit.index, 1, urlToEdit.url);
    dispatch(editedSpotProperties({field: 'data', value: {urls: urlArrCopy}}));
    setIsEditModalVisible(false);
  };

  const saveUrl = () => {
    let savedUrls;
    const fullURL = (protocol + url).toLowerCase();
    console.log(fullURL);
    let editedData = spot.properties.data ? JSON.parse(JSON.stringify(spot.properties.data)) : {};
    if (spot.properties.data?.urls) savedUrls = spot.properties.data.urls;
    const valid = urlValidator(fullURL, 'urlValidator');
    if (valid) {
      if (!savedUrls?.includes(fullURL)) {
        if (!editedData?.urls) editedData.urls = [];
        editedData.urls.push(fullURL.toLowerCase());
        dispatch(editedSpotProperties({field: 'data', value: editedData}));
        setUrl('');
        setError(false);
      }
      else Alert.alert('URL is already in list.');
    }
    else {
      setError(true);
      setTimeout(() => setError(false), 3000);
      console.log('Not Valid URL Yet');
    }
  };

  return (
    <View style={{flex: 1}}>
      <ReturnToOverviewButton
        onPress={() => dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.OVERVIEW))}
      />
      <SectionDivider dividerText={'Links To Web Resources'}/>
      <View style={{flexDirection: 'row'}}>
        <View style={{flex: 1}}>
          <ButtonGroup
            onPress={i => i === 0 ? setProtocol('http://') : setProtocol('https://')}
            selectedIndex={protocol === 'http://' ? 0 : 1}
            buttons={['http://', 'https://']}
            containerStyle={{borderRadius: 10}}
            selectedButtonStyle={{backgroundColor: PRIMARY_ACCENT_COLOR}}
            textStyle={{color: PRIMARY_ACCENT_COLOR}}
          />
        </View>
      </View>
      <ListItem containerStyle={commonStyles.listItem}>
        <ListItem.Content style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-start'}}>
          <View style={{justifyContent: 'center'}}>
            <TextInput
              multiline={true}
              editable={false}
              style={formStyles.fieldValue}
              value={protocol}
            />
          </View>
          <View style={{width: 300}}>
            <TextInput
              onFocus={() => setError(false)}
              autoCapitalize={'none'}
              multiline={true}
              placeholder={'Example -> www.usgs.gov'}
              style={[formStyles.fieldValue]}
              onChangeText={(text) => setUrl(text)}
              textContentType={'URL'}
              keyboardType={'url'}
              onSubmitEditing={() => saveUrl()}
              returnKeyType={'go'}
              value={url}
            />
          </View>
        </ListItem.Content>
      </ListItem>
      {error && <Text style={formStyles.fieldError}>Not a valid url</Text>}
      <View style={{flexDirection: 'row', justifyContent: 'space-around', padding: 10}}>
        <Button
          title={'Add Link'}
          type={'clear'}
          containerStyle={commonStyles.standardButtonContainer}
          onPress={() => saveUrl()}
        />
        <Button
          title={'Clear Link'}
          type={'clear'}
          containerStyle={commonStyles.standardButtonContainer}
          onPress={() => setUrl('')}
        />
      </View>
      <FlatList
        keyExtractor={(index) => index}
        data={spot.properties?.data?.urls}
        renderItem={({item, index}) => renderUrlListItem(item, index)}
        ItemSeparatorComponent={FlatListItemSeparator}
        ListEmptyComponent={<ListEmptyText text={'No URLs saved'}/>}
      />
      {renderURLEditModal()}
    </View>
  );
};

export default Data;