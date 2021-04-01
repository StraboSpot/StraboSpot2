import React, {useEffect, useState} from 'react';
import {FlatList, ScrollView, Text, TextInput, View} from 'react-native';

import {Button, ButtonGroup, Icon, ListItem, Overlay} from 'react-native-elements';
import {Row, Rows, Table} from 'react-native-table-component';
import {useDispatch, useSelector} from 'react-redux';

import useDeviceHook from '../../services/useDevice';
import commonStyles from '../../shared/common.styles';
import {isEmpty, truncateText, urlValidator} from '../../shared/Helpers';
import {BLUE, PRIMARY_ACCENT_COLOR} from '../../shared/styles.constants';
import DeleteConformationDialogBox from '../../shared/ui/DeleteConformationDialogBox';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import TextInputModal from '../../shared/ui/GeneralTextInputModal';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import Loading from '../../shared/ui/Loading';
import SectionDivider from '../../shared/ui/SectionDivider';
import {formStyles} from '../form';
import {addedStatusMessage, clearedStatusMessages, setErrorMessagesModalVisible} from '../home/home.slice';
import {NOTEBOOK_PAGES} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import externalDataStyles from './ExternalData.styles';
import useExternalDataHook from './useExternalData';

const ExternalData = () => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);

  const [error, setError] = useState(false);
  const [itemToDelete, setItemToDelete] = useState({});
  const [isDeleteConfirmModalVisible, setIsDeleteConfirmModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [selectedTable, setSelectedTable] = useState({});
  const [tableHead, setTableHead] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [urlToEdit, setUrlToEdit] = useState({});
  const [protocol, setProtocol] = useState('http://');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const useExternalData = useExternalDataHook();
  const useDevice = useDeviceHook();

  useEffect(() => {
    !isEmpty(selectedTable) && isTableVisible && setLoading(false);
  }, [selectedTable]);

  useEffect(() => {
    !isTableVisible && setSelectedTable({});
  }, [isTableVisible]);

  const deleteSelection = () => {
    itemToDelete.type === 'url'
      ? useExternalData.deleteUrl(itemToDelete.item)
      : useExternalData.deleteCVS(itemToDelete.item);
    setIsDeleteConfirmModalVisible(false);
  };

  const editUrl = (urlToEdit, i) => {
    setUrlToEdit({index: i, url: urlToEdit});
    setIsEditModalVisible(true);
  };

  const initializeDelete = (type, whatToDelete) => {
    setItemToDelete({type: type, item: whatToDelete});
    setIsDeleteConfirmModalVisible(true);
  };

  const selectTable = (table) => {
    setLoading(true);
    const filteredData = table.data.filter(row => row.length > 1);
    setSelectedTable(table);
    setTableHead(filteredData[0]);
    setTableData(filteredData.slice(1));
    setIsTableVisible(true);
  };

  const renderDeleteConformation = () => {
    const title = itemToDelete?.type === 'url' ? `${itemToDelete.item}` : `${itemToDelete.item.name}`;
    return (
      <DeleteConformationDialogBox
        title={`${itemToDelete.type.toUpperCase()} to delete`}
        visible={isDeleteConfirmModalVisible}
        delete={() => deleteSelection()}
        cancel={() => setIsDeleteConfirmModalVisible(false)}
      >
        <Text>Are you sure you want to delete</Text>
        <Text>{title}?</Text>
      </DeleteConformationDialogBox>
    );
  };

  const renderTable = () => {
    return (
      <Overlay
        animationType='slide'
        overlayStyle={externalDataStyles.overlayContainer}
        visible={isTableVisible}
      >
        <View style={externalDataStyles.centeredView}>
          <View style={externalDataStyles.buttonClose}>
            <Button
              onPress={() => {
                // setSelectedTable({});
                setIsTableVisible(!isTableVisible);
              }}
              type={'clear'}
              icon={{
                name: 'close',
                type: 'ionicon',
                size: 40,
              }}
            />
          </View>
          <Text style={externalDataStyles.modalText}>{selectedTable.name}</Text>
          <ScrollView>
            <Table borderStyle={{borderWidth: 1}}>
              <Row data={tableHead} style={externalDataStyles.tableHeader}
                   textStyle={{textAlign: 'center', fontWeight: 'bold', padding: 30}}/>
              <Rows data={tableData} textStyle={{textAlign: 'center', padding: 20}}/>
            </Table>
          </ScrollView>
        </View>
      </Overlay>
    );
  };


  const renderTableListItem = (table) => {
    return (
      <View>
        <ListItem
          onPress={() => selectTable(table)}
          containerStyle={commonStyles.listItem}
        >
          <ListItem.Content style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <ListItem.Title style={commonStyles.listItemTitle}>
              {table.name}
            </ListItem.Title>
            <Button
              buttonStyle={externalDataStyles.iconButton}
              onPress={() => initializeDelete('csv', table)}
              type={'clear'}
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
          </ListItem.Content>
        </ListItem>
      </View>
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
            <Button
              buttonStyle={externalDataStyles.iconButton}
              type={'clear'}
              onPress={() => initializeDelete('url', urlItem)}
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
          </View>
        </ListItem.Content>
      </ListItem>
    );
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

  const saveUrl = async () => {
    try {
      await useExternalData.saveURL(protocol, url);
      setUrl('');
      setError(false);
    }
    catch (err) {
      setError(true);
      setTimeout(() => setError(false), 3000);
      console.error('Not Valid URL Yet');
    }
  };

  return (
    <View style={{flex: 1}}>
      <ReturnToOverviewButton
        onPress={() => dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.OVERVIEW))}
      />
      <SectionDivider dividerText={'Links To Web Resources'}/>
      <View style={{flex: 1}}>
        <ButtonGroup
          onPress={i => i === 0 ? setProtocol('http://') : setProtocol('https://')}
          selectedIndex={protocol === 'http://' ? 0 : 1}
          buttons={['http://', 'https://']}
          containerStyle={{borderRadius: 10}}
          selectedButtonStyle={{backgroundColor: PRIMARY_ACCENT_COLOR}}
          textStyle={{color: PRIMARY_ACCENT_COLOR}}
        />
        <ListItem containerStyle={commonStyles.listItem}>
          <ListItem.Content style={{flexDirection: 'row', justifyContent: 'flex-start'}}>
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
            disabled={url === ''}
            containerStyle={commonStyles.standardButtonContainer}
            onPress={() => saveUrl()}
          />
        </View>
        <FlatList
          keyExtractor={(index) => index}
          data={spot.properties?.data?.urls}
          renderItem={({item, index}) => renderUrlListItem(item, index)}
          ItemSeparatorComponent={FlatListItemSeparator}
          ListEmptyComponent={<ListEmptyText text={'No URLs saved'}/>}
        />
      </View>
      <View style={{flex: 1}}>
        <View style={{paddingTop: 15}}>
          <SectionDivider dividerText={'Tables'}/>
          <Button
            title={'Attach table from a .CSV file'}
            type={'outline'}
            icon={{
              name: 'attach-outline',
              type: 'ionicon',
            }}
            containerStyle={commonStyles.buttonPadding}
            buttonStyle={commonStyles.standardButton}
            titleStyle={commonStyles.standardButtonText}
            onPress={() => useExternalData.CSVPicker()}
          />
        </View>
        {loading ? <Loading style={externalDataStyles.loadingSpinner}/>
          : <FlatList
            keyExtractor={(index) => index}
            data={spot.properties?.data?.tables}
            renderItem={({item}) => renderTableListItem(item)}
            ItemSeparatorComponent={FlatListItemSeparator}
            ListEmptyComponent={<ListEmptyText text={'No tables saved'}/>}
          />}
        {renderURLEditModal()}
        {!loading && renderTable()}
        {!isEmpty(itemToDelete) && renderDeleteConformation()}
      </View>
    </View>
  );
};

export default ExternalData;
