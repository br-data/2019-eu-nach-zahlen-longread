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

    $app.scale.range([16, $app.guess.node().getBoundingClientRect().width - 16]);

    $app.value = $app.guess.append('div')
      .classed('value', true)
      .style('left',
        `${$app.scale($data.data.config.initial)}px`);

    $app.valueText = $app.value.append('span')
      .text($data.data.config.initial);

    $app.value.append('div')
      .classed('droplet', true);

    $app.input = $app.guess.append('input')
      .attr('type', 'range')
      .attr('steps', 1)
      .attr('value', 20)
      .attr('min', $data.data.config.range[0])
      .attr('max', $data.data.config.range[1])
      .on('input', handleInput);

    $app.tickmarks = $app.guess.append('div')
      .classed('ticks', true)
      .selectAll('div')
      .data($app.scale.ticks(5))
      .enter()
      .append('div')
      .text(d => pretty(d));

    $state.started = true;
  }

  function handleInput() {
    const value = $app.input.property('value');
    const offsetX = $app.scale(value);

    $app.value.style('left', `${offsetX}px`);
    $app.valueText.text(value);
  }

  function handleComplete() {
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
    $app.scale.range([16, $app.guess.node().getBoundingClientRect().width - 16]);
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
