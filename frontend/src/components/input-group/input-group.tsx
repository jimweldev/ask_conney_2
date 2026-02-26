interface InputGroupProps {
  className?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const InputGroup = ({ className, children, size = 'md' }: InputGroupProps) => {
  const getClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return '[&>*:first-child]:rounded-l-sm [&>*:last-child]:rounded-r-sm';
      case 'lg':
        return '[&>*:first-child]:rounded-l-lg [&>*:last-child]:rounded-r-lg';
      default:
        return '[&>*:first-child]:rounded-l-md [&>*:last-child]:rounded-r-md';
    }
  };

  return (
    <div
      className={`${className} flex [&>*]:rounded-none ${getClasses(
        size,
      )} [&>*:not(:last-child)]:border-r-0`}
    >
      {children}
    </div>
  );
};

export default InputGroup;
