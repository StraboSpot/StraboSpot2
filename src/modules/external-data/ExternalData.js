import React, {useState} from 'react';
import {Text, TextInput, View} from 'react-native';

import {Button, ButtonGroup, ListItem} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import commonStyles from '../../shared/common.styles';
import {PRIMARY_ACCENT_COLOR} from '../../shared/styles.constants';
import SectionDivider from '../../shared/ui/SectionDivider';
import {formStyles} from '../form';
import {NOTEBOOK_PAGES} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import DataWrapper from './DataWrapper';
import useExternalDataHook from './useExternalData';

const ExternalData = () => {
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spot.selectedSpot);
  const [error, setError] = useState(false);
  const [protocol, setProtocol] = useState('http://');
  const [url, setUrl] = useState('');
  const useExternalData = useExternalDataHook();

  const renderTableData = () => {
    return <DataWrapper spot={spot} editable={true} urlData={false}/>;
  };

  const renderURLData = () => {
    return <DataWrapper spot={spot} editable={true} urlData={true}/>;
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
        {renderURLData()}
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
        {renderTableData()}
      </View>
    </View>
  );
};

export default ExternalData;
