import React from 'react';
import {FlatList, Text, View} from 'react-native';

import {Button} from 'react-native-elements';

import commonStyles from '../../shared/common.styles';
import AddButton from '../../shared/ui/AddButton';
import SectionDivider from '../../shared/ui/SectionDivider';
import {formStyles} from '../form';
import {useTagsHook} from '../tags';

const TagsNotebook = (props) => {

  const [useTags] = useTagsHook();

  return (
    <React.Fragment>
      <View style={{flex: 1, marginLeft: 10, maxHeight: 300}}>
        <SectionDivider dividerText={'Add New Tag'}/>
        <FlatList
          style={formStyles.formContainer}
          ListHeaderComponent={
            <View>
              {useTags.renderTagForm()}
            </View>
          }
        />
        <AddButton
          title={'Add Tag'}
          onPress={() => console.log('Pressed')}
        />
      </View>
      <View style={{flex: 1}}>
        <View style={commonStyles.dividerWithButton}>
          <SectionDivider dividerText={'Tags'}/>
          <Button
            title={'Add/remove'}
            type={'clear'}
            titleStyle={commonStyles.standardButtonText}
          />
        </View>
      </View>
    </React.Fragment>
  );
};

export default TagsNotebook;
