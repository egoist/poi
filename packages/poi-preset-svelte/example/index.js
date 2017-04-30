import Counter from './counter';

const counter = new Counter({
  target: document.querySelector('#counter')
});

document.querySelector('#reset-counter').addEventListener('click', function() {
  counter.set({ count: 0 });
});
