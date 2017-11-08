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
      fromTime: new Date(2017, 8, 9),
      toTime: new Date(2017, 11, 6)
    };
  }

  render() {
    return (
      <div className={styles.root}>
        <button
          style={{ display: 'none' }}
          onClick={e => {
            this.setState(state => ({
              fromTime: new Date(2017, 8, 17),
              toTime: new Date(2017, 8, 22)
            }));
          }}>
          Change range
        </button>
        <Graph data={DATA} fromTime={this.state.fromTime} toTime={this.state.toTime} />
      </div>
    );
  }
}

module.exports = App;
