const React = require('react');
const d3 = require('d3-selection');
const d3scale = require('d3-scale');
const d3shape = require('d3-shape');
const d3collection = require('d3-collection');
const d3array = require('d3-array');
const d3interpolate = require('d3-interpolate');

const styles = require('./StreamGraph.scss');

const CHANNELS = ['BBCNEWS', 'MSNBCW', 'CNNW', 'FOXNEWSW'];
const getColour = d3scale.scaleOrdinal().range(['#ffc711', '#fc3605', '#25a', '#000']);

function key(data) {
  let result = {};

  CHANNELS.forEach(c => (result[c] = []));

  data.forEach(d => {
    CHANNELS.forEach(c => {
      result[c].push({
        date: d.seenAt,
        value: d[c]
      });
    });
  });

  return result;
}

function flatten(data) {
  let result = [];

  data.forEach(d => {
    CHANNELS.forEach(c => {
      result.push({ channel: c, date: d.seenAt, value: d[c] });
    });
  });

  return result;
}

class StreamGraph extends React.Component {
  constructor(props) {
    super(props);

    this.initGraph = this.initGraph.bind(this);
    this.updateGraph = this.updateGraph.bind(this);

    this.state = {
      data: key(props.data)
    };
  }

  componentWillReceiveProps(nextProps) {
    // TODO: Add any conditions that mitigate updating the graph
    this.updateGraph(nextProps);
  }

  shouldComponentUpdate() {
    // Stop Preact from managing the DOM itself
    return false;
  }

  componentDidMount() {
    this.initGraph(this.props);

    // TODO: add any listeners here
    // ...
  }

  componentWillUnmount() {
    // TODO: remove any listeners here
    // ...
  }

  /**
   * Initialize the graph
   * @param {object} props The latest props that were given to this component
   */
  initGraph(props) {
    if (!this.wrapper) return;

    // Adapted from https://bl.ocks.org/mbostock/4060954

    let n = 4; // number of layers
    let m = 67; // number of samples per layer
    let k = 100; // number of bumps per layer

    let b = CHANNELS.map(c => {
      return this.state.data[c].map(d => d.value);
    });

    let width = window.innerWidth;
    let height = window.innerHeight * 0.9;

    let stack = d3shape
      .stack()
      .keys(d3array.range(n))
      .offset(d3shape.stackOffsetWiggle);

    let layers = stack(d3array.transpose(b));

    let svg = d3
      .select(this.wrapper)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    let x = d3scale
      .scaleLinear()
      .domain([0, m - 1])
      .range([0, width]);

    let y = d3scale
      .scaleLinear()
      .domain([d3array.min(layers, stackMin), d3array.max(layers, stackMax)])
      .range([height, 0]);

    var area = d3shape
      .area()
      .x(function(d, i) {
        return x(i);
      })
      .y0(function(d) {
        return y(d[0]);
      })
      .y1(function(d) {
        return y(d[1]);
      });

    svg
      .selectAll('path')
      .data(layers)
      .enter()
      .append('path')
      .attr('d', area)
      .attr('fill', (d, i) => {
        return getColour(i);
      });

    function stackMax(layer) {
      return d3array.max(layer, function(d) {
        return d[1];
      });
    }

    function stackMin(layer) {
      return d3array.min(layer, function(d) {
        return d[0];
      });
    }

    function transition() {
      var t;
      d3
        .selectAll('path')
        .data(((t = layers1), (layers1 = layers), (layers0 = t)))
        .transition()
        .duration(2500)
        .attr('d', area);
    }
  }

  /**
   * Update the graph. It is important to only update this component through normal D3 methods.
   * @param {object} props The latest props given to this component
   */
  updateGraph(props) {
    if (!this.wrapper) return;

    // TODO: Use D3 to update the graph
  }

  render() {
    return <div className={styles.wrapper} ref={el => (this.wrapper = el)} />;
  }
}

module.exports = StreamGraph;
