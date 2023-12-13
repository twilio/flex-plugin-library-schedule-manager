import { AlertDialog, Box, Button, Stack } from '@twilio-paste/core';
import { EditIcon } from '@twilio-paste/icons/cjs/EditIcon';
import { DeleteIcon } from '@twilio-paste/icons/cjs/DeleteIcon';
import { CopyIcon } from '@twilio-paste/icons/cjs/CopyIcon';
import React, { Children, MouseEventHandler } from 'react';
import { Rule, Schedule } from '../../types/schedule-manager';
import { SidePanel } from '@twilio/flex-ui';

interface AlertBoxProps {
  title: string;
  isOpen: boolean;
  handleClose: () => void;
  handleSubmit: () => void;
//   children: NonNullable<React.ReactNode>;
}

const AlertBox: React.FC<AlertBoxProps> = (props) => {
  const { isOpen, handleClose, handleSubmit, children, title } = props;
  return (
    <AlertDialog
      heading={title}
      isOpen={isOpen}
      destructive
      onConfirm={handleSubmit}
      onConfirmLabel="Delete"
      onDismiss={handleClose}
      onDismissLabel="Cancel"
    >
      {children as NonNullable<React.ReactNode>}
    </AlertDialog>
  );
};

export default AlertBox;
