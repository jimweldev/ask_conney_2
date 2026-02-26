import { cx } from 'class-variance-authority';

interface PageHeaderProps {
  className?: string;
  children: React.ReactNode;
}

const PageHeader = ({ className, children }: PageHeaderProps) => {
  return (
    <h2 className={cx('text-2xl font-semibold', className)}>{children}</h2>
  );
};

export default PageHeader;
