import React, {useState} from 'react';

import {ButtonGroup} from 'react-native-elements';
import {useDispatch} from 'react-redux';

import {NOTEBOOK_PAGES} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import MineralsSubpage from './MineralsSubpage';
import ReactionsSubpage from './ReactionsSubpage';
import RockSubpage from './RockSubpage';

const PetrologyPage = () => {
  const dispatch = useDispatch();

  const [subpageSelectedIndex, setSubpageSelectedIndex] = useState(0);
  const petSubPages = ['Rock', 'Minerals', 'Reactions'];

  return (
    <React.Fragment>
      <ReturnToOverviewButton
        onPress={() => dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.OVERVIEW))}
      />
      <ButtonGroup
        onPress={setSubpageSelectedIndex}
        selectedIndex={subpageSelectedIndex}
        buttons={petSubPages}
      />
      {subpageSelectedIndex === 0 && <RockSubpage/>}
      {subpageSelectedIndex === 1 && <MineralsSubpage/>}
      {subpageSelectedIndex === 2 && <ReactionsSubpage/>}
    </React.Fragment>
  );
};

export default PetrologyPage;
