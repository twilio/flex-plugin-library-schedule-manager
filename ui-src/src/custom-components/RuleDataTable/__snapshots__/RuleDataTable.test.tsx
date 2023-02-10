import React from 'react';
import renderer from 'react-test-renderer';
import RuleDataTable from '../RuleDataTable';
const renderTree = tree => renderer.create(tree);
describe('<RuleDataTable>', () => {
  it('should render component', () => {
    expect(renderTree(<RuleDataTable  
      isLoading={true}  
      rules={[]}  
      schedules={[]}  
      updateRules={() =>{}} 
    />).toJSON()).toMatchSnapshot();
  });
  it('should render component with props isLoading false', () => {
    expect(renderTree(<RuleDataTable  
      isLoading={false}  
      rules={[]}  
      schedules={[]}  
      updateRules={() =>{}} 
    />).toJSON()).toMatchSnapshot();
  });
});