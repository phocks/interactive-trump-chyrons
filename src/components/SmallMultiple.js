const React = require('react');
const d3 = require('d3-selection');
const transition = require('d3-transition');
const d3scale = require('d3-scale');
const d3array = require('d3-array');
const d3shape = require('d3-shape');

const styles = require('./SmallMultiple.scss');

const CHANNELS = ['BBCNEWS', 'MSNBCW', 'CNNW', 'FOXNEWSW'];
const COLOURS = ['#000', '#ffc711', '#fc3605', '#25a'];
const getColour = channel => COLOURS[CHANNELS.indexOf(channel)];

class SmallMultiple extends React.Component {
  constructor(props) {
    super(props);

    this.initGraph = this.initGraph.bind(this);
    this.updateGraph = this.updateGraph.bind(this);

    this.updateHighlight = this.updateHighlight.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.updateGraph(nextProps);

    if (this.props.fromDate !== nextProps.fromDate || this.props.toDate !== nextProps.toDate) {
      this.updateHighlight(nextProps);
    }
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

    const { data } = this.props;

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    const margins = {
      top: this.height * 0.2,
      right: this.width * 0.3,
      bottom: this.height * 0.2,
      left: this.width * 0.3
    };

    this.actualWidth = this.width - margins.left - margins.right;
    this.actualHeight = this.height - margins.top - margins.bottom;

    this.chartWidth = this.actualWidth / CHANNELS.length;

    this.svg = d3
      .select(this.wrapper)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    this.g = this.svg.append('g').attr('transform', `translate(${margins.left}, ${margins.top})`);

    this.xScale = d3scale
      .scaleLinear()
      .rangeRound([0, this.chartWidth])
      .domain([0, 100]);
    this.yScale = d3scale
      .scaleTime()
      .rangeRound([0, this.actualHeight])
      .domain(d3array.extent(data, d => d.seenAt));

    this.highlightMask = this.svg
      .append('defs')
      .append('clipPath')
      .attr('id', 'highlight-mask')
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', this.width)
      .attr('height', this.actualHeight);

    CHANNELS.forEach((c, i) => {
      this.g
        .append('path')
        .data([data.map(d => ({ seenAt: d.seenAt, value: d[c] }))])
        .attr('fill', getColour(c))
        .attr('opacity', 0.4)
        .attr('transform', `translate(${i * this.chartWidth})`)
        .attr(
          'd',
          d3shape
            .area()
            .x0(0)
            .x1(d => this.xScale(d.value))
            .y(d => this.yScale(d.seenAt))
        );
      this.g
        .append('path')
        .data([data.map(d => ({ seenAt: d.seenAt, value: d[c] }))])
        .attr('fill', getColour(c))
        .attr('opacity', 1)
        .attr('transform', `translate(${i * this.chartWidth})`)
        .attr('clip-path', 'url(#highlight-mask)')
        .attr(
          'd',
          d3shape
            .area()
            .x0(0)
            .x1(d => this.xScale(d.value))
            .y(d => this.yScale(d.seenAt))
        );
    });
  }

  /**
   * Update the graph. It is important to only update this component through normal D3 methods.
   * @param {object} props The latest props given to this component
   */
  updateGraph(props) {
    if (!this.wrapper) return;

    // TODO: Use D3 to update the graph
  }

  updateHighlight(props) {
    if (!this.wrapper) return;

    if (props.fromDate) {
      let { fromDate, toDate } = props;

      const highlightHeight = this.yScale(toDate) - this.yScale(fromDate);
      this.highlightMask
        .transition()
        .duration(300)
        .attr('y', this.yScale(fromDate) - highlightHeight / 2)
        .attr('height', highlightHeight);

      // if (window.innerWidth > 400) {
      //   this.highlightLabel
      //     .transition()
      //     .duration(300)
      //     .attr('y', this.yScale(toDate) + 5)
      //     .text(MONTHS[fromDate.getMonth()] + ' ' + fromDate.getDate());
      // }
    } else {
      this.highlightMask
        .transition()
        .duration(300)
        .attr('y', 0)
        .attr('height', this.height);
      // this.highlightLabel.attr('y', 0).text('');
    }
  }

  render() {
    return <div className={`${styles.wrapper} ${this.props.className}`} ref={el => (this.wrapper = el)} />;
  }
}

module.exports = SmallMultiple;
