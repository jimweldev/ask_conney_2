import { type User } from '@/04_types/user/user';

export const formatName = (
  name?: User | null,
  format?: 'default' | 'semifull' | 'formal' | 'full',
): string => {
  if (!name) return '';

  const {
    first_name = '',
    middle_name = '',
    last_name = '',
    suffix = '',
  } = name;

  switch (format) {
    case 'semifull':
      return [
        first_name,
        middle_name ? ` ${middle_name.charAt(0)}.` : '',
        last_name,
        suffix,
      ]
        .filter(Boolean)
        .join(' ')
        .trim();

    case 'formal':
      return [
        last_name,
        ', ',
        first_name,
        middle_name ? ` ${middle_name.charAt(0)}.` : '',
        suffix ? ` ${suffix}` : '',
      ]
        .filter(Boolean)
        .join('')
        .trim();

    case 'full':
      return [first_name, middle_name, last_name, suffix]
        .filter(Boolean)
        .join(' ')
        .trim();

    default:
      return [first_name, last_name].filter(Boolean).join(' ').trim();
  }
};
