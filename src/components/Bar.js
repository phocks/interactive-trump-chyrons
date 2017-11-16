const React = require('react');

const styles = require('./Bar.scss');

class Bar extends React.Component {
  render() {
    const { data } = this.props;

    const height = `${window.innerHeight / data.length}px`;

    return (
      <div className={styles.wrapper} style={{ height }}>
        {data.map(d => {
          // Temporarily remove BBC from the results
          delete d.BBCNEWS;

          return (
            <div key={d.seenAt} className={styles.bar}>
              {false && this.renderBit(d, d['BBCNEWS'], 'BBC', styles.bbc)}
              {this.renderBit(d, d['CNNW'], 'CNN', styles.cnn)}
              {this.renderBit(d, d['MSNBCW'], 'MSNBC', styles.msnbc)}
              {this.renderBit(d, d['FOXNEWSW'], 'FOX', styles.fox)}
            </div>
          );
        })}
      </div>
    );
  }

  renderBit(row, data, label, className) {
    const total = Object.values(row).reduce((t, v) => {
      return typeof v === 'number' ? t + v : t;
    }, 0);

    const width = data * 100 / total;

    return <div className={className} style={{ width: width + '%' }} />;
  }
}

module.exports = Bar;
