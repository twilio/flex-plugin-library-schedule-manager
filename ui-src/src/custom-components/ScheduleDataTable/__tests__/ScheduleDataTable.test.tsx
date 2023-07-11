import React from 'react';
import renderer from 'react-test-renderer';
import { Schedule } from '../../../types/schedule-manager';
import ScheduleDataTable from '../ScheduleDataTable';

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
        />,
      ).toJSON(),
    ).toMatchSnapshot();
  });
});
