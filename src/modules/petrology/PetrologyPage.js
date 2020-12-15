import React, {useState} from 'react';

import {ButtonGroup} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {NOTEBOOK_PAGES} from '../notebook-panel/notebook.constants';
import {setNotebookPageVisible} from '../notebook-panel/notebook.slice';
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import MineralsSubpage from './MineralsSubpage';
import ReactionsSubpage from './ReactionsSubpage';
import RockSubpage from './RockSubpage';
import TernarySubpage from './TernarySubpage';

const PetrologyPage = () => {
  const dispatch = useDispatch();

  const [subpageSelectedIndex, setSubpageSelectedIndex] = useState(0);
  const petSubPages = ['Rock', 'Minerals', 'Reactions', 'Ternary'];
  const spot = useSelector(state => state.spot.selectedSpot);

  const shouldShowTernary = () => {
    return spot.properties.pet && spot.properties.pet.igneous_rock_class
      && (spot.properties.pet.igneous_rock_class.includes('volcanic')
        || spot.properties.pet.igneous_rock_class.includes('plutonic'));
  };

  return (
    <React.Fragment>
      <ReturnToOverviewButton
        onPress={() => dispatch(setNotebookPageVisible(NOTEBOOK_PAGES.OVERVIEW))}
      />
      <ButtonGroup
        onPress={setSubpageSelectedIndex}
        selectedIndex={subpageSelectedIndex}
        buttons={shouldShowTernary() ? petSubPages : petSubPages.slice(0, -1)}
      />
      {subpageSelectedIndex === 0 && <RockSubpage/>}
      {subpageSelectedIndex === 1 && <MineralsSubpage/>}
      {subpageSelectedIndex === 2 && <ReactionsSubpage/>}
      {subpageSelectedIndex === 3 && <TernarySubpage/>}
    </React.Fragment>
  );
};

export default PetrologyPage;
