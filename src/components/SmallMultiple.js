const React = require('react');
const d3 = require('d3-selection');
const transition = require('d3-transition');
const d3scale = require('d3-scale');
const d3array = require('d3-array');
const d3shape = require('d3-shape');
const format = require('date-fns/format');

const styles = require('./SmallMultiple.scss');

// Don't include the BBC
const CHANNELS = ['MSNBCW', 'CNNW', 'FOXNEWSW'];
const NAMES = ['MSNBC', 'CNN', 'Fox News'];
const COLOURS = ['#ffc711', '#fc3605', '#25a'];

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

    this.info = CHANNELS.map((c, i) => {
      return {
        key: c,
        pathFaded: this.g
          .append('path')
          .data([data.map(d => ({ seenAt: d.seenAt, value: d[c] }))])
          .attr('fill', getColour(c))
          .attr('opacity', 0.3)
          .attr('transform', `translate(${i * this.chartWidth})`)
          .attr(
            'd',
            d3shape
              .area()
              .x0(0)
              .x1(d => this.xScale(d.value))
              .y(d => this.yScale(d.seenAt))
          ),
        pathMasked: this.g
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
          ),

        label: this.g
          .append('text')
          .text('test')
          .attr('font-family', 'serif')
          .attr('font-size', 15)
          .attr('fill', '#000')
          .attr('text-anchor', 'middle')
          .attr('x', i * this.chartWidth + this.chartWidth / 2)
          .attr('y', -25)
          .attr('dy', '0.71em')
          .text(NAMES[i]),

        value: this.g
          .append('text')
          .attr('font-family', 'sans-serif')
          .attr('font-size', 18)
          .attr('fill', '#000')
          .attr('text-anchor', 'middle')
          .attr('x', i * this.chartWidth + this.chartWidth / 2)
          .attr('y', -25)
          .attr('dy', '0.71em')
          .text('')
      };
    });

    this.highlight = {
      top: this.g
        .append('rect')
        .attr('x', -10)
        .attr('width', this.actualWidth + 20)
        .attr('y', 0)
        .attr('height', 2.5)
        .attr('fill', '#AAB2B4')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.2),
      bottom: this.g
        .append('rect')
        .attr('x', -10)
        .attr('width', this.actualWidth + 20)
        .attr('y', this.actualHeight)
        .attr('height', 2.5)
        .attr('fill', '#AAB2B4')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.2),
      label: this.g
        .append('text')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 15)
        .attr('fill', '#AAB2B4')
        .attr('text-anchor', 'end')
        .attr('x', -20)
        .attr('y', 0)
        .attr('dy', '0.9em')
        .attr('opacity', 0)
        .text('')
    };

    this.dateLabels = {
      top: this.g
        .append('text')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 15)
        .attr('fill', '#AAB2B4')
        .attr('text-anchor', 'end')
        .attr('x', -20)
        .attr('y', 0)
        .attr('dy', '0.9em')
        .attr('opacity', 1)
        .text(format(data[0].seenAt, 'MMM D')),
      bottom: this.g
        .append('text')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 15)
        .attr('fill', '#AAB2B4')
        .attr('text-anchor', 'end')
        .attr('x', -20)
        .attr('y', this.yScale(data[data.length - 1].seenAt) - 15)
        .attr('dy', '0.9em')
        .attr('opacity', 1)
        .text(format(data[data.length - 1].seenAt, 'MMM D'))
    };
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
      const top = this.yScale(fromDate) - highlightHeight / 2;

      this.highlightMask
        .transition()
        .duration(300)
        .attr('y', top)
        .attr('height', highlightHeight);

      this.highlight.top
        .transition()
        .duration(300)
        .attr('y', top);
      this.highlight.bottom
        .transition()
        .duration(300)
        .attr('y', top + highlightHeight);
      this.highlight.label
        .transition()
        .duration(300)
        .attr('opacity', 1)
        .attr('y', top)
        .text(format(fromDate, 'MMM D'));

      this.dateLabels.top
        .transition()
        .duration(400)
        .attr('opacity', 0);
      this.dateLabels.bottom
        .transition()
        .duration(400)
        .attr('opacity', 0);

      const d = props.data.find(d => d.seenAt.getTime() === fromDate.getTime());

      this.info.forEach(info => {
        info.label
          .transition()
          .duration(400)
          .attr('y', this.yScale(fromDate) - 50);

        info.value
          .transition()
          .duration(350)
          .attr('opacity', 1)
          .attr('y', this.yScale(fromDate) - 30)
          .text(Math.round(d[info.key]) + '%');
      });
    } else {
      this.highlightMask
        .transition()
        .duration(300)
        .attr('y', 0)
        .attr('height', this.height);
      this.info.forEach(info => {
        info.label
          .transition()
          .duration(400)
          .attr('y', -25);
        info.value
          .transition()
          .duration(350)
          .attr('opacity', 0)
          .attr('y', 0);
      });

      this.highlight.top
        .transition()
        .duration(300)
        .attr('y', 0);
      this.highlight.bottom
        .transition()
        .duration(300)
        .attr('y', this.actualHeight);
      this.highlight.label
        .transition()
        .duration(300)
        .attr('opacity', 0);

      this.dateLabels.top
        .transition()
        .duration(400)
        .attr('opacity', 1);
      this.dateLabels.bottom
        .transition()
        .duration(400)
        .attr('opacity', 1);
    }
  }

  render() {
    return <div className={`${styles.wrapper} ${this.props.className}`} ref={el => (this.wrapper = el)} />;
  }
}

module.exports = SmallMultiple;
