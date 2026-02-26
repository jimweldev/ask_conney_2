interface PageHeaderProps {
  className?: string;
  children: React.ReactNode;
}

const PageSubHeader = ({ className, children }: PageHeaderProps) => {
  return (
    <h4 className={`text-medium mb-1 font-medium ${className}`}>{children}</h4>
  );
};

export default PageSubHeader;
