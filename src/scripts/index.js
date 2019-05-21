import '../styles/index.scss';

import dataset from '../data/data.json';

import draw from './custom/draw';
import sort from './custom/sort';
import quiz from './custom/quiz';
import guess from './custom/guess';

import analytics from './modules/analytics';

window.addEventListener('load', () => {

  const instances = [];
  const charts = { draw, sort, quiz, guess };

  const elements = Array.prototype.slice.call(
    document.querySelectorAll('.guessable')
  );

  elements.forEach(container => {
    const id = container.id;
    const data = dataset.filter(d => d.id === id)[0];

    if (data && data.type) {
      const instance = new charts[data.type]({id, data});
      instance.init();
      instances.push(instance);
    }
  });

  analytics({
    serviceUrl: 'https://ddj.br.de/analytics/track',
    projectId: 'eu-nach-zahlen',
    tracker: {
      click: true,
      observer: true,
      timer: true,
      custom: true
    },
    respectDNT: false
  });

  resize(instances);
});

function resize(instances) {
  let timeout;

  window.onresize = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      instances.forEach((instance) => {
        instance.resize();
      });
    }, 200);
  };
}
