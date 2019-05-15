import * as d3 from 'd3';

export default function Draw(options) {
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
        d3.select(this)
          .classed('wrong', d => !d.correct);
      }

      $app.answers
        .classed('correct', d => d.correct)
        .text(d => `${d.key}: `)
        .append('strong')
        .text(d => pretty(d.value));

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
