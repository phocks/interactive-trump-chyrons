const React = require('react');
const renderer = require('react-test-renderer');

const StreamGraph = require('../StreamGraph');

describe('StreamGraph', () => {
  test('It renders', () => {
    const component = renderer.create(<StreamGraph />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
