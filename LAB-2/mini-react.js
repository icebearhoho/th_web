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
        .filter((child) => child !== null && child !== undefined && child !== false)
        .map((child) =>
          typeof child === 'object' ? child : createTextElement(child)
        )
    }
  };
}