const React = require('react');
const renderer = require('react-test-renderer');

const SmallMultiple = require('../SmallMultiple');

describe('SmallMultiple', () => {
  test('It renders', () => {
    const component = renderer.create(<SmallMultiple />);
    
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
