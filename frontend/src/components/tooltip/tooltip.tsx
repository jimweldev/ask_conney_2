import {
  Tooltip as ToolTip,
  TooltipContent,
  TooltipTrigger,
} from '../ui/tooltip';

type TooltipProps = {
  children: React.ReactNode;
  content: React.ReactNode | string;
  delayDuration?: number;
};

const Tooltip = ({ children, content, delayDuration = 500 }: TooltipProps) => {
  return (
    <ToolTip delayDuration={delayDuration}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className="overflow-hidden">{content}</TooltipContent>
    </ToolTip>
  );
};

export default Tooltip;
