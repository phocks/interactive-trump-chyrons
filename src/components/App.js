const React = require('react');
const styles = require('./App.scss');

const Graph = require('./Graph');

const DATA = require('../data-daily-trump.json').map(r => {
  r.seenAt = new Date(Date.parse(r.seenAt));
  return r;
});

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fromDate: null,
      toDate: null
    };
  }

  componentDidMount() {
    // TODO: listen for markers here and set the from and to
    // ...

    setTimeout(() => {
      this.setState(state => ({
        fromDate: new Date(2017, 10, 1),
        toDate: new Date(2017, 10, 10)
      }));

      setTimeout(() => {
        this.setState(state => ({
          fromDate: new Date(2017, 9, 4),
          toDate: new Date(2017, 9, 8)
        }));
      }, 1000);
    }, 1000);
  }

  render() {
    return (
      <div className={styles.root}>
        <Graph data={DATA} fromDate={this.state.fromDate} toDate={this.state.toDate} />
      </div>
    );
  }
}

module.exports = App;
