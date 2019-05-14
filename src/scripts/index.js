import '../styles/index.scss';

import data from '../data/data.json';

import Draw from './custom/draw';

//import analytics from './modules/analytics';

document.addEventListener('DOMContentLoaded', () => {

  const charts = [];

  const etq = new Draw({
    id: 'erwerbstaetigenquote',
    data: data.filter(d => d.id === 'erwerbstaetigenquote')[0]
  });
  charts.push(etq);
  etq.init();

  const wald = new Draw({
    id: 'wald',
    data: data.filter(d => d.id === 'wald')[0]
  });
  charts.push(wald);
  wald.init();

  const populisten = new Draw({
    id: 'populisten',
    data: data.filter(d => d.id === 'populisten')[0]
  });
  charts.push(populisten);
  populisten.init();

  // analytics({
  //   serviceUrl: 'https://ddj.br.de/analytics/track',
  //   projectId: 'pestizide',
  //   tracker: {
  //     click: true,
  //     observer: true,
  //     timer: true,
  //     custom: true
  //   },
  //   respectDNT: true
  // });

  resize(charts);
});

function resize(charts) {
  let timeout;

  window.onresize = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      charts.forEach((chart) => {
        chart.resize();
      });
    }, 200);
  };
}
