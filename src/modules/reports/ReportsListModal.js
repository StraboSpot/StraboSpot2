import React from 'react';

import {ReportsList} from '.';
import Modal from '../../shared/ui/modal/Modal';

const ReportsListModal = () => {

  return (
    <Modal>
      <ReportsList isCheckedList/>
    </Modal>
  );
};

export default ReportsListModal;
