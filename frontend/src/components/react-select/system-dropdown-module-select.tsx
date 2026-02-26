import { AxiosError } from 'axios';
import { AsyncPaginate, type LoadOptions } from 'react-select-async-paginate';
import { toast } from 'sonner';
import type { ReactSelectOption } from '@/04_types/_common/react-select-option';
import type { SystemDropdownModule } from '@/04_types/system/system-dropdown-module';
import { mainInstance } from '@/07_instances/main-instance';

const SystemDropdownModuleSelect = ({ ...props }) => {
  const loadOptions: LoadOptions<
    ReactSelectOption,
    never,
    { page: number }
  > = async (searchQuery, _loadedOptions, additional = { page: 1 }) => {
    const page = additional.page || 1;

    try {
      const response = await mainInstance.get(
        `/select/system-dropdown-modules?page=${page}&search=${searchQuery}&sort=label`,
      );

      const options = response.data.records.map(
        (item: SystemDropdownModule) => ({
          value: item.label,
          label: item.label,
        }),
      );

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

      return {
        options: [],
        hasMore: false,
      };
    }
  };

  return (
    <AsyncPaginate
      className={
        props.size === 'sm'
          ? 'react-select-container-sm'
          : 'react-select-container'
      }
      classNamePrefix={props.size === 'sm' ? 'react-select-sm' : 'react-select'}
      loadOptions={loadOptions}
      debounceTimeout={200}
      additional={{
        page: 1,
      }}
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

export default SystemDropdownModuleSelect;
