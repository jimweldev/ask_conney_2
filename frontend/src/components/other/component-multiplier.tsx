import type { ReactNode } from 'react';

type ComponentMultipierProps = {
  count: number;
  component: ReactNode;
};

const ComponentMultipier = ({ count, component }: ComponentMultipierProps) => {
  return [...Array(count)].map((_, i) => <div key={i}>{component}</div>);
};

export default ComponentMultipier;
