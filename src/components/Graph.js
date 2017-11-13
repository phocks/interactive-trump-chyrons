const React = require('react');
const d3 = require('d3-selection');
const transition = require('d3-transition');
const d3scale = require('d3-scale');
const d3shape = require('d3-shape');
const d3array = require('d3-array');
const d3axis = require('d3-axis');
const keys = require('object-keys');

const styles = require('./Graph.scss');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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

function getMargins() {
  let margins = {
    top: 80,
    right: 20,
    bottom: 40,
    left: 20
  };

  if (window.innerWidth > 800) {
    margins.left = 200;
    margins.right = window.innerWidth - 600;
  }

  return margins;
}

class Graph extends React.Component {
  constructor(props) {
    super(props);

    this.initGraph = this.initGraph.bind(this);
    this.updateHighlight = this.updateHighlight.bind(this);
    this.toggleLegend = this.toggleLegend.bind(this);
    this.toggleBBC = this.toggleBBC.bind(this);

    this.onResize = this.onResize.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.hasLegend !== nextProps.hasLegend) {
      this.toggleLegend(nextProps.hasLegend);
    }

    if (this.props.fromDate !== nextProps.fromDate || this.props.toDate !== nextProps.toDate) {
      this.updateHighlight(nextProps);
    }

    if (this.props.bbc !== nextProps.bbc) {
      this.toggleBBC(nextProps.bbc);
    }
  }

  shouldComponentUpdate() {
    return false;
  }

  componentDidMount() {
    this.initGraph(this.props);
    // Listen for resize
    window.addEventListener('resize', this.onResize);

    // Make sure the BBC legend box doesn't creep in
    this.toggleBBC(false);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  onResize() {
    this.svg.attr('width', window.innerWidth).attr('height', window.innerHeight);

    const margin = getMargins();
    let width = +this.svg.attr('width') - margin.left - margin.right;
    let height = +this.svg.attr('height') - margin.top - margin.bottom;
    this.g.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    this.xScale.rangeRound([0, width]);
    this.yScale.rangeRound([0, height]);

    this.highlight.attr('x', 0 - window.innerWidth).attr('width', window.innerWidth * 2);
    this.legend.select('rect').attr('x', width - 19);
    this.legend.select('text').attr('x', width - 24);
    this.lines.forEach(([channel, line]) => {
      line.attr(
        'd',
        d3shape
          .line()
          .x(d => this.xScale(d[channel]))
          .y(d => this.yScale(d.seenAt))
      );
    });

    this.xAxis.call(d3axis.axisTop(this.xScale).ticks(2));
    this.xAxisLabel.attr('transform', `translate(${width}, 0)`);
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

    const margin = getMargins();
    let width = +this.svg.attr('width') - margin.left - margin.right;
    let height = +this.svg.attr('height') - margin.top - margin.bottom;
    this.g = this.svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    this.channels = ['MSNBCW', 'CNNW', 'FOXNEWSW', 'BBCNEWS'];
    this.xScale = d3scale
      .scaleLinear()
      .rangeRound([0, width])
      .domain([0, 100]);
    this.yScale = d3scale
      .scaleTime()
      .rangeRound([0, height])
      .domain(d3array.extent(data, d => d.seenAt));

    const colours = d3scale.scaleOrdinal().range(['#ffc711', '#fc3605', '#25a', '#000']);

    this.highlight = this.g
      .append('rect')
      .attr('class', 'range-highlight')
      .attr('x', 0 - window.innerWidth)
      .attr('y', 0)
      .attr('width', window.innerWidth * 2)
      .attr('height', 0)
      .attr('fill', '#ccc');

    this.highlightLabel = this.g
      .append('text')
      .text('test')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 15)
      .attr('fill', '#aaa')
      .attr('transform', `translate(${width}, 0)`)
      .attr('text-anchor', 'end')
      .attr('y', 0)
      .attr('dy', '0.71em')
      .text('');

    this.lines = this.channels.map(channel => {
      return [
        channel,
        this.g
          .append('path')
          .data([data])
          .attr('class', `chart-line ${channel}`)
          .attr('data-channel', channel)
          .attr('fill', 'none')
          .attr('stroke', colours(channel))
          .attr('stroke-linejoin', 'round')
          .attr('stroke-linecap', 'round')
          .attr('stroke-width', 1.5)
          .attr('opacity', channel === 'BBCNEWS' ? 0 : 1)
          .attr(
            'd',
            d3shape
              .line()
              .x(d => this.xScale(d[channel]))
              .y(d => this.yScale(d.seenAt))
          )
      ];
    });

    this.xAxis = this.g.append('g').call(d3axis.axisTop(this.xScale).ticks(2));
    this.xAxisLabel = this.xAxis
      .append('text')
      .attr('fill', '#999')
      .attr('transform', `translate(${width}, 0)`)
      .attr('text-anchor', 'end')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .text('% Trump coverage');

    this.legend = this.g
      .append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .attr('text-anchor', 'end')
      .attr('transform', 'translate(20, 40)')
      .style('opacity', 0)
      .attr('class', 'legend')
      .selectAll('g')
      .data(this.channels.slice())
      .enter()
      .append('g')
      .attr('transform', (d, i) => 'translate(0,' + i * 20 + ')');
    this.legend
      .append('rect')
      .attr('class', d => d)
      .attr('x', width - 19)
      .attr('width', 19)
      .attr('height', 19)
      .attr('fill', colours);
    this.legend
      .append('text')
      .attr('class', d => d)
      .attr('x', width - 24)
      .attr('y', 11)
      .attr('dy', '0.32em')
      .text(d => {
        return d.replace(/W$/, '');
      });
  }

  updateHighlight(props) {
    if (!this.wrapper) return;

    if (props.fromDate) {
      let { fromDate, toDate } = props;

      const highlightHeight = this.yScale(toDate) - this.yScale(fromDate);
      this.highlight
        .transition()
        .duration(300)
        .attr('y', this.yScale(fromDate) - highlightHeight / 2)
        .attr('height', highlightHeight);

      if (window.innerWidth > 400) {
        this.highlightLabel
          .transition()
          .duration(300)
          .attr('y', this.yScale(toDate) + 5)
          .text(MONTHS[fromDate.getMonth()] + ' ' + fromDate.getDate());
      }
    } else {
      this.highlight.attr('y', 0).attr('height', 0);
      this.highlightLabel.attr('y', 0).text('');
    }
  }

  toggleLegend(hasLegend) {
    if (!this.wrapper) return;

    if (hasLegend) {
      this.g
        .select('.legend')
        .transition()
        .duration(300)
        .attr('transform', 'translate(0, 40)')
        .style('opacity', 1);
    } else {
      this.g
        .select('.legend')
        .transition()
        .duration(300)
        .attr('transform', 'translate(20, 40)')
        .style('opacity', 0);
    }
  }

  toggleBBC(showBBC) {
    this.g
      .selectAll('.BBCNEWS')
      .transition()
      .duration(800)
      .attr('opacity', showBBC ? 1 : 0);
  }

  render() {
    return <div className={styles.wrapper} ref={el => (this.wrapper = el)} />;
  }
}

module.exports = Graph;
