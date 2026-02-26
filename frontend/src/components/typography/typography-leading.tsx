type TypographyLeadingProps = {
  children: React.ReactNode;
};

const TypographyLeading = ({ children }: TypographyLeadingProps) => {
  return <p className="leading-7 [&:not(:first-child)]:mt-6">{children}</p>;
};

export default TypographyLeading;
