import { pretty } from './utils';

import { select } from 'd3-selection';
import { min, max, shuffle } from 'd3-array';
import 'd3-transition';

export default function Quiz(options) {
  let $app = {};
  let $state = {};
  let $data = {};
  let $config = {};

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
    $data.user = shuffle($data.current.slice());

    calculate();
  }

  function calculate() {
    $app.yMin = min($data.current, (d) => d.value);
    $app.yMax = max($data.current, (d) => d.value);

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
    $app.quiz = $app.container.select('.content');

    $app.answers = $app.quiz.selectAll('div')
      .data($data.user)
      .enter()
      .append('div')
      .classed('button', true)
      .text(d => d.key)
      .on('click', handleComplete);

    $state.started = true;
  }

  function handleComplete(event) {
    if (!$state.completed) {

      if (event) {
        select(this)
          .classed('wrong', d => !d.correct);
      }

      $app.answers
        .classed('correct', d => d.correct)
        .text(d => `${d.key}: `)
        .append('strong')
        .text(d => `${pretty(d.value)} ${$config.unit}`);

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

  // Public functions
  return {
    init,
    resize
  };
}
