const React = require('react');
const renderer = require('react-test-renderer');

const Bar = require('../Bar');

describe('Bar', () => {
  test('It renders', () => {
    const component = renderer.create(<Bar />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
