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
const NAMES = ['MSNBC', 'CNN', 'Fox'];
const COLOURS = ['#F58602', '#D53131', '#185393'];

const SERIF_FONT = 'ABCSerif,Book Antiqua,Palatino Linotype,Palatino,serif';
const SANS_SERIF_FONT = 'ABCSans,Helvetica,Arial,sans-serif';

const getColour = channel => COLOURS[CHANNELS.indexOf(channel)];

function getMargins() {
  if (window.innerWidth < 980) {
    // Scrims go over the chart
    return {
      top: window.innerHeight * 0.17,
      right: window.innerWidth * 0.1 + 25,
      bottom: window.innerHeight * 0.43,
      left: window.innerWidth * 0.27
    };
  } else {
    return {
      top: window.innerHeight * 0.3,
      right: window.innerWidth * 0.6 + 25,
      bottom: window.innerHeight * 0.3,
      left: window.innerWidth * 0.1
    };
  }
}

class SmallMultiple extends React.Component {
  constructor(props) {
    super(props);

    this.initGraph = this.initGraph.bind(this);
    this.updateHighlight = this.updateHighlight.bind(this);

    this.onResize = this.onResize.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.fromDate !== nextProps.fromDate || this.props.toDate !== nextProps.toDate) {
      this.updateHighlight(nextProps);
    }
  }

  shouldComponentUpdate() {
    return false;
  }

  componentDidMount() {
    this.initGraph(this.props);
    window.addEventListener('resize', this.onResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
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

    const margins = getMargins();

    this.actualWidth = this.width - margins.left - margins.right;
    this.actualHeight = this.height - margins.top - margins.bottom;

    this.chartHeight = this.actualHeight / CHANNELS.length;

    this.svg = d3
      .select(this.wrapper)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    this.g = this.svg.append('g').attr('transform', `translate(${margins.left}, ${margins.top})`);

    const max = data.reduce((m, current) => {
      return Math.max(m, current.MSNBCW, current.CNNW, current.FOXNEWSW);
    }, 0);

    this.xScale = d3scale
      .scaleTime()
      .rangeRound([0, this.actualWidth])
      .domain(d3array.extent(data, d => d.seenAt));
    this.yScale = d3scale
      .scaleLinear()
      .rangeRound([0, this.chartHeight])
      .domain([100, 0]);

    this.highlightMask = this.svg
      .append('defs')
      .append('clipPath')
      .attr('id', 'highlight-mask')
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', this.actualWidth)
      .attr('height', this.height);

    const scaleHeight = this.yScale(100 - max) + 2;
    this.info = CHANNELS.map((c, i) => {
      return {
        key: c,
        pathFaded: this.g
          .append('path')
          .data([data.map(d => ({ seenAt: d.seenAt, value: d[c] }))])
          .attr('fill', getColour(c))
          .attr('opacity', 0.2)
          .attr('transform', `translate(0, ${i * this.chartHeight})`)
          .attr(
            'd',
            d3shape
              .area()
              .x(d => this.xScale(d.seenAt))
              .y0(this.chartHeight)
              .y1(d => this.yScale(d.value))
          ),
        pathMasked: this.g
          .append('path')
          .data([data.map(d => ({ seenAt: d.seenAt, value: d[c] }))])
          .attr('fill', getColour(c))
          .attr('opacity', 1)
          .attr('transform', `translate(0, ${i * this.chartHeight})`)
          .attr('clip-path', 'url(#highlight-mask)')
          .attr(
            'd',
            d3shape
              .area()
              .x(d => this.xScale(d.seenAt))
              .y0(this.chartHeight)
              .y1(d => this.yScale(d.value))
          ),

        label: this.g
          .append('text')
          .text('test')
          .attr('font-family', SERIF_FONT)
          .attr('font-size', 16)
          .attr('fill', '#444444')
          .attr('text-anchor', 'end')
          .attr('x', -5)
          .attr('y', i * this.chartHeight + (window.innerWidth < 400 ? this.chartHeight / 3 : this.chartHeight / 2))
          .attr('dy', '0.71em')
          .text(NAMES[i]),

        value: this.g
          .append('text')
          .attr('font-family', SANS_SERIF_FONT)
          .attr('font-weight', 'bold')
          .attr('font-size', 25)
          .attr('fill', '#444444')
          .attr('text-anchor', 'end')
          .attr('x', -5)
          .attr(
            'y',
            i * this.chartHeight + (window.innerWidth < 400 ? this.chartHeight / 3 : this.chartHeight / 2) + 24
          )
          .attr('dy', '0.71em')
          .text(''),

        scale: this.g
          .append('rect')
          .attr('x', this.actualWidth)
          .attr('width', 2.5)
          .attr('y', i * this.chartHeight + this.chartHeight - scaleHeight + 3)
          .attr('height', this.yScale(100 - max))
          .attr('fill', '#AAB2B4')
          .attr('stroke', '#fff')
          .attr('stroke-width', 1.2),

        scaleMin: this.g
          .append('text')
          .attr('font-family', SANS_SERIF_FONT)
          .attr('font-size', 12)
          .attr('fill', '#AAB2B4')
          .attr('text-anchor', 'start')
          .attr('x', this.actualWidth + 6)
          .attr('y', i * this.chartHeight + this.chartHeight)
          .attr('dy', '0.2em')
          .text('0%'),
        scaleMax: this.g
          .append('text')
          .attr('font-family', SANS_SERIF_FONT)
          .attr('font-size', 12)
          .attr('fill', '#AAB2B4')
          .attr('text-anchor', 'start')
          .attr('x', this.actualWidth + 6)
          .attr('y', i * this.chartHeight + this.chartHeight - scaleHeight + 5)
          .attr('dy', '0.2em')
          .text(Math.round(max) + '%')
      };
    });

    // this.g
    //   .append('rect')
    //   .attr('x', this.actualWidth)
    //   .attr('width', 2.5)
    //   .attr('y', this.chartHeight - scaleHeight + 3)
    //   .attr('height', this.yScale(100 - max))
    //   .attr('fill', '#AAB2B4')
    //   .attr('stroke', '#fff')
    //   .attr('stroke-width', 1.2);

    // console.log('chart height', this.chartHeight);
    // console.log('max', max, '=>', this.yScale(100 - max));

    this.highlight = {
      start: this.g
        .append('rect')
        .attr('x', 0)
        .attr('width', 2.5)
        .attr('y', 10)
        .attr('height', this.actualHeight)
        .attr('fill', '#AAB2B4')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.2),
      end: this.g
        .append('rect')
        .attr('x', this.actualWidth)
        .attr('width', 2.5)
        .attr('y', 10)
        .attr('height', this.actualHeight)
        .attr('fill', '#AAB2B4')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.2),
      label: this.g
        .append('text')
        .attr('font-family', SANS_SERIF_FONT)
        .attr('font-size', 12)
        .attr('fill', '#AAB2B4')
        .attr('text-anchor', 'middle')
        .attr('x', 0)
        .attr('y', -10)
        .attr('dy', '0.9em')
        .attr('opacity', 0)
        .text('')
    };

    this.dateLabels = {
      start: this.g
        .append('text')
        .attr('font-family', SANS_SERIF_FONT)
        .attr('font-size', 12)
        .attr('fill', '#AAB2B4')
        .attr('text-anchor', 'middle')
        .attr('x', 0)
        .attr('y', -10)
        .attr('dy', '0.9em')
        .attr('opacity', 1)
        .text(format(data[0].seenAt, 'MMM D')),
      end: this.g
        .append('text')
        .attr('font-family', SANS_SERIF_FONT)
        .attr('font-size', 12)
        .attr('fill', '#AAB2B4')
        .attr('text-anchor', 'middle')
        .attr('x', this.xScale(data[data.length - 1].seenAt))
        .attr('y', -10)
        .attr('dy', '0.9em')
        .attr('opacity', 1)
        .text(format(data[data.length - 1].seenAt, 'MMM D'))
    };
  }

  updateHighlight(props) {
    if (!this.wrapper) return;

    if (props.fromDate) {
      let { fromDate, toDate } = props;

      const highlightWidth = this.xScale(toDate) - this.xScale(fromDate);
      const left = this.xScale(fromDate) - highlightWidth / 1.6;

      this.highlightMask
        .transition()
        .duration(300)
        .attr('x', left)
        .attr('width', highlightWidth);

      this.highlight.start
        .transition()
        .duration(300)
        .attr('x', left);
      this.highlight.end
        .transition()
        .duration(300)
        .attr('x', left + highlightWidth);
      this.highlight.label
        .transition()
        .duration(300)
        .attr('opacity', 1)
        .attr('x', left + highlightWidth / 2)
        .text(format(fromDate, 'MMM D'));

      this.dateLabels.start
        .transition()
        .duration(400)
        .attr('opacity', 0);
      this.dateLabels.end
        .transition()
        .duration(400)
        .attr('opacity', 0);

      const d = props.data.find(d => d.seenAt.getTime() === fromDate.getTime());

      this.info.forEach(info => {
        info.label
          .transition()
          .duration(400)
          .attr('x', this.xScale(fromDate) - 15);

        info.value
          .transition()
          .duration(400)
          .attr('opacity', 1)
          .attr('x', this.xScale(fromDate) - 15)
          .text(Math.round(d[info.key]) + '%');
      });
    } else {
      this.highlightMask
        .transition()
        .duration(300)
        .attr('x', 0)
        .attr('width', this.width);
      this.info.forEach(info => {
        info.label
          .transition()
          .duration(400)
          .attr('x', -5);
        info.value
          .transition()
          .duration(350)
          .attr('opacity', 0)
          .attr('x', 0);
      });

      this.highlight.start
        .transition()
        .duration(300)
        .attr('x', 0);
      this.highlight.end
        .transition()
        .duration(300)
        .attr('x', this.actualWidth);
      this.highlight.label
        .transition()
        .duration(300)
        .attr('opacity', 0);

      this.dateLabels.start
        .transition()
        .duration(400)
        .attr('opacity', 1);
      this.dateLabels.end
        .transition()
        .duration(400)
        .attr('opacity', 1);
    }
  }

  onResize() {
    if (!this.wrapper) return;

    const { data } = this.props;

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    const margins = getMargins();

    this.actualWidth = this.width - margins.left - margins.right;
    this.actualHeight = this.height - margins.top - margins.bottom;

    this.chartHeight = this.actualHeight / CHANNELS.length;

    this.svg.attr('width', this.width).attr('height', this.height);

    this.g.attr('transform', `translate(${margins.left}, ${margins.top})`);

    this.xScale.rangeRound([0, this.actualWidth]);
    this.yScale.rangeRound([0, this.chartHeight]);

    this.highlightMask.attr('height', this.height);

    this.info.forEach((c, i) => {
      c.pathFaded
        .data([data.map(d => ({ seenAt: d.seenAt, value: d[c.key] }))])
        .attr('transform', `translate(0, ${i * this.chartHeight})`)
        .attr(
          'd',
          d3shape
            .area()
            .x(d => this.xScale(d.seenAt))
            .y0(this.chartHeight)
            .y1(d => this.yScale(d.value))
        );
      c.pathMasked
        .data([data.map(d => ({ seenAt: d.seenAt, value: d[c.key] }))])
        .attr('transform', `translate(0, ${i * this.chartHeight})`)
        .attr(
          'd',
          d3shape
            .area()
            .x(d => this.xScale(d.seenAt))
            .y0(this.chartHeight)
            .y1(d => this.yScale(d.value))
        );
      c.label.attr('y', i * this.chartHeight + this.chartHeight / 2 + 10);
      c.value.attr('y', i * this.chartHeight + this.chartHeight / 2 + 30);
    });

    this.dateLabels.end.attr('x', this.xScale(data[data.length - 1].seenAt));

    this.updateHighlight(this.props);
  }

  render() {
    return <div className={`${styles.wrapper} ${this.props.className}`} ref={el => (this.wrapper = el)} />;
  }
}

SmallMultiple.defaultProps = {
  className: ''
};

module.exports = SmallMultiple;
