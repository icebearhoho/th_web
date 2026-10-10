import { createElement, useState, renderApp } from './reactive-engine.js';

function TaskApp() {
  const [tasks, setTasks] = useState(['Review PR', 'Verify AST']);
  const [filter, setFilter] = useState('ALL');

  return createElement(
    'main',
    { className: 'app-container' },
    createElement(
      'header',
      null,
      createElement('h2', null, `Tasks: ${tasks.length}`)
    ),
    createElement(
      'button',
      {
        onClick: () => setTasks([...tasks, `Task ${Date.now()}`])
      },
      'Add Task'
    )
  );
}

const root = document.getElementById('app');
renderApp(TaskApp, root);