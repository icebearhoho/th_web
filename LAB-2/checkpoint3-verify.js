import { createElement, useState, renderApp } from './reactive-engine.js';

// Simulated API endpoint with toggleable error injection
let simulateFailure = false;

function fetchFeed() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (simulateFailure) {
        reject(new Error('Network Gateway Timeout: Unable to fetch items'));
      } else {
        resolve([
          { id: '1', title: 'Verify AST Tokenizer' },
          { id: '2', title: 'Audit Heap Snapshot Leaks' },
          { id: '3', title: 'Deploy Reactive State Machine' }
        ]);
      }
    }, 1200); // 1.2s delay to inspect skeleton screen
  });
}

function DataFeed() {
  const [state, setState] = useState({ status: 'IDLE' });

  const loadData = async () => {
    setState({ status: 'LOADING' });
    try {
      const items = await fetchFeed();
      setState({ status: 'SUCCESS', data: items });
    } catch (err) {
      setState({ status: 'ERROR', error: err.message });
    }
  };

  // State 1: IDLE
  if (state.status === 'IDLE') {
    return createElement(
      'main',
      { className: 'feed-container' },
      createElement('header', null, createElement('h2', null, 'Data Feed')),
      createElement(
        'button',
        { onClick: () => loadData() },
        'Fetch Data'
      )
    );
  }

  // State 2: LOADING (Pulsing Skeleton)
  if (state.status === 'LOADING') {
    return createElement(
      'main',
      { className: 'feed-container' },
      createElement('header', null, createElement('h2', null, 'Loading Data...')),
      createElement(
        'section',
        { className: 'skeleton-wrapper' },
        createElement('div', { className: 'skeleton-box skeleton-line' }),
        createElement('div', { className: 'skeleton-box skeleton-line' }),
        createElement('div', { className: 'skeleton-box skeleton-line' })
      )
    );
  }

  // State 3: SUCCESS (Rendered List)
  if (state.status === 'SUCCESS') {
    return createElement(
      'main',
      { className: 'feed-container' },
      createElement('header', null, createElement('h2', null, 'Feed Items')),
      createElement(
        'ul',
        { className: 'feed-list' },
        ...state.data.map((item) =>
          createElement('li', { key: item.id }, item.title)
        )
      ),
      createElement(
        'button',
        {
          onClick: () => {
            simulateFailure = !simulateFailure; // Toggles failure on next click for testing
            loadData();
          }
        },
        'Reload Feed (Toggle Error Test)'
      )
    );
  }

  // State 4: ERROR (Error Boundary with Retry Connection)
  if (state.status === 'ERROR') {
    return createElement(
      'main',
      { className: 'feed-container' },
      createElement('header', null, createElement('h2', null, 'Connection Alert')),
      createElement('p', { className: 'error-msg', role: 'alert' }, state.error),
      createElement(
        'button',
        {
          onClick: () => {
            simulateFailure = false; // Reset to success
            loadData();
          }
        },
        'Retry Connection'
      )
    );
  }
}

const root = document.getElementById('app');
renderApp(DataFeed, root);