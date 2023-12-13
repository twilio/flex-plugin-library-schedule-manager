import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, Checkbox, Flex } from '@twilio-paste/core';
import { Text } from '@twilio-paste/core/text';
import { DeleteIcon } from '@twilio-paste/icons/cjs/DeleteIcon';
import { ChevronRightIcon } from '@twilio-paste/icons/cjs/ChevronRightIcon';
import { DragIcon } from '@twilio-paste/icons/cjs/DragIcon';
import React from 'react';

interface RuleDragHandleProps {
  name?: string;
  id: string;
  selected?: boolean;
  description?: string;
  onDelete: (id: string) => void;
}

export const RuleDragHandle = React.memo<RuleDragHandleProps>((props) => {
  const { name, id, onDelete } = props;
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
//   const [showDescription, setShowDescription] = React.useState<boolean>(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Box
      padding="space30"
      paddingLeft="space10"
      borderColor="colorBorderWeaker"
      borderStyle="solid"
      borderWidth="borderWidth10"
      backgroundColor="colorBackgroundBody"
      ref={setNodeRef}
      style={{ touchAction: 'none', ...style }}
      {...attributes}
    >
      <Flex hAlignContent="between" vAlignContent="center">
        <Box
          as="button"
          padding="space20"
          backgroundColor="colorBackgroundBody"
          border="none"
          {...listeners}
          cursor="pointer"
          data-test="drag-metric"
        >
          <DragIcon decorative={false} title="Drag handle" color="colorText" />
        </Box>
        <Flex grow>
          <Text as="p" marginLeft="space20" fontFamily="inherit" wordBreak="break-word" data-test="metric-name">
            {name}
          </Text>
        </Flex>
        <Box
          onClick={() => onDelete(id)}
          cursor="pointer"
          as="button"
          padding="space0"
          backgroundColor="colorBackgroundBody"
          border="none"
        >
          <DeleteIcon decorative={false} title="Delete" color={'colorTextError'}/>
        </Box>
      </Flex>
    </Box>
  );
});
