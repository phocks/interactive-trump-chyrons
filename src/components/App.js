const React = require('react');
const styles = require('./App.scss');

const SmallMultiple = require('./SmallMultiple');

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
      fromDate: null,
      toDate: null,
      label: false
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

    if (config.from) {
      if (config.from === 'none') {
        this.setState(state => ({
          fromDate: null,
          toDate: null
        }));
      } else {
        this.setState(state => {
          const fromDate = stringToDate(config.from);
          const toDate = config.to ? stringToDate(config.to) : stringToDate(config.from, 2);

          return {
            fromDate,
            toDate
          };
        });
      }
    }

    if (config.label) {
      this.setState(state => ({
        label: config.label
      }));
    }
  }

  render() {
    return (
      <div className={styles.wrapper}>
        <SmallMultiple
          className={styles.graph}
          data={DATA}
          fromDate={this.state.fromDate}
          toDate={this.state.toDate}
          label={this.state.label}
        />
      </div>
    );
  }
}

module.exports = App;
