import * as d3 from 'd3';

export default function Guess(options) {
  let $app = {};
  let $state = {};
  let $data = {};

  function init() {
    $app.id = options.id;
    $app.container = d3.select(`#${options.id}`);
    $data.data = options.data;

    transform();
  }

  // Transform and filter the data for the current dataset
  function transform() {
    $data.current = $data.data.values;

    calculate();
  }

  function calculate() {
    $app.yMin = d3.min($data.current, (d) => d.value);
    $app.yMax = d3.max($data.current, (d) => d.value);

    $app.scale = d3.scaleLinear()
      .domain($data.data.config.range);

    prepare();
  }

  function prepare() {
    $app.container.classed($data.data.type, true);

    $app.showButton = $app.container.select('button.show');
    $app.showButton.on('click', handleComplete);

    $app.resetButton = $app.container.select('button.reset');
    $app.resetButton.on('click', handleReset);

    $app.paragraph = $app.container.select('p.answer');

    render();
  }

  function render() {
    $app.guess = $app.container.select('.content');

    $app.input = $app.guess.append('input')
      .attr('type', 'range')
      .attr('value', $data.data.config.range[0])
      .attr('min', $data.data.config.range[0])
      .attr('max', $data.data.config.range[1])
      .attr('list', `ticks-${$data.data.id}`);

    $app.tickmarks = $app.guess.append('datalist')
      .attr('id', `ticks-${$data.data.id}`)
      .selectAll('option')
      .data($app.scale.ticks(10))
      .enter()
      .append('option')
      .attr('value', d => d)
      .attr('label', (d, i, p) => {
        console.log(d, i, p.length);

        if (i === 0 || i+1 === p.length) {
          return d;
        }
      });

  // <input type="range" list="tickmarks">

  // <datalist id="tickmarks">
  //   <option value="0" label="0%">
  //   <option value="10">
  //   <option value="20">
  //   <option value="30">
  //   <option value="40">
  //   <option value="50" label="50%">
  //   <option value="60">
  //   <option value="70">
  //   <option value="80">
  //   <option value="90">
  //   <option value="100" label="100%">
  // </datalist>

    $state.started = true;
  }

  function handleComplete(event) {
    if (!$state.completed) {

      $app.paragraph
        .transition()
        .duration(1000)
        .style('opacity', 1);

      $state.completed = true;
    }
  }

  function handleReset() {

    $app.answers.remove();
    render();

    $state.started = false;
    $state.completed = false;
  }

  function resize() {

  }

  function pretty(number) {
    let string = Math.round(number).toString().split('.');
    string = string[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (string[1] ? `,${string[1]}` : '');

    return `${string} ${$data.data.config.unit}`;
  }

  // Public functions
  return {
    init,
    resize
  };
}
