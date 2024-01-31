import React from 'react';
import { render } from '@testing-library/react';
import RuleDataTable from '../RuleDataTable';

describe('<RuleDataTable>', () => {
  it('should render component', () => {
    expect(
      render(
        <RuleDataTable
          isLoading={true}
          rules={[]}
          schedules={[]}
          updateRules={() => {}}
          toaster={{ push: () => {}, pop: () => {} } as any}
        />,
      ),
    ).toMatchSnapshot();
  });
  it('should render component with props isLoading true and create rule button disabled', () => {
    const { getByTestId } = render(
      <RuleDataTable
        isLoading={true}
        rules={[]}
        schedules={[]}
        updateRules={() => {}}
        toaster={{ push: () => {}, pop: () => {} } as any}
      />,
    );
    expect(getByTestId('create-rule-btn').disabled).toBeTruthy();
  });
});
