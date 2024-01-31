import React from 'react';
import { render, waitFor } from '@testing-library/react';
import ScheduleEditor from '../ScheduleEditor';

jest.mock('@dnd-kit/core');
jest.mock('@dnd-kit/sortable');

describe('ScheduleEditor component', () => {
  test('renders correctly', () => {
    const editor = render(
      <ScheduleEditor
        rules={[]}
        showPanel={false}
        selectedSchedule={{
          name: 'Closed on Diwali',
          manualClose: false,
          timeZone: 'Asia/Kolkata',
          rules: ['947f978a-0196-40f0-998e-df4f3a78f1dc', 'aa7576fa-fa8e-474d-8414-3cbe222c8c57'],
          status: {
            isOpen: false,
            closedReason: 'closed',
          },
        }}
        onUpdateSchedule={() => {}}
        onPanelClosed={() => {}}
      />,
    );
    expect(editor).toMatchSnapshot();
  });
});
