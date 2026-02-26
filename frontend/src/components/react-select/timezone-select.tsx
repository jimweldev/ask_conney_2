import ReactSelect from 'react-select';
import type { ReactSelectOption } from '@/04_types/_common/react-select-option';
import { timezones } from '@/data/timezones';
import { convertToGroupedTimezonesSelectOptions } from '@/lib/react-select/convert-to-grouped-timezones-select-options';
import { cn } from '@/lib/utils';

const TimezoneSelect = ({ ...props }) => {
  return (
    <ReactSelect
      className={cn('react-select-container', props.className)}
      classNamePrefix="react-select"
      options={convertToGroupedTimezonesSelectOptions(timezones)}
      isMulti={props.isMulti}
      closeMenuOnSelect={!props.isMulti}
      {...(props.isMulti && {
        filterOption: candidate => {
          const selectedValues = (props.value || []).map(
            (item: ReactSelectOption) => item.value,
          );
          return !selectedValues.includes(candidate.value);
        },
      })}
      {...props}
    />
  );
};

export default TimezoneSelect;
