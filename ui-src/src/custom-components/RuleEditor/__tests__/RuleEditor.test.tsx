import React from 'react';
import renderer from 'react-test-renderer';
import RuleEditor from '../RuleEditor';
const renderTree = (tree) => renderer.create(tree);
describe('<RuleEditor>', () => {
  it('should render component', () => {
    expect(
      renderTree(
        <RuleEditor
          onPanelClosed={() => {}}
          showPanel={false}
          schedules={[]}
          selectedRule={{
            id: 'eee7d8eb-f966-4a23-8743-ec3452cd11ad',
            name: 'July 4th',
            isOpen: false,
            closedReason: 'holiday',
            dateRRule: 'RRULE:FREQ=YEARLY;BYMONTH=7;BYMONTHDAY=4',
            startDate: '2023-01-24',
            endDate: '2023-01-24',
            startTime: '2023-01-24',
            endTime: '2023-01-24',
          }}
          onUpdateRule={() => {}}
        />,
      ).toJSON(),
    ).toMatchSnapshot();
  });
});
