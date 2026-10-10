export interface SystemContract<TState, TEvent> {
  readonly state: Readonly<TState>;
  transition(event: TEvent): TState;
  verifyInvariants(): boolean;
}

export type VNodeType = string | ((props: Record<string, unknown>) => VNode);

export interface VNodeProps {
  [key: string]: unknown;
  children: VNode[];
  nodeValue?: string;
}

export interface VNode {
  readonly type: VNodeType;
  readonly props: VNodeProps;
}

export type StateUpdater<T> = T | ((prevState: T) => T);
export type Dispatch<T> = (value: StateUpdater<T>) => void;

export interface DOMWithVNode extends HTMLElement {
  __vnode?: VNode;
}

export interface Item {
  readonly id: string;
  readonly title: string;
}

export type ViewState<T> =
  | { readonly status: 'IDLE' }
  | { readonly status: 'LOADING' }
  | { readonly status: 'SUCCESS'; readonly data: T }
  | { readonly status: 'ERROR'; readonly error: string };