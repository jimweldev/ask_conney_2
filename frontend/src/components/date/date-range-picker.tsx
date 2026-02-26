import { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import moment from 'moment';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type DateRangePickerProps = {
  date?: DateRange;
  setDate: (date: DateRange | undefined) => void;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
};

const DateRangePicker = ({
  date,
  setDate,
  size = 'default',
  className,
}: DateRangePickerProps) => {
  const [tempDate, setTempDate] = useState<DateRange | undefined>(date);
  const [open, setOpen] = useState(false);

  const handleApply = () => {
    setDate(tempDate); // commit the selection
    setOpen(false); // close the popover
  };

  const handleClear = () => {
    setTempDate(undefined);
    setDate(undefined);
    setOpen(false);
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            size={size}
            id="date"
            variant="outline"
            className={cn(
              'w-full justify-between bg-transparent text-left font-normal hover:bg-transparent',
              !date && 'text-muted-foreground',
            )}
          >
            {date?.from ? (
              date.to ? (
                <>
                  {moment(date.from).format('MMM DD, YYYY')} -{' '}
                  {moment(date.to).format('MMM DD, YYYY')}
                </>
              ) : (
                moment(date.from).format('MMM DD, YYYY')
              )
            ) : (
              <span>Pick a date</span>
            )}
            <CalendarIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={tempDate?.from}
            selected={tempDate}
            onSelect={setTempDate}
            numberOfMonths={2}
          />
          <div className="flex justify-end gap-2 p-3 pt-0">
            <Button onClick={handleClear} size="sm" variant="outline">
              Clear
            </Button>
            <Button onClick={handleApply} size="sm">
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangePicker;
