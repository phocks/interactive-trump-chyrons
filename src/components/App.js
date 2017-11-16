const React = require('react');
const styles = require('./App.scss');

const Graph = require('./Graph');
const HeatMap = require('./HeatMap');
const Bar = require('./Bar');

const DATA = require('../data-daily-trump.json').map(r => {
  const [year, month, day] = r.seenAt.split('T')[0].split('-');
  r.seenAt = new Date(Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10)));
  return r;
});

function stringToDate(string, addDays) {
  string = string.toString();
  addDays = addDays || 0;

  const year = parseInt(string.substr(0, 4), 10);
  const month = parseInt(string.substr(4, 2), 10) - 1;
  const day = parseInt(string.substr(6, 2), 10);

  return new Date(Date.UTC(year, month, day + addDays));
}

class App extends React.Component {
  constructor(props) {
    super(props);

    this.onMark = this.onMark.bind(this);

    this.state = {
      zoom: false,
      hasLegend: false,
      fromDate: null,
      toDate: null,
      bbc: false
    };
  }

  componentDidMount() {
    window.addEventListener('mark', this.onMark);
  }

  componentWillUnmount() {
    window.removeEventListener('mark', this.onMark);
  }

  onMark(mark) {
    const { config } = mark.detail.activated;

    if (typeof config.legend !== 'undefined' && config.legend !== this.state.hasLegend) {
      this.setState(state => ({
        hasLegend: config.legend
      }));
    }

    if (config.from) {
      if (config.from === 'none') {
        this.setState(state => ({
          fromDate: null,
          toDate: null
        }));
      } else {
        this.setState(state => {
          const fromDate = stringToDate(config.from);
          const toDate = config.to ? stringToDate(config.to) : stringToDate(config.from, 1);

          return {
            fromDate,
            toDate
          };
        });
      }
    }

    if (typeof config.bbc !== 'undefined') {
      this.setState(state => ({ bbc: config.bbc }));
    }

    if (typeof config.zoom !== 'undefined') {
      this.setState(state => ({ zoom: config.zoom }));
    }
  }

  render() {
    // <Bar data={DATA} />

    // <Graph
    //   data={DATA}
    //   fromDate={this.state.fromDate}
    //   toDate={this.state.toDate}
    //   hasLegend={this.state.hasLegend}
    //   bbc={this.state.bbc}
    // />

    return (
      <div className={styles.wrapper}>
        <HeatMap className={styles.heatMap} data={DATA} highlightDate={this.state.fromDate} zoom={this.state.zoom} />
      </div>
    );
  }
}

module.exports = App;
