import { pretty } from './utils';

import { select } from 'd3-selection';
import { min, max } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import 'd3-transition';

export default function Guess(options) {
  let $app = {};
  let $state = {};
  let $data = {};
  let $config = {
    markerSize: 30 / 2
  };

  function init() {
    $app.id = options.id;
    $app.container = select(`#${options.id}`);
    $data.data = options.data;
    $config = Object.assign($config, options.data.config);

    transform();
  }

  // Transform and filter the data for the current dataset
  function transform() {
    $data.current = $data.data.values;

    calculate();
  }

  function calculate() {
    $app.yMin = min($data.current, (d) => d.value);
    $app.yMax = max($data.current, (d) => d.value);

    $app.scale = scaleLinear()
      .domain($config.range);

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

    $app.scale.range([
      $config.markerSize,
      $app.guess.node().getBoundingClientRect().width - $config.markerSize
    ]);

    $app.value = $app.guess.append('div')
      .classed('value', true)
      .style('left', `${$app.scale($config.initial)}px`);

    $app.valueText = $app.value.append('span')
      .text($config.initial);

    $app.droplet = $app.value.append('div')
      .classed('droplet', true);

    $app.input = $app.guess.append('input')
      .attr('type', 'range')
      .attr('steps', 1)
      .attr('value', 20)
      .attr('min', $config.range[0])
      .attr('max', $config.range[1])
      .on('input', handleInput);

    $app.tickmarks = $app.guess.append('div')
      .classed('ticks', true)
      .selectAll('div')
      .data($app.scale.ticks(5))
      .enter()
      .append('div')
      .text(d => `${pretty(d)} ${$config.unit}`);

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
      const value = $data.current[0].key;
      const offsetX = $app.scale(value);

      $app.input
        .attr('disabled', 'true');

      $app.value
        .transition()
        .duration(150)
        .style('left', `${offsetX}px`);

      $app.droplet
        .transition()
        .duration(150)
        .style('background', '#a6e207');

      $app.valueText.text(value);

      $app.paragraph
        .transition()
        .duration(1000)
        .style('opacity', 1);

      $state.completed = true;
    }
  }

  function handleReset() {
    $app.guess.selectAll('*').remove();
    render();

    $state.started = false;
    $state.completed = false;
  }

  function resize() {
    $app.scale.range([
      $config.markerSize,
      $app.guess.node().getBoundingClientRect().width - $config.markerSize
    ]);

    if ($state.completed) {
      $app.value.style('left', `${$app.scale($data.current[0].key)}px`);
    } else {
      $app.value.style('left', `${$app.scale($app.input.property('value'))}px`);
    }
  }

  // Public functions
  return {
    init,
    resize
  };
}
