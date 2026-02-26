import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { FaCamera } from 'react-icons/fa6';
import { toast } from 'sonner';
import { z } from 'zod';
import useAuthUserStore from '@/05_stores/_common/auth-user-store';
import { mainInstance } from '@/07_instances/main-instance';
import ReactImage from '@/components/image/react-image';
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
import { Input } from '@/components/ui/input';
import UploadAvatar from './_components/upload-avatar';
import fallbackImage from '/images/default-avatar.png';

// Define validation schema using Zod
const FormSchema = z.object({
  email: z.string().min(1, {
    message: 'Required',
  }),
  first_name: z.string().min(1, {
    message: 'Required',
  }),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, {
    message: 'Required',
  }),
  suffix: z.string().optional(),
});

const ProfilePage = () => {
  const { user, setUser } = useAuthUserStore();

  // Initialize form with default values and schema resolver
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: user?.email || '',
      first_name: user?.first_name || '',
      middle_name: user?.middle_name || '',
      last_name: user?.last_name || '',
      suffix: user?.suffix || '',
    },
  });

  // Loading state while updating the profile
  const [isLoadingUpdateProfile, setIsLoadingUpdateProfile] =
    useState<boolean>(false);

  // Form submission handler
  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setIsLoadingUpdateProfile(true);

    // Send PATCH request and show toast notifications
    toast.promise(mainInstance.patch(`/settings/profile`, data), {
      loading: 'Loading...',
      success: response => {
        setUser(response.data);
        return 'Success!';
      },
      error: error => {
        // Display server error or fallback message
        return (
          error.response?.data?.message || error.message || 'An error occurred'
        );
      },
      finally: () => {
        // Reset loading state regardless of outcome
        setIsLoadingUpdateProfile(false);
      },
    });
  };

  // State for managing avatar upload modal visibility
  const [openUploadAvatar, setOpenUploadAvatar] = useState<boolean>(false);

  return (
    <>
      <PageHeader className="mb-3">Profile</PageHeader>

      <Card className="max-w-xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardBody className="space-y-layout">
              <div className="flex justify-center">
                <div className="relative aspect-square w-24">
                  {/* Avatar image container */}
                  <div className="outline-primary border-card flex size-full items-center overflow-hidden rounded-full border-1 outline-2 select-none">
                    <ReactImage
                      className="pointer-events-none size-full object-cover"
                      src={`${import.meta.env.VITE_STORAGE_BASE_URL}${user?.avatar_path}`}
                      alt="Avatar"
                      fallback={fallbackImage}
                    />
                  </div>

                  {/* Button to open avatar upload modal */}
                  <Button
                    className="border-card absolute right-0 bottom-0 rounded-full border-2"
                    variant="default"
                    size="icon-sm"
                    onClick={() => setOpenUploadAvatar(true)}
                  >
                    <FaCamera />
                  </Button>
                </div>
              </div>

              <div className="gap-layout grid grid-cols-12">
                {/* Form field for email (read-only) */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Form field for first name */}
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Form field for middle name */}
                <FormField
                  control={form.control}
                  name="middle_name"
                  render={({ field }) => (
                    <FormItem className="col-span-5">
                      <FormLabel>Middle Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Form field for last name */}
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem className="col-span-5">
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Form field for suffix */}
                <FormField
                  control={form.control}
                  name="suffix"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Suffix</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                {/* Submit button */}
                <Button type="submit" disabled={isLoadingUpdateProfile}>
                  Submit
                </Button>
              </div>
            </CardBody>
          </form>
        </Form>
      </Card>

      <UploadAvatar open={openUploadAvatar} setOpen={setOpenUploadAvatar} />
    </>
  );
};

export default ProfilePage;
