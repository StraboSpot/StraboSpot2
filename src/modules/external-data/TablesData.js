import React, {useEffect, useState} from 'react';
import {FlatList, ScrollView, Text, View} from 'react-native';

import {Button, Icon, ListItem, Overlay} from 'react-native-elements';
import {Row, Rows, Table} from 'react-native-table-component';

import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import Loading from '../../shared/ui/Loading';
import externalDataStyles from './ExternalData.styles';

function TablesData(props) {
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [selectedTable, setSelectedTable] = useState({});
  const [tableHead, setTableHead] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('UE TablesData [selectedTable]', selectedTable);
    !isEmpty(selectedTable) && isTableVisible && setLoading(false);
  }, [selectedTable]);

  useEffect(() => {
    console.log('UE TablesData [isTableVisible]', isTableVisible);
    !isTableVisible && setSelectedTable({});
  }, [isTableVisible]);

  const renderTable = () => {
    return (
      <Overlay
        animationType={'slide'}
        overlayStyle={externalDataStyles.overlayContainer}
        visible={isTableVisible}
      >
        <View style={externalDataStyles.centeredView}>
          <View style={externalDataStyles.buttonClose}>
            <Button
              onPress={() => {
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
            {props.editable && (
              <Button
                buttonStyle={externalDataStyles.iconButton}
                onPress={() => props.initializeDelete('csv', table)}
                type={'clear'}
                icon={
                  <Icon
                    name={'trash'}
                    type={'font-awesome'}
                    size={20}
                    color={'darkgrey'}
                    containerStyle={externalDataStyles.iconContainer}
                  />
                }
              />
            )}
          </ListItem.Content>
        </ListItem>
      </View>
    );
  };

  const selectTable = (table) => {
    setLoading(true);
    const filteredData = table.data.filter(row => row.length > 1);
    setSelectedTable(table);
    setTableHead(filteredData[0]);
    setTableData(filteredData.slice(1));
    setIsTableVisible(true);
  };

  return (
    <View>
      {props.loading ? <Loading style={externalDataStyles.loadingSpinner}/>
        : (
          <FlatList
            listKey={'tables'}
            keyExtractor={(index) => index}
            data={props.spot.properties?.data?.tables}
            renderItem={({item}) => renderTableListItem(item)}
            ItemSeparatorComponent={FlatListItemSeparator}
            ListEmptyComponent={<ListEmptyText text={'No tables saved'}/>}
          />
        )}
      {!loading && renderTable()}
    </View>
  );
}

export default TablesData;
