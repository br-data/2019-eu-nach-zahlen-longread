import * as d3 from 'd3';

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

  $pointer = 'M12.6 26.5c-2.1 0-4-1.3-4.9-2.5-.5-.7-2.2-3.3-3.7-5.6-1.1-1.6-2.2-3.3-2.4-3.6v-.1c-.2-.4-.3-.8-.2-1.2.1-.4.4-.8.8-1.1.3-.2.7-.4 1.1-.4h.2c.6.1 1 .3 1.2.7l2.7 4V3c0-1 .9-1.9 1.9-1.9s1.9.9 1.9 1.9v9.8-3.6l.3-.2c.3-.2.6-.3 1-.3.7 0 1.4.5 1.7 1.1l.1.1v3-3.1l.3-.2c.4-.3.7-.4 1.1-.4.8 0 1.5.5 1.8 1.3v2.7-2.6l.3-.2c.3-.2.7-.4 1.1-.4 1 0 1.7.8 1.7 1.9v8.5c0 3.3-2.7 5.9-6 5.9h-2z';

  $data = {};

  function init() {
    $app.id = options.id;
    $app.container = d3.select(`#${options.id}`);
    $data.data = options.data;

    transform();
  }

  // Transform and filter the data for the current dataset
  function transform() {
    // All data from the previous incumbet (Schröder)
    $data.previous = $data.data.values.filter(d => d.key <= $data.data.config.breakpoint);
    // All data from the current incumbet (Merkel)
    $data.current = $data.data.values.filter(d => d.key >= $data.data.config.breakpoint);
    // Placeholder for the user data
    $data.user = clone($data.current).map((d, i) => {
      // Only set the value for the first data point
      d.value = i ? undefined : d.value;

      return d;
    });

    calculate();
  }

  // Calculate extrema and set element constructors
  function calculate() {
    $app.yMin = 0;
    $app.yMax = $data.data.config.max;
    $app.xMin = d3.min($data.data.values, d => d.key);
    $app.xMax = d3.max($data.data.values, d => d.key);

    $app.x = d3.scaleLinear()
      .domain([$app.xMin, $app.xMax]);

    $app.y = d3.scaleLinear()
      .domain([$app.yMin, $app.yMax]);

    $app.lineConstructor = d3.line()
      .x(key)
      .y(value);

    prepare();
  }

  // Add elements to SVG DOM once, link the datasets
  function prepare() {
    // UI elements
    $app.container.classed($data.data.type, true);

    $app.showButton = $app.container.select('button.show');
    $app.showButton.on('click', handleComplete);

    $app.resetButton = $app.container.select('button.reset');
    $app.resetButton.on('click', handleReset);

    $app.paragraph = $app.container.select('p.answer');

    // Container SVG
    $app.svg = $app.container.select('.content')
      .append('svg')
      .attr('data-id', $app.id)
      .attr('xmlns', 'http://www.w3.org/2000/svg')
      .attr('version', '1.1')
      .attr('baseProfile', 'full');

    $app.defs = $app.svg.append('defs');

    // Clipping mask to hide the current (correct) line
    $app.clipRect = $app.defs.append('clipPath')
      .attr('id', `clip-${options.id}`)
      .append('rect');

    // Axis
    $app.xAxis.group = $app.svg.append('g')
      .attr('class', 'x-axis');

    $app.yAxis.group = $app.svg.append('g')
      .attr('class', 'y-axis');

    // User line and label
    $app.user.group = $app.svg.append('g')
      .attr('class', 'user');

    $app.user.group.line = $app.user.group.append('path');
    $app.user.group.highlight = $app.user.group.append('g');
    $app.user.group.highlight.pulse = $app.user.group.highlight.append('circle');
    $app.user.group.highlight.circle = $app.user.group.highlight.append('circle');
    $app.user.group.highlight.label = $app.user.group.highlight.append('text');

    // Current (Merkel) line and labels
    $app.current.group = $app.svg.append('g')
      .attr('class', 'current');

    $app.current.group.line = $app.current.group.append('g')
      .attr('clip-path', `url(#clip-${options.id})`);

    $app.current.group.line.path = $app.current.group.line.append('path');

    $app.current.group.line.dots = $app.current.group.line.selectAll('dot')
      .data($data.current)
      .enter()
      .append('circle');

    $app.current.group.label = $app.current.group.append('text');

    // Previous (Schröder) line and labels
    $app.previous.group = $app.svg.append('g')
      .attr('class', 'previous');

    $app.previous.group.line = $app.previous.group.append('path');

    $app.previous.group.dots = $app.previous.group.selectAll('dot')
      .data($data.previous)
      .enter()
      .append('circle');

    $app.previous.group.highlight = $app.previous.group.append('g');
    $app.previous.group.highlight.pulse = $app.previous.group.highlight.append('circle');
    $app.previous.group.firstLabel = $app.previous.group.append('text');
    $app.previous.group.label = $app.previous.group.append('text');

    // Custom hint to tell the user what to do
    $app.hint.group = $app.svg.append('g')
      .attr('class', 'hint');

    $app.hint.group.text = $app.hint.group.append('text');
    $app.hint.group.path = $app.hint.group.append('path');

    // Interaction
    $app.drag = d3.drag()
      .on('drag', handleDrag);

    // Interactable area
    $app.canvas = $app.svg.append('rect')
      .attr('class', 'canvas')
      .on('touchmove', handleTouchmove)
      .on('click', handleDrag)
      .call($app.drag);

    resize();
  }

  // Assign values (width, height, color) to the SVG elements
  function resize() {

    // Set mobile view depending on screen width
    $state.mobile = window.innerWidth < $config.breakpoint;

    $app.width = $app.container.select('.content').node().getBoundingClientRect().width;
    $app.width = $app.width || $config.width;

    $app.height = $config.height;
    // $app.height = $app.height;

    // Recalculate
    $app.x.range([0, $app.width]);
    $app.y.range([$app.height, 0]);

    // Container
    $app.svg
      .attr('width', $app.width)
      .attr('height', $app.height + 30);

    // Hide the correct line initially, using the clipping mask
    $app.clipRect
      .attr('width', $state.completed ? $app.x($app.xMax) + 10 : $app.x(lastYear($data.previous)))
      .attr('height', $app.height);

    // Axis
    $app.xAxisConstructor = d3.axisBottom()
      .scale($app.x)
      .ticks(7)
      .tickSizeInner(-$app.height)
      .tickSizeOuter(0)
      .tickPadding(10)
      .tickFormat(d => d);

    $app.yAxisConstructor = d3.axisRight()
      .scale($app.y)
      .ticks(5)
      .tickSizeInner(-$app.width)
      .tickSizeOuter(0)
      .tickPadding(10)
      .tickFormat(d => $state.mobile ? '' : pretty(d));

    $app.yAxis.group
      .attr('transform', `translate(${$app.width},0)`);

    $app.xAxis.group
      .attr('transform', `translate(0,${$app.height})`)
      .call($app.xAxisConstructor)
      .selectAll('text')
      .attr('dx', $state.mobile ? '-10px' : 0)
      .attr('dy', $state.mobile ? '-6px' : '12px')
      .attr('transform', $state.mobile ? 'rotate(-90)' : 'rotate(0)')
      .style('text-anchor', smartAnchors);

    $app.yAxis.group
      .call($app.yAxisConstructor);

    // User line and marker
    $app.user.group
      .attr('opacity', $state.started ? 1 : 0); // Hide initially

    $app.user.group.line
      .attr('d', $state.started ? $app.lineConstructor($data.defined) : '');

    $app.user.group.highlight
      .attr('transform', $state.started ? translate($data.defined) : translate($data.previous))
      .style('opacity', $state.started ? 1 : 0); // Hide initially

    $app.user.group.highlight.pulse
      .attr('r', 5);

    $app.user.group.highlight.circle
      .attr('r', 5);

    $app.user.group.highlight.label
      .attr('dy', '-15')
      .attr('fill', '#888899')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'end');

    // Current line and marker
    $app.current.group.line.path.attr('d', $app.lineConstructor($data.current));

    $app.current.group.line.dots
      .attr('r', 5)
      .attr('cx', key)
      .attr('cy', value);

    $app.current.group.label
      .attr('transform', currentTranslate($data.current, $data.user)) // Smart labels
      .attr('dy', '-15')
      .attr('fill', 'black')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'end')
      .style('opacity', $state.completed ? 1 : 0) // Hide initially
      .text(pretty(lastValue($data.current)));

    // Previous line and maker
    $app.previous.group.line
      .attr('d', $app.lineConstructor($data.previous));

    $app.previous.group.dots
      .attr('r', 5)
      .attr('cx', key)
      .attr('cy', value);

    $app.previous.group.highlight
      .attr('transform', translate($data.previous));

    $app.previous.group.highlight.pulse
      .attr('r', 5)
      .classed('pulse', !$state.started && !$state.completed); // Hide initially

    $app.previous.group.label
      .attr('transform', previousTranslate($data.previous)) // Smart labels
      .attr('dy', '-15')
      .attr('fill', '#102087')
      .attr('font-weight', 'bold')
      .attr('text-anchor', $state.mobile ? 'start' : 'middle')
      .text(pretty(lastValue($data.previous)));

    $app.previous.group.firstLabel
      .attr('transform', firstTranslate($data.previous)) // Smart label
      .attr('dy', '-15')
      .attr('fill', '#102087')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'start')
      .text(pretty($data.previous[0].value));

    // Hint
    $app.hint.group
      .attr('transform', translate($data.previous))
      .style('opacity', ($state.completed || $state.started) ? 0 : 1); // Show initially

    $app.hint.group.text
      .attr('dx', 25)
      .attr('dy', 6)
      .attr('fill', '#889')
      .attr('text-anchor', 'start')
      .text('Zeichnen Sie die Linie'); // Draw the Line!

    // Show pointer animation
    $app.hint.group.path
      .classed('move', true)
      .attr('transform', 'translate(5, 10)')
      .attr('d', $pointer);

    // Users can interact in this area, nowhere else
    $app.canvas
      .attr('width', $app.width - $app.x(lastYear($data.previous)))
      .attr('height', $app.height)
      .attr('x', $app.x(lastYear($data.previous)) - 10)
      .style('opacity', '0')
      .style('cursor', 'pointer');
  }

  // Handle updates depending on the application state
  function update() {
    if (!$state.started) {
      handleStart();
    }

    if (!$state.completed) {
      handleChange();
    }

    if (!$state.completed && lastValue($data.user)) {
      handleComplete();
    }
  }

  function handleDrag() {
    if (!$state.completed) {
      const pos = d3.mouse(this);

      // Get year (x value) closest to the current cursor position
      const year = Math.max($data.data.config.breakpoint + 1,
        Math.min($app.xMax, $app.x.invert(pos[0]))
      );

      // Get year (y value) closest to the current cursor position
      const value = Math.max($app.yMin,
        Math.min($app.y.domain()[1], $app.y.invert(pos[1]))
      );

      // Update the user data with new values
      $data.user.forEach(d => {
        if (Math.abs(d.key - year) < 0.5) {
          d.value = value;
        }
      });

      // Store defined values in an extra object array (for faster lookups)
      $data.defined = $data.user.filter(d => d.value);

      update();
    }

    // Fix mobile scrolling
    if (d3.event.defaultPrevented) { return; }
    if (d3.event.sourceEvent) { d3.event.sourceEvent.stopPropagation(); }
  }

  // User starts drawing
  function handleStart() {
    $app.user.group
      .attr('opacity', 1);

    $app.user.group.highlight
      .style('opacity', 1);

    $app.user.group.highlight.pulse
      .classed('pulse', !$state.completed);

    $app.previous.group.highlight.pulse
      .classed('pulse', false);

    $app.hint.group
      .style('opacity', 0);

    $state.started = true;
  }

  // User keeps on drawing
  function handleChange() {
    $app.user.group.line
      .attr('d', $app.lineConstructor($data.defined));

    $app.user.group.highlight
      .attr('transform', translate($data.defined));

    $app.user.group.highlight.label
      .text(pretty(lastValue($data.defined)));
  }

  // User completes drawing
  function handleComplete() {
    $app.clipRect
      .transition()
      .duration(1000)
      .attr('width', $app.x($app.xMax) + 10);

    $app.hint.group
      .style('opacity', 0);

    $app.user.group.highlight.pulse
      .classed('pulse', false);

    $app.current.group.label
      .attr('transform', currentTranslate($data.current, $data.user))
      .transition()
      .duration(1000)
      .style('opacity', 1);

    $app.previous.group.highlight.pulse
      .classed('pulse', false);

    $app.paragraph
      .transition()
      .duration(1000)
      .style('opacity', 1);

    $app.canvas
      .style('cursor', 'auto');

    $state.completed = true;
  }

  // User resets the application
  function handleReset() {
    $state = {
      started: false,
      completed: false,
      evaluated: false,
      mobile: false
    };

    $data.user = clone($data.current).map((d, i) => {
      d.value = i ? undefined : d.value;

      return d;
    });

    resize();
  }

  // Handle mobile touch gesture (allow, disallow scrolling)
  function handleTouchmove() {
    if (!$state.completed) {
      d3.event.preventDefault();
    }

    return $state.completed;
  }

  // Set text anchors depending on the text position
  function smartAnchors(d, i) {
    if ($state.mobile) {
      return 'end';
    } else if (i === 0) {
      return 'start';
    } else if (i === 4) {
      return 'end';
    } else {
      return 'middle';
    }
  }

  // Returns translate property for SVG transforms
  function translate(xArr, yArr = xArr) {
    return `translate(${$app.x(lastYear(xArr))},${$app.y(lastValue(yArr))})`;
  }

  // Place lables above or under the line depending on the other labels.
  function previousTranslate(objArr) {
    let offset = 0;

    if (lastValue(objArr) < firstValue(objArr)) {
      offset = 40;
    }

    return `translate(${$app.x(lastYear(objArr))},${$app.y(lastValue(objArr)) + offset})`;
  }

  // Place lables above or under the line depending on the other labels.
  function firstTranslate(objArr) {
    let offset = 0;

    if (lastValue(objArr) > firstValue(objArr)) {
      offset = 40;
    }

    return `translate(${$app.x(firstYear(objArr))},${$app.y(firstValue(objArr)) + offset})`;
  }

  // Place lables above or under the line depending on the other labels.
  function currentTranslate(objArr, objArrComp) {
    let offset = 0;
    // var delta = Math.abs(y(lastValue(yArr1)) - y(lastValue(yArr2)));

    if (lastValue(objArrComp) > lastValue(objArr)) {
      offset = 40;
    }

    return `translate(${$app.x(lastYear(objArr))},${$app.y(lastValue(objArr)) + offset})`;
  }

  // Add German decimal seperators to number
  function pretty(number) {
    let string = Math.round(number).toString().split('.');
    string = string[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (string[1] ? `,${string[1]}` : '');

    string = `${string} ${$data.data.config.unit}`;

    return string;
  }

  // Get x value for year
  function key(d) {
    return $app.x(d.key);
  }

  // Get y value for value
  function value(d) {
    return $app.y(d.value);
  }

  // Get value from firts object in an array
  function firstValue(objArr) {
    return objArr[0].value;
  }

  // Get value from last object in an array
  function lastValue(objArr) {
    return objArr[objArr.length - 1].value;
  }

  function firstYear(objArr) {
    return objArr[0].key;
  }

  // Get year from last object in an array
  function lastYear(objArr) {
    return objArr[objArr.length - 1].key;
  }

  // Clone a JavaScript object (doesn't work for functions)
  function clone(object) {
    return JSON.parse(JSON.stringify(object));
  }

  // Public functions
  return {
    init,
    resize
  };
}
