import React, {useState, useRef} from 'react';
import {Platform, Text, TextInput, View} from 'react-native';

import {Button, ButtonGroup, ListItem} from 'react-native-elements';
import {useSelector} from 'react-redux';

import DataWrapper from './DataWrapper';
import useExternalDataHook from './useExternalData';
import commonStyles from '../../shared/common.styles';
import * as themes from '../../shared/styles.constants';
import SectionDivider from '../../shared/ui/SectionDivider';
import {formStyles} from '../form';
import ReturnToOverviewButton from '../page/ui/ReturnToOverviewButton';

const ExternalData = () => {
  const inputRef = useRef(null);

  const spot = useSelector(state => state.spot.selectedSpot);
  const [error, setError] = useState(false);
  const [protocol, setProtocol] = useState('http://');
  const [url, setUrl] = useState('');
  const useExternalData = useExternalDataHook();

  const importCSVFile = () => {
    try {
      if (Platform.OS !== 'web') useExternalData.pickCSV().catch(console.error);
      else {
        console.log('WEB');
        inputRef.current.click();
      }
    }
    catch (err) {
      console.error('ERROR selecting .CSV file', err);
    }
  };

  const handleFileChange = async (e) => {
    console.log('CSV File', e.target.files[0]);
    const file = e.target.files[0];
    await useExternalData.pickCSV(file);
    console.log('CSV From Web Saved');
  };

  const saveUrl = async () => {
    try {
      useExternalData.saveURL(protocol, url);
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
      <ReturnToOverviewButton/>
      <SectionDivider dividerText={'Links To Web Resources'}/>
      <View style={{flex: 1}}>
        <ButtonGroup
          onPress={i => i === 0 ? setProtocol('http://') : setProtocol('https://')}
          selectedIndex={protocol === 'http://' ? 0 : 1}
          buttons={['http://', 'https://']}
          containerStyle={{borderRadius: 10}}
          selectedButtonStyle={{backgroundColor: themes.PRIMARY_ACCENT_COLOR}}
          textStyle={{color: themes.PRIMARY_ACCENT_COLOR}}
        />
        <ListItem containerStyle={commonStyles.listItem}>
          <ListItem.Content style={{flexDirection: 'row', justifyContent: 'flex-start'}}>
            <View>
              <TextInput
                multiline={true}
                editable={false}
                style={formStyles.fieldValue}
                value={protocol || ''}
              />
            </View>
            <View>
              <TextInput
                onFocus={() => setError(false)}
                autoCapitalize={'none'}
                multiline={true}
                placeholder={'Example -> www.usgs.gov'}
                placeholderTextColor={themes.MEDIUMGREY}
                style={formStyles.fieldValue}
                onChangeText={text => setUrl(text)}
                textContentType={'URL'}
                keyboardType={'url'}
                value={url || ''}
              />
            </View>
          </ListItem.Content>
        </ListItem>
        {error && <Text style={formStyles.fieldError}>Not a valid url</Text>}
        <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
          <Button
            title={'Add Link'}
            titleStyle={{fontSize: themes.PRIMARY_TEXT_SIZE}}
            type={'clear'}
            disabled={url === ''}
            containerStyle={commonStyles.standardButtonContainer}
            onPress={() => saveUrl()}
          />
        </View>
        <View style={{flex: 1}}>
          <DataWrapper spot={spot} editable={true} urlData={true}/>
        </View>
      </View>
      <View style={{flex: 1}}>
        <View style={{paddingTop: 15}}>
          <SectionDivider dividerText={'Tables'}/>
          {Platform.OS === 'web'
            && (
              <input
                style={{display: 'none'}}
                id={'selectedCSV'}
                ref={inputRef}
                type={'file'}
                name={'.csv'}
                accept={'.csv'}
                onChange={handleFileChange}
                onClick={() => console.log('Canceled')}
              />
            )}
          <Button
            title={'Attach table from a .CSV file'}
            type={'outline'}
            icon={{name: 'attach-outline', type: 'ionicon'}}
            containerStyle={commonStyles.buttonPadding}
            buttonStyle={commonStyles.standardButton}
            titleStyle={commonStyles.standardButtonText}
            onPress={importCSVFile}
          />
        </View>
        <View style={{flex: 1}}>
          <DataWrapper spot={spot} editable={true} urlData={false}/>
        </View>
      </View>
    </View>
  );
};

export default ExternalData;
