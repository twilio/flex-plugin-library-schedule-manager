import { styled } from '@twilio/flex-ui';
import React from 'react';

interface StatusBadgeProps {
  children: React.ReactNode;
}

export const StatusBadgeWrapper = styled('div')`
    background: rgb(255, 255, 255);
    outline: none;
    align-items: center;
    max-width: max-content;
    border-radius: 4px;
    display: flex;
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1rem;
    font-family: inherit;
    box-shadow: rgb(225, 227, 234) 0px 0px 0px 1px;
    padding: 0.25rem 0.5rem;
  }
`;
const StatusBadge: React.FC<StatusBadgeProps> = (props) => {
  const { children } = props;
  return <StatusBadgeWrapper>{children as NonNullable<React.ReactNode>}</StatusBadgeWrapper>;
};

export default StatusBadge;
