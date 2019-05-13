import * as d3 from 'd3';

const Draw = options => {
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

  $pointer = 'M20.5 28.7h-11c-.5 0-.9-.4-.9-.9 0-1.4-.7-2.3-1.7-3.5-.5-.7-1.2-1.5-1.8-2.4-1.7-2.8-3.2-6-3.6-7.3-.4-1.3-.1-2 .2-2.4.4-.6 1.1-.9 1.9-.9 1.1 0 2.3.9 3.2 2.1V3.9c0-1.5 1.3-2.8 2.7-2.8 1.5 0 2.8 1.3 2.8 2.8v3.9c.3-.1.5-.2.9-.2 1 0 1.8.5 2.3 1.3.4-.2.9-.4 1.3-.4 1.3 0 2.3.9 2.6 2 .3-.1.6-.2 1-.2 1.5 0 2.8 1.3 2.8 2.8v2.8c0 2.3-.5 4.3-.9 6.1-.5 1.9-.9 3.6-.9 5.8.1.4-.4.9-.9.9zm-10.1-1.8h9.3c.1-2 .5-3.7.9-5.3.5-1.8.9-3.6.9-5.7V13c0-.5-.4-.9-.9-.9s-.9.4-.9.9v1c0 .5-.4.9-.9.9s-.9-.4-.9-.9v-2.9c0-.5-.4-.9-.9-.9s-.9.4-.9.9v2c0 .5-.4.9-.9.9s-.9-.4-.9-.9v-2.9c0-.5-.4-.9-.9-.9s-.9.4-.9.9v2c0 .5-.4.9-.9.9s-.9-.4-.9-.9V3.7c0-.5-.4-.9-.9-.9s-1.2.4-1.2.9v14c0 .5-.4.9-.9.9s-.9-.4-.9-.9V17c-.8-2.1-2.6-4-3.2-4-.2 0-.4.1-.4.2-.1.1-.1.4 0 .8.3 1 1.7 4 3.5 6.8.6.9 1.2 1.6 1.7 2.3.9 1.2 1.7 2.3 2 3.8z';

  $data = {};

  // Election years
  $data.elections = [2002, 2005, 2009, 2013, 2017];

  // Last German government coalitions
  $data.coalitions = [
    {
      text: 'Schröder II',
      values: [{ key: 2002 }, { key: 2005 }],
      colors: ['#e2001a', '#20ac00']
    }, {
      text: 'Merkel I',
      values: [{ key: 2005 }, { key: 2009 }],
      colors: ['#000', '#e2001a']
    }, {
      text: 'Merkel II',
      values: [{ key: 2009 }, { key: 2013 }],
      colors: ['#000', '#f4e000']
    }, {
      text: 'Merkel III',
      values: [{ key: 2013 }, { key: 2017 }],
      colors: ['#000', '#e2001a']
    }
  ];

  // Chancellorship of Gehard Schröder and Angela Merkel
  $data.labels = [
    {
      text: 'SCHRÖDER',
      color: '#102087',
      getYear() { return middleYear($data.previous); },
      getValue() { return $app.height - 20; }
    }, {
      text: 'MERKEL',
      color: '#000',
      getYear() { return middleYear($data.current); },
      getValue() { return $app.height - 20; }
    }
  ];

  function init() {
    // options.element = document.getElementById(`#${options.id}`);
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
    // $app.yMax = d3.max($data.data.values, function (d) { return d.value; }) * 1.5;
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
    $app.svg = $app.container.select('.content').append('svg')
      .attr('data-id', $app.id)
      .attr('xmlns', 'http://www.w3.org/2000/svg')
      .attr('version', '1.1')
      .attr('baseProfile', 'full');

    $app.defs = $app.svg.append('defs');

    // Clipping mask to hide the current (correct) line
    $app.clipRect = $app.defs.append('clipPath')
      .attr('id', `clip-${options.id}`)
      .append('rect');

    // Small circles to indicate the respective coaltion
    // $app.coalitions.group = $app.svg.append('g')
    //   .attr('class', 'coalitions')
    //   .selectAll('g')
    //   .data($data.coalitions)
    //   .enter()
    //   .append('g');

    // $app.coalitions.group.selectAll('circle')
    //   .data(({colors}) => colors)
    //   .enter()
    //   .append('circle');

    // Axis
    $app.xAxis.group = $app.svg.append('g')
      .attr('class', 'axis');

    $app.yAxis.group = $app.svg.append('g')
      .attr('class', 'grid');

    // Labels for the respective incumbents
    // $app.labels.group = $app.svg.append('g')
    //   .attr('class', 'labels')
    //   .selectAll('.label')
    //   .data($data.labels)
    //   .enter()
    //   .append('g');

    // $app.labels.group
    //   .append('text');

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

    render();
  }

  // Assign values (width, height, color) to the SVG elements
  function render() {

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
      .tickSize(-7)
      .tickPadding(10)
      .tickValues($data.elections)
      .tickFormat(d => d);

    $app.yAxisConstructor = d3.axisRight()
      .scale($app.y)
      .ticks(6)
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

    // Add a custom, extra long, line to the x-axis
    // $app.xAxis.group
    //   .select('path')
    //   .attr('d', $app.lineConstructor([
    //     { year: $data.elections[0], value: $app.yMax },
    //     { year: $data.elections[$data.elections.length - 1], value: $app.yMax }
    //   ]));

    $app.yAxis.group
      .call($app.yAxisConstructor);

    // Coalition circles
    // $app.coalitions.group
    //   .attr('class', ({text}) => dashcase(text))
    //   .attr('transform', ({values}) => `translate(${middleYear(values)},${$app.height + 17})`);

    // $app.coalitions.group.selectAll('circle')
    //   .attr('cx', (d, i) => i * 7) // Offset all circles by 7px
    //   .attr('r', 6)
    //   .attr('fill', d => d);

    // Fixed labels
    // $app.labels.group
    //   .attr('transform', d => `translate(${d.getYear()},${d.getValue()})`)
    //   .selectAll('text')
    //   .attr('fill', ({color}) => color)
    //   .attr('text-anchor', 'middle')
    //   .text(({text}) => text);

    // User line and marker
    $app.user.group
      .attr('opacity', $state.started ? 1 : 0); // Hide initially

    $app.user.group.line
      .attr('d', $state.started ? $app.lineConstructor($data.defined) : '');

    $app.user.group.highlight
      .attr('transform', $state.started ? translate($data.defined) : translate($data.previous))
      .style('opacity', $state.started ? 1 : 0); // Hide initially

    $app.user.group.highlight.pulse
      .attr('r', 4);

    $app.user.group.highlight.circle
      .attr('r', 4);

    $app.user.group.highlight.label
      .attr('dy', '-15')
      .attr('fill', '#888899')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'end');

    // Current (Merkel) line and marker
    $app.current.group.line.path.attr('d', $app.lineConstructor($data.current));

    $app.current.group.line.dots
      .attr('r', 4)
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

    // Previous (Schröder) line and maker
    $app.previous.group.line
      .attr('d', $app.lineConstructor($data.previous));

    $app.previous.group.dots
      .attr('r', 4)
      .attr('cx', key)
      .attr('cy', value);

    $app.previous.group.highlight
      .attr('transform', translate($data.previous));

    $app.previous.group.highlight.pulse
      .attr('r', 4)
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

    // Show pointer animation only in the first chart
    if ($app.id === 'arbeitslosenquote') {
      $app.hint.group.path
        .classed('move', true)
        .attr('transform', 'translate(5, 10)')
        .attr('d', $pointer);
    }

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

    render();
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

  // Get x value for the year between the first and last year
  function middleYear(objArr) {
    const first = firstYear(objArr);
    const last = lastYear(objArr);

    return $app.x(((last - first) / 2) + first);
  }

  // Get year from last object in an array
  function lastYear(objArr) {
    return objArr[objArr.length - 1].key;
  }

  // convert-to-dashcase
  function dashcase(string) {
    return string.replace(/\s+/g, '-')
      .toLowerCase()
      .replace('ä', 'ae')
      .replace('ö', 'oe')
      .replace('ü', 'ue')
      .replace('ß', 'ss')
      .replace(/[^a-z0-9-]/g, '');
  }

  // Clone a JavaScript object (doesn't work for functions)
  function clone(object) {
    return JSON.parse(JSON.stringify(object));
  }

  // Public functions
  return {
    init,
    render,
    update,
    reset: handleReset
  };
};

export default Draw;
