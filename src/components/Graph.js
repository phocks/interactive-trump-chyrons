const React = require('react');
const d3 = require('d3-selection');
const transition = require('d3-transition');
const d3scale = require('d3-scale');
const d3shape = require('d3-shape');
const d3array = require('d3-array');
const d3axis = require('d3-axis');
const keys = require('object-keys');

const styles = require('./Graph.scss');

/**
 * Works out if either the start of this day or the start of the next day is close and round to it
 * @param {Date} date 
 * @returns {Date}
 */
function roundDate(date) {
  const d = new Date(date);

  // If its after the middle of the day then round to the next day
  if (d.getHours() >= 12) {
    d.setHours(d.getHours() + 12);
  }

  d.setHours(0);
  d.setMinutes(0);
  d.setSeconds(0);

  return d;
}

class Graph extends React.Component {
  constructor(props) {
    super(props);

    this.initGraph = this.initGraph.bind(this);
    this.updateGraph = this.updateGraph.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // TODO: Add any conditions that mitigate updating the graph
    this.updateGraph(nextProps);
  }

  shouldComponentUpdate() {
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

    const data = this.props.data.filter(r => {
      return r.seenAt.getTime() > new Date(2017, 8, 9).getTime();
    });

    this.svg = d3
      .select(this.wrapper)
      .append('svg')
      .attr('width', window.innerWidth)
      .attr('height', window.innerHeight);

    let margin = { top: 30, right: 20, bottom: 10, left: 20 };
    let width = +this.svg.attr('width') - margin.left - margin.right;
    let height = +this.svg.attr('height') - margin.top - margin.bottom;
    let g = this.svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    const channels = ['CNNW', 'MSNBCW', 'FOXNEWSW'];

    this.xScale = d3scale
      .scaleLinear()
      .rangeRound([0, width])
      .domain([0, 100]);

    this.yScale = d3scale
      .scaleTime()
      .rangeRound([0, height])
      .domain(d3array.extent(data, d => d.seenAt));

    const colours = d3scale.scaleOrdinal().range(['#fc3605', '#ffc711', '#25a']);

    this.highlight = g
      .append('rect')
      .attr('class', 'range-highlight')
      .attr('x', -100)
      .attr('y', 0)
      .attr('width', width + 200)
      .attr('height', 0)
      .attr('fill', '#eee');

    this.lines = {};
    channels.forEach(channel => {
      this.lines[channel] = g
        .append('path')
        .data([data])
        .attr('class', 'line-bbc')
        .attr('fill', 'none')
        .attr('stroke', colours(channel))
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('stroke-width', 1.5)
        .attr(
          'd',
          d3shape
            .line()
            .x(d => this.xScale(d[channel]))
            .y(d => this.yScale(d.seenAt))
        );
    });

    g
      .append('g')
      .call(d3axis.axisTop(this.xScale).ticks(2))
      .append('text')
      .attr('fill', '#999')
      .attr('transform', `translate(${width}, 0)`)
      .attr('text-anchor', 'end')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .text('% Trump coverage');

    var legend = g
      .append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .attr('text-anchor', 'end')
      .attr('transform', 'translate(0, 40)')
      .selectAll('g')
      .data(channels.slice())
      .enter()
      .append('g')
      .attr('transform', (d, i) => 'translate(0,' + i * 20 + ')');

    legend
      .append('rect')
      .attr('x', width - 19)
      .attr('width', 19)
      .attr('height', 19)
      .attr('fill', colours);

    legend
      .append('text')
      .attr('x', width - 24)
      .attr('y', 11)
      .attr('dy', '0.32em')
      .text(d => d.replace(/W$/, ''));
  }

  /**
   * Update the graph. It is important to only update this component through normal D3 methods.
   * @param {object} props The latest props given to this component
   */
  updateGraph(props) {
    if (!this.wrapper) return;

    if (props.fromDate) {
      let { fromDate, toDate } = props;
      if (!toDate) {
        toDate = new Date(fromDate);
        toDate.setDate(toDate.getDate() + 1);
      }

      const highlightHeight = this.yScale(toDate) - this.yScale(fromDate);
      this.highlight
        .transition()
        .duration(1000)
        .attr('y', this.yScale(fromDate) - highlightHeight / 2)
        .attr('height', highlightHeight);
    }
  }

  render() {
    return <div className={styles.wrapper} ref={el => (this.wrapper = el)} />;
  }
}

module.exports = Graph;
