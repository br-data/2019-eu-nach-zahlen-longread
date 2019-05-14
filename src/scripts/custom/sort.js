import * as d3 from 'd3';
import * as Sortable from 'sortablejs';

export default function Draw(options) {
  let $config;
  let $app;
  let $state;
  let $pointer;
  let $data;

  $config = {
    height: 270,
    width: 658,
    breakpoint: 561
  };

  // Store for SVG elements and calculations
  $app = {
    previous: {},
    current: {},
    user: {},
    labels: {},
    coalitions: {},
    hint: {},
    xAxis: {},
    yAxis: {}
  };

  $state = {
    started: false,
    completed: false,
    evaluated: false,
    mobile: false
  };

  $data = {};

  function init() {
    $app.id = options.id;
    $app.container = d3.select(`#${options.id}`);
    $data.data = options.data;

    transform();
  }

  // Transform and filter the data for the current dataset
  function transform() {
    $data.current = $data.data.values.sort((a, b) =>
      d3[$data.data.config.order](a.value, b.value)
    );
    $data.user = [];

    calculate();
  }

  function calculate() {
    $app.yMin = d3.min($data.current, (d) => d.value);
    $app.yMax = d3.max($data.current, (d) => d.value);

    $app.y = d3.scaleLinear()
      .domain([$app.yMin, $app.yMax]);

    prepare();
  }

  function prepare() {
    $app.container.classed($data.data.type, true);

    $app.showButton = $app.container.select('button.show');
    $app.showButton.on('click', handleComplete);

    $app.resetButton = $app.container.select('button.reset');
    $app.resetButton.on('click', handleReset);

    $app.paragraph = $app.container.select('p.answer');

    $app.sort = $app.container.select('.content')
      .append('ol')
      .selectAll('li')
      .data($data.current)
      .enter()
      .append('li')
      .append('div')
      .classed('button', true);

    $app.sort.append('i')
      .classed('icon-move', true);

    $app.sort.append('span')
      .text(d => d.key);

    new Sortable($app.container.select('ol').node(), {
      animation: 150,
      ghostClass: 'moving'
    });
  }

  function handleComplete() {

  }

  function handleReset() {

  }

  function resize() {

  }

  // Public functions
  return {
    init,
    resize
  };
}

