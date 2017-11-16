const React = require('react');
const renderer = require('react-test-renderer');

const HeatMap = require('../HeatMap');

describe('HeatMap', () => {
  test('It renders', () => {
    const component = renderer.create(<HeatMap />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
