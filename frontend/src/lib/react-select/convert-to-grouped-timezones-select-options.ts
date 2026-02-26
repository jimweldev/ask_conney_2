type SelectOption = {
  label: string;
  value: string;
};

type GroupedSelectOption = {
  label: string;
  options: SelectOption[];
};

export const convertToGroupedTimezonesSelectOptions = (
  timezones: readonly string[],
): GroupedSelectOption[] => {
  const grouped = timezones.reduce<Record<string, SelectOption[]>>(
    (acc, tz) => {
      const [region] = tz.split('/');
      const label = tz;

      if (!acc[region]) {
        acc[region] = [];
      }

      acc[region].push({
        value: tz,
        label,
      });

      return acc;
    },
    {},
  );

  return Object.entries(grouped).map(([region, options]) => ({
    label: region,
    options,
  }));
};
