import { Box, Button, Stack } from '@twilio-paste/core';
import { EditIcon } from '@twilio-paste/icons/cjs/EditIcon';
import { DeleteIcon } from '@twilio-paste/icons/cjs/DeleteIcon';
import { CopyIcon } from '@twilio-paste/icons/cjs/CopyIcon';
import React, { Children, MouseEventHandler } from 'react';
import { Rule, Schedule } from '../../types/schedule-manager';
import { SidePanel } from '@twilio/flex-ui';

interface EditorPanelProps {
  title: React.ReactChild;
  showPanel: boolean;
  onPanelClosed: () => void;
}

const EditorPanel: React.FC<EditorPanelProps> = (props) => {
  const { children, title, showPanel, onPanelClosed } = props;
  return (
    <SidePanel
      displayName="scheduleEditor"
      className="editor"
      isHidden={!showPanel}
      handleCloseClick={onPanelClosed}
      title={title}
    >
      {children}
    </SidePanel>
  );
};

export default EditorPanel;
