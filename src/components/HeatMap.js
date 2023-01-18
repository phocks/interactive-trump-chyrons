const React = require('react');
const d3scale = require('d3-scale');
const d3array = require('d3-array');
const format = require('date-fns/format');

const styles = require('./HeatMap.scss').default;
const colours = [
  '#eeeeee',
  '#f3e5de',
  '#f8dbce',
  '#fbd1bd',
  '#fec7ad',
  '#ffbd9f',
  '#ffb48f',
  '#ffaa81',
  '#ffa071',
  '#ff9662',
  '#ff8c51',
  '#ff8040',
  '#ff752d',
  '#ff6814',
  '#f85f00',
  '#ee5b00',
  '#e45700',
  '#d85300',
  '#ce4f00',
  '#c44b00'
];

class HeatMap extends React.Component {
  constructor(props) {
    super(props);

    this.getColour = d3scale
      .scaleQuantize()
      .domain([0, 100])
      .range(colours);

    this.getY = d3scale
      .scaleTime()
      .rangeRound([100, -100])
      .domain(d3array.extent(props.data, d => d.seenAt));

    this.state = {
      y: -50 + this.getY(this.props.data[0].seenAt)
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.highlightDate !== nextProps.highlightDate) {
      const date = nextProps.highlightDate ? nextProps.highlightDate : this.props.data[0].seenAt;
      this.setState(state => ({
        y: -50 + this.getY(date)
      }));
    }
  }

  render() {
    const { data, highlightDate, zoom } = this.props;

    const y = zoom ? this.state.y : '-50';

    // Zoom chart in
    const wrapperStyle = {
      transform: `translate(-50%, ${y}%) scale(${zoom ? 2 : 0.5})`
    };

    // Labels inversely zoom
    const labelStyle = {
      transform: zoom ? '' : `scale(3) translate(-35%, 12%)`
    };

    return (
      <div ref={el => (this.wrapper = el)} className={`${styles.wrapper} ${this.props.className}`} style={wrapperStyle}>
        <table border="0" className={styles.table} style={{ width: '250px' }}>
          <tbody>
            {data.map((d, index) => {
              let date = '';
              if (highlightDate) {
                // Something is selected
                if (highlightDate.getTime() === d.seenAt.getTime()) {
                  date = format(d.seenAt, 'MMMM D');
                }
              } else if (index === 0 || index === data.length - 1) {
                date = format(d.seenAt, 'MMMM D');
              }

              return (
                <tr key={d.seenAt}>
                  <td className={`${styles.seen} ${date ? styles.selected : ''}`} style={labelStyle}>
                    {date}
                  </td>
                  <td
                    className={`${styles.box} ${date ? styles.selected : ''}`}
                    style={{ backgroundColor: this.getColour(d.BBCNEWS) }}
                  />
                  <td
                    className={`${styles.box} ${date ? styles.selected : ''}`}
                    style={{ backgroundColor: this.getColour(d.MSNBCW) }}
                  />
                  <td
                    className={`${styles.box} ${date ? styles.selected : ''}`}
                    style={{ backgroundColor: this.getColour(d.CNNW) }}
                  />
                  <td
                    className={`${styles.box} ${date ? styles.selected : ''}`}
                    style={{ backgroundColor: this.getColour(d.FOXNEWSW) }}
                  />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

module.exports = HeatMap;
