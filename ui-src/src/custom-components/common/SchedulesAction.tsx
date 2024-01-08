import { Box, Button, Stack, Tooltip } from '@twilio-paste/core';
import { EditIcon } from '@twilio-paste/icons/cjs/EditIcon';
import { DeleteIcon } from '@twilio-paste/icons/cjs/DeleteIcon';
import { CopyIcon } from '@twilio-paste/icons/cjs/CopyIcon';
import React from 'react';

interface SchedulesAction {
  onCopy: () => void;
  onEdit: () => void;
  deleteDisabled: boolean | undefined;
  editDisabled: boolean | undefined;
  copyDisabled: boolean | undefined;
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
          aria-label="Copy"
          disabled={copyDisabled}
          onClick={() => {
            onCopy();
          }}
        >
          <CopyIcon
            decorative={true}
            size={'sizeIcon20'}
            title="Copy"
            color={copyDisabled ? 'colorTextDecorative10' : 'colorTextLink'}
          />
        </Button>
        <Button
          variant="link"
          size="small"
          aria-label="Edit"
          disabled={editDisabled}
          onClick={() => {
            onEdit();
          }}
        >
          <EditIcon
            decorative={true}
            size={'sizeIcon20'}
            title="Edit"
            color={editDisabled ? 'colorTextDecorative10' : 'colorTextLink'}
          />
        </Button>
        <Button
          variant="link"
          size="small"
          aria-label="Delete"
          disabled={deleteDisabled}
          onClick={() => {
            onDelete();
          }}
        >
          <DeleteIcon
            decorative={true}
            size={'sizeIcon20'}
            title="Delete"
            color={deleteDisabled ? 'colorTextDecorative10' : 'colorTextError'}
          />
        </Button>
      </Stack>
    </Box>
  );
};

export default SchedulesAction;
