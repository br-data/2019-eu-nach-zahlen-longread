import * as d3 from 'd3';
import * as Sortable from 'sortablejs';

export default function Draw(options) {
  let $app;
  let $state;
  let $data;

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
    $data.user = d3.shuffle($data.current.slice());

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

    render();
  }

  function render() {
    $app.listParent = $app.container.select('.content')
      .append('ol');

    $app.list = $app.listParent.selectAll('li')
      .data($data.user)
      .enter()
      .append('li');

    $app.listButton = $app.list.append('div')
      .classed('button', true);

    $app.listButton.append('i')
      .classed('icon-move', true);

    $app.listButton.append('span')
      .text(d => d.key);

    $app.sortable = new Sortable($app.container.select('ol').node(), {
      animation: 150,
      ghostClass: 'moving'
    });

    $state.started = true;
  }

  function handleComplete() {

    if(!$state.completed) {
      $app.sortable.option('disabled', true);

      $app.list
        .select('i')
        .remove();

      $app.list
        .select('.button')
        .insert('strong', ':first-child')
        .text((d, i) => `${i+1}. `);

      $app.list
        .append('strong')
        .text(d => ` ${d.value} ${$data.data.config.unit}`);

      $app.list
        .sort((a, b) => {
          return d3.descending(a.value, b.value);
        });

      $app.paragraph
        .transition()
        .duration(1000)
        .style('opacity', 1);

      $state.completed = true;
    }
  }

  function handleReset() {

    $app.listParent.remove();
    render();

    $state.started = false;
    $state.completed = false;
  }

  function resize() {

  }

  // Public functions
  return {
    init,
    resize
  };
}

