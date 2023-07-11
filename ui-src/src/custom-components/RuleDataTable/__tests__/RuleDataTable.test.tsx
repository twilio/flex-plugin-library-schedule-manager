import React from 'react';
import { render, getByTestId } from '@testing-library/react';
import RuleDataTable from '../RuleDataTable';
describe('<RuleDataTable>', () => {
  it('should render component', () => {
    expect(
      render(<RuleDataTable isLoading={true} rules={[]} schedules={[]} updateRules={() => {}} />),
    ).toMatchSnapshot();
  });
  it('should render component with props isLoading true and create rule button disabled', () => {
    const { getByTestId } = render(<RuleDataTable isLoading={true} rules={[]} schedules={[]} updateRules={() => {}} />);
    expect(getByTestId('create-rule-btn').disabled).toBeTruthy();
  });
});
