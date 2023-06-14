import React from 'react';
import {FlatList, View} from 'react-native';

import {Button} from 'react-native-elements';

import SectionDivider from '../../shared/ui/SectionDivider';
import {MINERALS_BY_CLASS} from './petrology.constants';

const MineralsByRockClass = (props) => {
  return (
    <FlatList ListHeaderComponent={
      <View style={{flex: 1, flexDirection: 'column'}}>
        <View style={{flex: 1, flexDirection: 'row'}}>
          <View style={{flex: 1, alignItems: 'flex-start'}}>
            <SectionDivider dividerText={'Plutonic'}/>
            {MINERALS_BY_CLASS.plutonic.map(mineral => (
              <Button
                key={mineral.Name}
                title={'+ ' + mineral.Label}
                titleProps={{numberOfLines: 1}}
                type={'clear'}
                onPress={() => props.addMineral(mineral)}
              />
            ))}
          </View>
          <View style={{flex: 1, alignItems: 'flex-start'}}>
            <SectionDivider dividerText={'Metamorphic'}/>
            {MINERALS_BY_CLASS.metamorphic.map(mineral => (
              <Button
                key={mineral.Name}
                title={'+ ' + mineral.Label}
                titleProps={{numberOfLines: 1}}
                type={'clear'}
                onPress={() => props.addMineral(mineral)}
              />
            ))}
          </View>
        </View>
        <View style={{flex: 1, flexDirection: 'row'}}>
          <View style={{flex: 1, alignItems: 'flex-start'}}>
            <SectionDivider dividerText={'Volcanic'}/>
            {MINERALS_BY_CLASS.volcanic.map(mineral => (
              <Button
                key={mineral.Name}
                title={'+ ' + mineral.Label}
                titleProps={{numberOfLines: 1}}
                type={'clear'}
                onPress={() => props.addMineral(mineral)}
              />
            ))}
          </View>
          <View style={{flex: 1, alignItems: 'flex-start'}}>
            <SectionDivider dividerText={'Alteration, Ore'}/>
            {MINERALS_BY_CLASS.alteration_ore.map(mineral => (
              <Button
                key={mineral.Name}
                title={'+ ' + mineral.Label}
                titleProps={{numberOfLines: 1}}
                type={'clear'}
                onPress={() => props.addMineral(mineral)}
              />
            ))}
          </View>
        </View>
      </View>
    }/>
  );
};

export default MineralsByRockClass;
