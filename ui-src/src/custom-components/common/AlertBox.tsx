import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalFooterActions,
  ModalHeader,
  ModalHeading,
} from '@twilio-paste/core';
import ScheduleManagerStrings, { StringTemplates } from '../../flex-hooks/strings/ScheduleManager';
import React from 'react';

interface AlertBoxProps {
  title: string;
  isOpen: boolean;
  handleClose: () => void;
  handleSubmit: () => void;
}

const AlertBox: React.FC<AlertBoxProps> = (props) => {
  const { isOpen, handleClose, handleSubmit, children, title } = props;
  return (
    <Modal ariaLabelledby={title} isOpen={isOpen} onDismiss={handleClose} size="default">
      <ModalHeader id="alert-header">
        <ModalHeading as="h3" id={title}>
          {title}
        </ModalHeading>
      </ModalHeader>
      <ModalBody>{children as NonNullable<React.ReactNode>}</ModalBody>
      <ModalFooter id="alert-footer">
        <ModalFooterActions>
          <Button variant="secondary" onClick={handleClose}>
            {ScheduleManagerStrings[StringTemplates.CANCEL_BUTTON]}
          </Button>
          <Button variant="destructive" onClick={handleSubmit}>
            {ScheduleManagerStrings[StringTemplates.DELETE_BUTTON]}
          </Button>
        </ModalFooterActions>
      </ModalFooter>
    </Modal>
  );
};

export default AlertBox;
