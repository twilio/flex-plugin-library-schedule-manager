import { Manager, styled } from '@twilio/flex-ui';
import React from 'react';

interface StatusBadgeProps {
  children: React.ReactNode;
}

export const StatusBadgeWrapper = styled('div')<{ isLight: boolean | undefined }>`
    background: ${(props) => {
      if (props.isLight) return 'rgb(255, 255, 255)';
      return 'rgb(13, 19, 28)';
    }};
    color: ${(props) => {
      if (props.isLight) return 'inherit';
      return 'rgb(162, 246, 195)';
    }};
    outline: none;
    align-items: center;
    max-width: max-content;
    border-radius: 4px;
    display: flex;
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1rem;
    font-family: inherit;
    box-shadow: ${(props) => {
      if (props.isLight) return 'rgb(225, 227, 234) 0px 0px 0px 1px';
      return 'rgb(31, 48, 76) 0px 0px 0px 1px';
    }};
    padding: 0.25rem 0.5rem;
  }
`;
const StatusBadge: React.FC<StatusBadgeProps> = (props) => {
  const { children } = props;
  return (
    <StatusBadgeWrapper isLight={Manager.getInstance().store.getState().flex.config?.theme?.isLight}>
      {children as NonNullable<React.ReactNode>}
    </StatusBadgeWrapper>
  );
};

export default StatusBadge;
