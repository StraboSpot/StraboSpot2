import {useSelector} from 'react-redux';

import {PAGE_KEYS, PET_PAGES, PRIMARY_PAGES, SECONDARY_PAGES, SED_PAGES} from './page.constants';

const usePage = () => {
  const isTestingMode = useSelector(state => state.project.isTestingMode);
  const spot = useSelector(state => state.spot.selectedSpot);

  const getRelevantGeneralPages = () => {
    return [...PRIMARY_PAGES, ...SECONDARY_PAGES].reduce((acc, page) => {
      return (!page.testing || (isTestingMode && page?.testing)) ? [...acc, page] : acc;
    }, []);
  };

  const getRelevantPetPages = () => {
    const petPagesWithSedRocks = [...PET_PAGES.slice(0, 3), SED_PAGES[0], ...PET_PAGES.slice(3, PET_PAGES.length)];
    return petPagesWithSedRocks.reduce((acc, page) => {
      return (!page.testing || (isTestingMode && page?.testing)) ? [...acc, page] : acc;
    }, []);
  };

  const getRelevantSedPages = () => {
    const sedPagesWithoutSedRocks = [...SED_PAGES.slice(1, SED_PAGES.length)];
    return sedPagesWithoutSedRocks.reduce((acc, page) => {
      if ((!page.testing || (isTestingMode && page?.testing))
        && (page.key !== PAGE_KEYS.STRAT_SECTION || (page.key === PAGE_KEYS.STRAT_SECTION
          && spot.properties?.surface_feature?.surface_feature_type !== 'strat_interval'))) {
        return [...acc, page];
      }
      return acc;
    }, []);
  };

  return {
    getRelevantGeneralPages: getRelevantGeneralPages,
    getRelevantPetPages: getRelevantPetPages,
    getRelevantSedPages: getRelevantSedPages,
  };
};

export default usePage;
