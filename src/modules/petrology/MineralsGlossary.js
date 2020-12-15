import React, {useState} from 'react';
import {FlatList, Linking, Text, View} from 'react-native';

import {Button} from 'react-native-elements';

import {isEmpty} from '../../shared/Helpers';
import * as themes from '../../shared/styles.constants';
import SaveAndCloseButton from '../../shared/ui/SaveAndCloseButtons';
import {MINERAL_GLOSSARY_INFO} from './petrology.constants';

const MineralsGlossary = (props) => {
  const [activeMineralInfo, setActiveMineralInfo] = useState({});

  const chunk = (input, size) => {
    return input.reduce((arr, item, idx) => {
      return idx % size === 0 ? [...arr, [item]] : [...arr.slice(0, -1), [...arr.slice(-1)[0], item]];
    }, []);
  };

  const glossaryChunked = chunk(MINERAL_GLOSSARY_INFO, Math.ceil((MINERAL_GLOSSARY_INFO.length + 1) / 3));

  const renderMineralInfo = () => {
    return (
      <View>
        <SaveAndCloseButton
          cancel={() => setActiveMineralInfo({})}
        />
        <View style={{paddingLeft: 10, paddingRight: 10}}>
          <Button
            title='+ Add this Mineral'
            type={'clear'}
            onPress={() => props.addMineral(activeMineralInfo)}
          />
          {Object.entries(activeMineralInfo).map(([field, value]) => {
            if (field === 'mindat.org link') {
              return (
                <Button
                  title={'Click here for more mineral information on ' + activeMineralInfo.Label + ' from Mindat.org'}
                  type={'clear'}
                  icon={{name: 'globe-outline', type: 'ionicon', color: themes.PRIMARY_ACCENT_COLOR}}
                  containerStyle={{padding: 10}}
                  onPress={() => Linking.openURL(value)}
                />
              );
            }
            else if (field !== 'Name') return <Text><Text style={{fontWeight: 'bold'}}>{field}:</Text> {value}</Text>;
          })}
        </View>
      </View>
    );
  };

  const renderMineralList = () => {
    return (
      <View>
        <SaveAndCloseButton
          cancel={() => props.showMineralsOverview()}
        />
        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-evenly'}}>
          {glossaryChunked.map((glossaryChunk) => (
            <View style={{flex: 1}}>
              {glossaryChunk.map(mineralInfo => (
                <Button
                  title={mineralInfo.Label}
                  type={'clear'}
                  onPress={() => setActiveMineralInfo(mineralInfo)}
                />
              ))}
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <React.Fragment>
      <FlatList ListHeaderComponent={
        isEmpty(activeMineralInfo) ? renderMineralList() : renderMineralInfo()
      }/>
    </React.Fragment>
  );
};

export default MineralsGlossary;
