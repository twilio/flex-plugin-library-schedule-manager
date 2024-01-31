import React from 'react';
import renderer from 'react-test-renderer';
import { Schedule } from '../../../types/schedule-manager';
import ScheduleDataTable from '../ScheduleDataTable';

jest.mock('@dnd-kit/core');
jest.mock('@dnd-kit/sortable');

const renderTree = (tree) => renderer.create(tree);
describe('<ScheduleDataTable>', () => {
  it('should render component', () => {
    expect(
      renderTree(
        <ScheduleDataTable
          isLoading={false}
          rules={[]}
          schedules={[]}
          updateSchedules={(schedules: Schedule[]) => {}}
          updated={new Date()}
          toaster={{ showToast: () => {}, hideToast: () => {} }}
        />,
      ).toJSON(),
    ).toMatchSnapshot();
  });
});
