import React, {useEffect, useState} from 'react';
import {FlatList, ScrollView, Text, View} from 'react-native';

import {Button, Icon, ListItem, Overlay} from 'react-native-elements';
import {Rows, Table} from 'react-native-reanimated-table';

import externalDataStyles from './externalData.styles';
import commonStyles from '../../shared/common.styles';
import {isEmpty} from '../../shared/Helpers';
import FlatListItemSeparator from '../../shared/ui/FlatListItemSeparator';
import ListEmptyText from '../../shared/ui/ListEmptyText';
import Loading from '../../shared/ui/Loading';

function TablesData({
                      editable,
                      initializeDelete,
                      spot,
                    }) {
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [selectedTable, setSelectedTable] = useState({});
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // console.log('UE TablesData [selectedTable]', selectedTable);
    !isEmpty(selectedTable) && isTableVisible && setLoading(false);
  }, [selectedTable]);

  useEffect(() => {
    // console.log('UE TablesData [isTableVisible]', isTableVisible);
    !isTableVisible && setSelectedTable({});
  }, [isTableVisible]);

  const renderTable = () => {
    const numCols = tableData?.[0]?.length;
    const tableDataTrimmed = tableData.reduce((acc, r) => r.length === numCols ? [...acc, r] : acc, []);
    let cellMaxWidths = Array(numCols).fill(0);
    tableDataTrimmed.forEach((r) => {
      r.forEach((c, i) => {
        if (c.length > cellMaxWidths[i]) cellMaxWidths[i] = c.length;
      });
    });
    const cellWidths = cellMaxWidths.map(w => Math.min(w * 20, 150));
    return (
      <Overlay
        animationType={'slide'}
        overlayStyle={externalDataStyles.overlayContainer}
        isVisible={isTableVisible}
      >
        <View style={externalDataStyles.centeredView}>
          <View style={externalDataStyles.buttonClose}>
            <Button
              onPress={() => setIsTableVisible(!isTableVisible)}
              type={'clear'}
              icon={{name: 'close', type: 'ionicon', size: 40}}
            />
          </View>
          <Text style={externalDataStyles.modalText}>{selectedTable.name}</Text>
          <ScrollView>
            <ScrollView style={{overflow: 'scroll'}} horizontal={true}>
              <Table borderStyle={{borderWidth: 1}}>
                <Rows data={tableDataTrimmed} widthArr={cellWidths} textStyle={{textAlign: 'center', margin: 5}}/>
              </Table>
            </ScrollView>
          </ScrollView>
        </View>
      </Overlay>
    );
  };

  const renderTableListItem = (table) => {
    return (
      <ListItem
        key={table.id}
        onPress={() => selectTable(table)}
        containerStyle={commonStyles.listItem}
      >
        <ListItem.Content style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <ListItem.Title style={commonStyles.listItemTitle}>
            {table.name}
          </ListItem.Title>
          {editable && (
            <Button
              buttonStyle={externalDataStyles.iconButton}
              onPress={() => initializeDelete('csv', table)}
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
    );
  };

  const selectTable = (table) => {
    setLoading(true);
    setSelectedTable(table);
    setTableData(table.data);
    setIsTableVisible(true);
  };

  return (
    <View style={{flex: 1}}>
      {loading ? <Loading style={externalDataStyles.loadingSpinner}/>
        : (
          <FlatList
            listKey={'tables'}
            keyExtractor={item => item.id}
            data={spot.properties?.data?.tables}
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
