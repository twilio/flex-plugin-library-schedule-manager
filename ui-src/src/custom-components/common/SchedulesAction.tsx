import { Box, Button, Stack, Tooltip } from '@twilio-paste/core';
import { EditIcon } from '@twilio-paste/icons/cjs/EditIcon';
import { DeleteIcon } from '@twilio-paste/icons/cjs/DeleteIcon';
import { CopyIcon } from '@twilio-paste/icons/cjs/CopyIcon';
import React, { MouseEventHandler } from 'react';
import { Rule, Schedule } from '../../types/schedule-manager';

interface SchedulesAction {
  onCopy: () => void;
  onEdit: () => void;
  deleteDisabled: boolean;
  editDisabled: boolean;
  copyDisabled: boolean;
  onDelete: () => void;
}

const SchedulesAction: React.FC<SchedulesAction> = (props) => {
  const { onCopy, onEdit, onDelete, deleteDisabled, editDisabled, copyDisabled } = props;
  return (
    <Box display={'flex'} justifyContent={'flex-end'} marginRight={'space30'}>
      <Stack orientation="horizontal" spacing="space50">
        <Button
          variant="link"
          size="small"
          disabled={copyDisabled}
          onClick={() => {
            onCopy();
          }}
        >
          <CopyIcon decorative={true} size={'sizeIcon20'} title="Copy" color={'colorTextLink'} />
        </Button>
        <Button
          variant="link"
          size="small"
          disabled={editDisabled}
          onClick={() => {
            onEdit();
          }}
        >
          <EditIcon decorative={true} size={'sizeIcon20'} title="Edit" color={'colorTextLink'} />
        </Button>
        <Button
          variant="link"
          size="small"
          disabled={deleteDisabled}
          onClick={() => {
            onDelete();
          }}
        >
          <DeleteIcon decorative={true} size={'sizeIcon20'} title="Delete" color={'colorTextError'} />
        </Button>
      </Stack>
    </Box>
  );
};

export default SchedulesAction;
