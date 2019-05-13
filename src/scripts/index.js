import '../styles/index.scss';

import data from '../data/data.json';
import analytics from './modules/analytics';

document.addEventListener('DOMContentLoaded', () => {

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
});

// function resize() {
//   let timeout;

//   window.onresize = () => {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => {
//       charts.forEach((chart) => {
//         chart.update();
//       });
//     }, 200);
//   };
// }
