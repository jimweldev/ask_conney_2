import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import moment from 'moment-timezone';
import { useForm } from 'react-hook-form';
import ReactSelect from 'react-select';
import { toast } from 'sonner';
import { z } from 'zod';
import useAuthUserStore from '@/05_stores/_common/auth-user-store';
import useFontSizeStore from '@/05_stores/_common/font-size-store';
import useThemeStore from '@/05_stores/_common/theme-store';
import useTimezoneStore from '@/05_stores/_common/timezone-store';
import { mainInstance } from '@/07_instances/main-instance';
import TimezoneSelect from '@/components/react-select/timezone-select';
import PageHeader from '@/components/typography/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { dateFormats } from '@/data/date-formats';
import { fontSizes } from '@/data/font-sizes';
import { timeFormats } from '@/data/time-formats';
import { convertToSelectOptions } from '@/lib/react-select/convert-to-select-options';
import { cn } from '@/lib/utils';

// Define form schema with Zod for validation
const FormSchema = z.object({
  theme: z.enum(['light', 'dark', 'system'], {
    message: 'Theme must be either light or dark',
  }),
  font_size: z.object({
    label: z.string(),
    value: z.string(),
  }),
  timezone: z.object(
    {
      label: z.string(),
      value: z.string(),
    },
    { message: 'Required' },
  ),
  date_format: z.object({
    label: z.string(),
    value: z.string(),
  }),
  time_format: z.object({
    label: z.string(),
    value: z.string(),
  }),
});

// Main component for the General Settings Page
const GeneralPage = () => {
  // Access state management stores
  const { setUser } = useAuthUserStore();
  const { theme, setTheme } = useThemeStore();
  const { fontSize, setFontSize } = useFontSizeStore();
  const {
    timezone,
    date_format,
    time_format,
    setTimezone,
    setDateFormat,
    setTimeFormat,
  } = useTimezoneStore();

  // Initialize form with default values and schema resolver
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      theme: theme || 'light',
      font_size: fontSize
        ? fontSizes.find(size => size.value === fontSize)
        : {
            label: 'Medium',
            value: '1rem',
          },
      timezone: timezone
        ? { label: timezone, value: timezone }
        : (() => {
            const guessed = moment.tz.guess();
            return { label: guessed, value: guessed };
          })(),
      date_format: date_format
        ? { label: date_format, value: date_format }
        : {
            label: 'MMM DD, YYYY',
            value: 'MMM DD, YYYY',
          },
      time_format: time_format
        ? timeFormats.find(format => format.value === time_format)
        : {
            label: '12 Hour',
            value: 'hh:mm:ss A',
          },
    },
  });

  // Local loading state for async form submission
  const [isLoadingUpdateProfile, setIsLoadingUpdateProfile] =
    useState<boolean>(false);

  // Form submit handler
  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    // Extract value from timezone object
    const newData = {
      ...data,
      font_size: data.font_size.value,
      timezone: data.timezone?.value,
      date_format: data.date_format.value,
      time_format: data.time_format.value,
    };

    setIsLoadingUpdateProfile(true);

    // Show loading, success, or error toast during async request
    toast.promise(mainInstance.patch(`/settings`, newData), {
      loading: 'Loading...',
      success: response => {
        // Update user and UI settings from response
        setUser(response.data);

        setTheme(response.data.user_setting.theme);
        setFontSize(response.data.user_setting.font_size);
        setTimezone(response.data.user_setting.timezone);
        setDateFormat(response.data.user_setting.date_format);
        setTimeFormat(response.data.user_setting.time_format);

        return 'Success!';
      },
      error: error => {
        return (
          error.response?.data?.message || error.message || 'An error occurred'
        );
      },
      finally: () => {
        setIsLoadingUpdateProfile(false);
      },
    });
  };

  return (
    <div className="relative">
      {/* Page header */}
      <PageHeader className="mb-3">General</PageHeader>

      {/* Form wrapper */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="max-w-md">
            <CardBody className="space-y-layout">
              <div className="gap-layout grid grid-cols-12">
                {/* Theme selection using radio buttons */}
                <FormField
                  control={form.control}
                  name="theme"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Theme</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-5"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="light" id="light" />
                            <Label htmlFor="light">Light</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="dark" id="dark" />
                            <Label htmlFor="dark">Dark</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Font size selection dropdown */}
                <FormField
                  control={form.control}
                  name="font_size"
                  render={({ field, fieldState }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Font Size</FormLabel>
                      <ReactSelect
                        className={cn(
                          'react-select-container',
                          fieldState.invalid ? 'invalid' : '',
                        )}
                        classNamePrefix="react-select"
                        options={fontSizes}
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Timezone selection with react-select */}
                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field, fieldState }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Timezone</FormLabel>
                      <TimezoneSelect
                        className={fieldState.invalid ? 'invalid' : ''}
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date format dropdown */}
                <FormField
                  control={form.control}
                  name="date_format"
                  render={({ field, fieldState }) => (
                    <FormItem className="col-span-6">
                      <FormLabel>Date Format</FormLabel>
                      <ReactSelect
                        className={cn(
                          'react-select-container',
                          fieldState.invalid ? 'invalid' : '',
                        )}
                        classNamePrefix="react-select"
                        options={convertToSelectOptions(dateFormats)}
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Time format dropdown */}
                <FormField
                  control={form.control}
                  name="time_format"
                  render={({ field, fieldState }) => (
                    <FormItem className="col-span-6">
                      <FormLabel>Time Format</FormLabel>
                      <ReactSelect
                        className={cn(
                          'react-select-container',
                          fieldState.invalid ? 'invalid' : '',
                        )}
                        classNamePrefix="react-select"
                        options={timeFormats}
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit button */}
              <div className="flex justify-end">
                <Button type="submit" disabled={isLoadingUpdateProfile}>
                  Submit
                </Button>
              </div>
            </CardBody>
          </Card>
        </form>
      </Form>
    </div>
  );
};

export default GeneralPage;
