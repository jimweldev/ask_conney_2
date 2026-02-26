import { z } from 'zod';

// REACT SELECT
export const createReactSelectSchema = (required = true) => {
  return required
    ? z.object(
        {
          label: z.string(),
          value: z.any(),
        },
        {
          message: 'Required',
        },
      )
    : z.any();
};

// INPUT DROPZONE
export const createReactDropzoneSchema = (required = true) => {
  return required
    ? z.file({
        message: 'Required',
      })
    : z.any();
};

export const createInputJsonSchema = (required = true) => {
  const base = z.string().refine(
    data => {
      try {
        JSON.parse(data);
        return true;
      } catch {
        return false;
      }
    },
    { message: 'Invalid JSON' },
  );

  if (required) {
    return base.min(1, { message: 'Required' });
  }

  return z
    .string()
    .optional()
    .refine(
      data => {
        if (!data) return true; // allow undefined or empty
        try {
          JSON.parse(data);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'Invalid JSON' },
    );
};

// INPUT INTEGER
export const createInputIntegerSchema = (
  required = true,
  type: 'both' | 'positive' | 'negative' = 'both',
) => {
  let pattern: RegExp;
  let message: string;

  switch (type) {
    case 'positive':
      pattern = /^\d+$/;
      message = 'Must be a positive integer';
      break;
    case 'negative':
      pattern = /^-\d+$/;
      message = 'Must be a negative integer';
      break;
    default:
      pattern = /^-?\d+$/;
      message = 'Must be an integer';
      break;
  }

  const base = z.string().regex(pattern, { message });

  return required
    ? base.min(1, { message: 'Required' })
    : base.optional().or(z.literal(''));
};

// INPUT DECIMAL
export const createInputDecimalSchema = (
  required = true,
  type: 'both' | 'positive' | 'negative' = 'both',
) => {
  let pattern: RegExp;
  let message: string;

  switch (type) {
    case 'positive':
      pattern = /^\d+(\.\d+)?$/; // digits or digits.decimals
      message = 'Must be a positive number';
      break;
    case 'negative':
      pattern = /^-\d+(\.\d+)?$/; // -digits or -digits.decimals
      message = 'Must be a negative number';
      break;
    default:
      pattern = /^-?\d+(\.\d+)?$/; // optional minus, digits, optional decimals
      message = 'Must be a number';
      break;
  }

  const base = z.string().regex(pattern, { message });

  return required
    ? base.min(1, { message: 'Required' })
    : base.optional().or(z.literal(''));
};

export const createReactQuillSchema = (required = true) => {
  return required
    ? z.string().refine(val => val.trim() !== '<p><br></p>', {
        message: 'Required',
      })
    : z.any();
};
