import {useSpotsHook} from '../../spots';

const useStratSection = (props) => {
  const [useSpots] = useSpotsHook();

  const getStratSectionSettings = (stratSectionId) => {
    const spot = useSpots.getSpotWithThisStratSection(stratSectionId);
    return spot && spot.properties && spot.properties.sed
    && spot.properties.sed.strat_section ? spot.properties.sed.strat_section : undefined;
  };

  return {
    getStratSectionSettings: getStratSectionSettings,
  };
};

export default useStratSection;
