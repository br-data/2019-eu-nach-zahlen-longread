import { select } from 'd3-selection';
import { min, max, descending, shuffle } from 'd3-array';
import 'd3-transition';
import * as Sortable from 'sortablejs';

export default function Sort(options) {
  let $app = {};
  let $state = {};
  let $data = {};

  function init() {
    $app.id = options.id;
    $app.container = select(`#${options.id}`);
    $data.data = options.data;

    transform();
  }

  // Transform and filter the data for the current dataset
  function transform() {
    $data.current = $data.data.values.sort((a, b) =>
      descending(a.value, b.value)
    );
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
    $app.listParent = $app.container.select('.content')
      .append('ol');

    $app.list = $app.listParent.selectAll('li')
      .data($data.user)
      .enter()
      .append('li')
      .attr('data-id', (d, i) => i);

    $app.listButton = $app.list.append('div')
      .classed('button', true);

    $app.listButton.append('i')
      .classed('icon-move', true);

    $app.listButton.append('span')
      .text(d => d.key);

    $app.sortable = new Sortable($app.listParent.node(), {
      animation: 150,
      ghostClass: 'moving',
      dataIdAttr: 'data-id'
    });

    $state.started = true;
  }

  function handleComplete() {
    if (!$state.completed) {
      $data.userOrder = $app.sortable.toArray();

      $app.list.transition()
        .duration(200)
        .delay((d, i) => i * 150)
        .style('opacity', 0)
        .on('end', () => {
          setTimeout(handleTransition, 750);
        });

      $app.paragraph
        .transition()
        .duration(1000)
        .style('opacity', 1);
    }
  }

  function handleTransition() {
    $app.list.sort((a, b) => descending(a.value, b.value));

    $app.list.transition()
      .duration(200)
      .delay((d, i) => i * 150)
      .style('opacity', 1);

    $data.currentOrder = $app.sortable.toArray();
    $app.sortable.option('disabled', true);

    $app.list.select('i')
      .attr('class', (d, i) => {
        const userIndex = $data.userOrder.indexOf(`${i}`);
        const currentIndex = $data.currentOrder.indexOf(`${i}`);

        return (userIndex === currentIndex) ? 'icon-ok' : 'icon-cancel';
      });

    $app.list.select('span')
      .text((d, i) => `${$data.userOrder.indexOf(`${i}`) + 1}. ${d.key}: `)
      .append('strong')
      .text(d => ' ' + pretty(d.value));

    $state.completed = true;
  }

  function handleReset() {
    $app.listParent.remove();
    $state.started = false;
    $state.completed = false;

    render();
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
