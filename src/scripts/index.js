import '../styles/index.scss';

import data from '../data/data.json';

import Draw from './custom/draw';
import Sort from './custom/sort';
import Quiz from './custom/quiz';
import Guess from './custom/guess';

//import analytics from './modules/analytics';

window.addEventListener('load', () => {

  const charts = [];

  const erwerbstaetigenquote = new Draw({
    id: 'erwerbstaetigenquote',
    data: data.filter(d => d.id === 'erwerbstaetigenquote')[0]
  });
  charts.push(erwerbstaetigenquote);
  erwerbstaetigenquote.init();

  const populisten = new Draw({
    id: 'populisten',
    data: data.filter(d => d.id === 'populisten')[0]
  });
  charts.push(populisten);
  populisten.init();

  const jugendarbeitslosigkeit = new Sort({
    id: 'jugendarbeitslosigkeit',
    data: data.filter(d => d.id === 'jugendarbeitslosigkeit')[0]
  });
  charts.push(jugendarbeitslosigkeit);
  jugendarbeitslosigkeit.init();

  const prios = new Sort({
    id: 'prios',
    data: data.filter(d => d.id === 'prios')[0]
  });
  charts.push(prios);
  prios.init();

  const trust = new Guess({
    id: 'trust',
    data: data.filter(d => d.id === 'trust')[0]
  });
  charts.push(trust);
  trust.init();

  const treibhaus = new Sort({
    id: 'treibhaus',
    data: data.filter(d => d.id === 'treibhaus')[0]
  });
  charts.push(treibhaus);
  treibhaus.init();

  const auslaenderanteil = new Quiz({
    id: 'auslaenderanteil',
    data: data.filter(d => d.id === 'auslaenderanteil')[0]
  });
  charts.push(auslaenderanteil);
  auslaenderanteil.init();

  const age = new Quiz({
    id: 'age',
    data: data.filter(d => d.id === 'age')[0]
  });
  charts.push(age);
  age.init();

  const vegetarier = new Quiz({
    id: 'vegetarier',
    data: data.filter(d => d.id === 'vegetarier')[0]
  });
  charts.push(vegetarier);
  vegetarier.init();

  const spitzensteuer = new Sort({
    id: 'spitzensteuer',
    data: data.filter(d => d.id === 'spitzensteuer')[0]
  });
  charts.push(spitzensteuer);
  spitzensteuer.init();

  const asyl = new Draw({
    id: 'asyl',
    data: data.filter(d => d.id === 'asyl')[0]
  });
  charts.push(asyl);
  asyl.init();

  const teilzeit = new Sort({
    id: 'teilzeit',
    data: data.filter(d => d.id === 'teilzeit')[0]
  });
  charts.push(teilzeit);
  teilzeit.init();

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
