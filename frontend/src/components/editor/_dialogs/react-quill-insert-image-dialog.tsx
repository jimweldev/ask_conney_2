import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { FaImages } from 'react-icons/fa6';
import type ReactQuill from 'react-quill-new';
import { z } from 'zod';
import useAuthUserStore from '@/05_stores/_common/auth-user-store';
import InputGroup from '@/components/input-group/input-group';
import Tooltip from '@/components/tooltip/tooltip';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import ReactQuillUserImagesDialog from './_dialogs/react-quill-user-images-dialog';

// Zod schema to validate the form input
const FormSchema = z.object({
  img_url: z.url({
    message: 'Invalid URL',
  }),
  img_width: z
    .union(
      [
        z.string().regex(/^\d+(px|%)$/, { message: 'Invalid width format' }),
        z.literal(''),
      ],
      { message: 'Invalid width format' },
    )
    .optional(),
});

type ReactQuillInsertImageDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  ref: React.RefObject<ReactQuill | null>;
  selection: { index: number; length: number } | null;
};

const ReactQuillInsertImageDialog = ({
  open,
  setOpen,
  ref: quillRef,
  selection,
}: ReactQuillInsertImageDialogProps) => {
  // Access store values
  const { user } = useAuthUserStore();

  // Initialize form with Zod resolver and default values
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      img_url: '',
      img_width: '',
    },
  });

  // Handle form submission
  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const index = selection?.index ?? quill.getLength();
      const widthAttr = data.img_width ? `width="${data.img_width}"` : '';
      const imgTag = `<img src="${data.img_url}" ${widthAttr} />`;

      quill.clipboard.dangerouslyPasteHTML(index, imgTag);
    }

    form.reset();
    setOpen(false);
  };

  const [openReactQuillUserImagesDialog, setOpenReactQuillUserImagesDialog] =
    useState<boolean>(false);

  const onSelectImage = (url: string) => {
    form.setValue('img_url', url);
    setOpenReactQuillUserImagesDialog(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent autoFocus={true}>
          {/* Form */}
          <Form {...form}>
            <form
              onSubmit={e => {
                e.stopPropagation();
                form.handleSubmit(onSubmit)(e);
              }}
              autoComplete="off"
            >
              {/* Dialog header */}
              <DialogHeader>
                <DialogTitle>Insert Image</DialogTitle>
              </DialogHeader>

              {/* Dialog body */}
              <DialogBody>
                <div className="gap-layout grid grid-cols-12">
                  {form.watch('img_url') && (
                    <div className="col-span-12">
                      <img
                        src={form.watch('img_url')}
                        width={form.watch('img_width')}
                        alt="Preview"
                      />
                    </div>
                  )}
                  <FormField
                    control={form.control}
                    name="img_url"
                    render={({ field }) => (
                      <FormItem className="col-span-12">
                        <FormLabel>URL</FormLabel>
                        <FormControl>
                          <InputGroup>
                            <Input
                              {...field}
                              placeholder="https://www.example.com/image.jpg"
                            />
                            {user ? (
                              <Tooltip content="Choose from my images">
                                <Button
                                  onClick={() =>
                                    setOpenReactQuillUserImagesDialog(true)
                                  }
                                >
                                  <FaImages />
                                </Button>
                              </Tooltip>
                            ) : null}
                          </InputGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="img_width"
                    render={({ field }) => (
                      <FormItem className="col-span-12">
                        <FormLabel>Width</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. 100%, 200px" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </DialogBody>

              {/* Dialog footer */}
              <DialogFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ReactQuillUserImagesDialog
        open={openReactQuillUserImagesDialog}
        setOpen={setOpenReactQuillUserImagesDialog}
        onSelectImage={onSelectImage}
      />
    </>
  );
};

export default ReactQuillInsertImageDialog;
