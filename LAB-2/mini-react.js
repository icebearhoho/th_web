export function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: String(text),
      children: []
    }
  };
}

export function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...(props || {}),
      children: children
        .flat(Infinity)
        .filter((c) => c !== null && c !== undefined && c !== false)
        .map((child) =>
          typeof child === 'object' ? child : createTextElement(child)
        )
    }
  };
}

export function renderToDOM(vNode) {
  const dom =
    vNode.type === 'TEXT_ELEMENT'
      ? document.createTextNode(vNode.props.nodeValue)
      : document.createElement(vNode.type);

  Object.keys(vNode.props)
    .filter((key) => key !== 'children' && key !== 'nodeValue')
    .forEach((name) => {
      if (name.startsWith('on')) {
        dom.addEventListener(name.toLowerCase().substring(2), vNode.props[name]);
      } else {
        dom[name === 'className' ? 'className' : name] = vNode.props[name];
      }
    });

  vNode.props.children.forEach((child) => {
    dom.appendChild(renderToDOM(child));
  });

  return dom;
}