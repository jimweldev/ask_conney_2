import { AxiosError } from 'axios';
import chroma from 'chroma-js';
import type { StylesConfig } from 'react-select';
import { AsyncPaginate, type LoadOptions } from 'react-select-async-paginate';
import { toast } from 'sonner';
import type { ReactSelectOption } from '@/04_types/_common/react-select-option';
import type { SystemDropdown } from '@/04_types/system/system-dropdown';
import { mainInstance } from '@/07_instances/main-instance';

interface Properties {
  color?: string;
  isDisabled?: boolean;
  type?: string;
}

interface ColourOption extends ReactSelectOption {
  properties?: Properties;
}

// TYPES
// circle
const circle = (color = 'transparent') => ({
  alignItems: 'center',
  display: 'flex',
  ':before': {
    backgroundColor: color,
    borderRadius: 10,
    content: '" "',
    display: 'block',
    marginRight: 8,
    height: 10,
    width: 10,
  },
});

const triangle = (color = 'transparent') => ({
  alignItems: 'center',
  display: 'flex',
  ':before': {
    content: '" "',
    display: 'block',
    marginRight: 8,
    width: 0,
    height: 0,
    borderLeft: '5px solid transparent',
    borderRight: '5px solid transparent',
    borderBottom: `10px solid ${color}`,
  },
});

const colourStyles: StylesConfig<ColourOption, true> = {
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    const safeColor = data?.properties?.color ?? '#2684FF';
    const chromaColor = chroma(safeColor);

    return {
      ...styles,
      // add types here
      ...(data?.properties?.type === 'circle' ? circle(safeColor) : {}), // circle
      ...(data?.properties?.type === 'triangle' ? triangle(safeColor) : {}), // triangle

      backgroundColor: isDisabled
        ? undefined
        : isSelected && data?.properties?.color
          ? data.properties.color
          : isFocused && data?.properties?.color
            ? chromaColor.alpha(0.15).css()
            : undefined,

      color: isDisabled
        ? '#ccc'
        : isSelected && data?.properties?.color
          ? chroma.contrast(chromaColor, 'white') > 2
            ? 'white'
            : 'black'
          : (data?.properties?.color ?? styles.color),

      textDecoration: isDisabled ? 'line-through' : 'none',
      cursor: isDisabled ? 'not-allowed' : 'default',
    };
  },

  multiValueLabel: (styles, { data }) => ({
    ...styles,
    // add types here
    ...(data?.properties?.type === 'circle'
      ? circle(data.properties.color)
      : {}), // circle
    ...(data?.properties?.type === 'triangle'
      ? triangle(data.properties.color)
      : {}), // triangle

    color: data?.properties?.color ?? styles.color,
    fontWeight: 600,
    textDecoration: data?.properties?.isDisabled ? 'line-through' : 'none',
  }),

  singleValue: (styles, { data }) => ({
    ...styles,
    // add types here
    ...(data?.properties?.type === 'circle'
      ? circle(data.properties.color)
      : {}), // circle
    ...(data?.properties?.type === 'triangle'
      ? triangle(data.properties.color)
      : {}), // triangle

    color: data?.properties?.color ?? styles.color,
    textDecoration: data?.properties?.isDisabled ? 'line-through' : 'none',
  }),
};

const SystemDropdownSelect = ({ ...props }) => {
  const loadOptions: LoadOptions<
    ColourOption,
    never,
    { page: number }
  > = async (searchQuery, _loadedOptions, additional = { page: 1 }) => {
    const page = additional.page || 1;

    try {
      const response = await mainInstance.get(
        `/select/system-dropdowns?page=${page}&search=${searchQuery}&sort=order,label&module=${props.module}&type=${props.type}`,
      );

      const options = response.data.records.map((item: SystemDropdown) => ({
        value: item.label,
        label: item.label,
        properties: item.properties,
        isDisabled: item.properties?.isDisabled ?? false,
      }));

      return {
        options,
        hasMore: response.data.meta.total_pages > page,
        additional: {
          page: page + 1,
        },
      };
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data?.message || error.message || 'An error occurred',
        );
      } else {
        toast.error('An unknown error occurred');
      }

      return { options: [], hasMore: false };
    }
  };

  return (
    <AsyncPaginate
      className="react-select-container"
      classNamePrefix="react-select"
      loadOptions={loadOptions}
      debounceTimeout={200}
      styles={colourStyles} // Apply the styles here
      additional={{ page: 1 }}
      {...(props.isMulti && {
        filterOption: (candidate: ReactSelectOption) => {
          const selectedValues = (props.value || []).map(
            (item: ReactSelectOption) => item.value,
          );
          return !selectedValues.includes(candidate.value);
        },
      })}
      {...props}
      closeMenuOnSelect={!props.isMulti}
    />
  );
};

export default SystemDropdownSelect;
