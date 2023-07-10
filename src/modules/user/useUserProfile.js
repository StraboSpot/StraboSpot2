import {useSelector} from 'react-redux';

import {isEmpty, truncateText} from '../../shared/Helpers';

const useUserProfile = () => {
  const userData = useSelector(state => state.user);
  const customDatabaseEndpoint = useSelector(state => state.project.databaseEndpoint);

  const getInitials = () => {
    return userData.name.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
  };

  const getName = () => {
    let name = '';
    if (customDatabaseEndpoint.isSelected) name = userData.name.split(' ')[0];
    else !isEmpty(userData.name) ? name = userData.name : 'Guest';
    return name;
  };

  const getEmail = () => {
    let email = '';
    !customDatabaseEndpoint.isSelected && !isEmpty(userData.email) && truncateText(userData.email, 16);
    return email;
  };

  return {
    getEmail: getEmail,
    getInitials: getInitials,
    getName: getName,
  };
};

export default useUserProfile;
