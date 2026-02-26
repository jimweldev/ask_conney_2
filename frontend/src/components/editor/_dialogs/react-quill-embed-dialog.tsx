import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { FaClipboard, FaInfo } from 'react-icons/fa6';
import type ReactQuill from 'react-quill-new';
import { toast } from 'sonner';
import { z } from 'zod';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

// Schema for embed form
const EmbedSchema = z.object({
  embed_url: z.string().min(1, {
    message: 'Required',
  }),
  aspect_ratio: z.string().min(1, {
    message: 'Select aspect ratio',
  }),
});

type ReactQuillEmbedDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  ref: React.RefObject<ReactQuill | null>;
  selection: { index: number; length: number } | null;
};

type EmbedFormValues = z.infer<typeof EmbedSchema>;

const ReactQuillEmbedDialog = ({
  open,
  setOpen,
  ref: quillRef,
  selection,
}: ReactQuillEmbedDialogProps) => {
  const form = useForm<EmbedFormValues>({
    resolver: zodResolver(EmbedSchema),
    defaultValues: {
      embed_url: '',
      aspect_ratio: 'aspect-video', // 👈 default aspect ratio
    },
  });

  const onSubmit = (data: EmbedFormValues) => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const index = selection?.index ?? quill.getLength();

      // Insert the iframe embed
      quill.insertEmbed(
        index,
        'iframe',
        {
          src: data.embed_url,
          class: `${data.aspect_ratio} w-full`, // 👈 apply selected ratio
          frameborder: '0',
          allowfullscreen: 'true',
        },
        'user',
      );

      // Move cursor after the embed
      quill.setSelection(index + 1, 0);
    }

    form.reset();
    setOpen(false);
  };

  // 👇 Function to paste iframe src from clipboard
  const handlePasteIframe = async () => {
    try {
      const text = await navigator.clipboard.readText();

      // Match iframe src using regex
      const match = text.match(/<iframe[^>]*src=["']([^"']+)["']/i);
      const src = match ? match[1] : text.trim(); // fallback: if only url is pasted

      if (src) {
        form.setValue('embed_url', src, { shouldValidate: true });
      } else {
        toast.error('Invalid embed URL');
      }
    } catch (_err) {
      toast.error('Failed to paste embed URL');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent autoFocus={true}>
        <Form {...form}>
          <form
            onSubmit={e => {
              e.stopPropagation();
              form.handleSubmit(onSubmit)(e);
            }}
            autoComplete="off"
          >
            <DialogHeader>
              <DialogTitle>Insert Embed</DialogTitle>
            </DialogHeader>

            <DialogBody>
              <div className="gap-layout grid grid-cols-12">
                {form.watch('embed_url') && (
                  <div className="col-span-12 mt-2 overflow-hidden rounded-lg border">
                    <iframe
                      src={form.watch('embed_url')}
                      allowFullScreen
                      className={`${form.watch('aspect_ratio')} w-full`}
                    />
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="embed_url"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <div className="flex justify-between gap-2">
                        <FormLabel>Embed URL</FormLabel>

                        <Tooltip
                          content={
                            <div className="max-w-[300px]">
                              <p>
                                Paste or enter the <code>src</code> URL from
                                your embed iframe (e.g.,{' '}
                                <code>https://www.youtube.com/embed/xyz</code>).
                                You can also click the clipboard button to
                                auto-detect and extract the URL if you’ve copied
                                an iframe snippet.
                              </p>
                            </div>
                          }
                        >
                          <Button variant="ghost" size="icon-xs">
                            <FaInfo />
                          </Button>
                        </Tooltip>
                      </div>
                      <FormControl>
                        <InputGroup>
                          <Input
                            {...field}
                            placeholder="https://www.youtube.com/embed/xyz"
                          />
                          <Tooltip content="Paste iframe embed URL">
                            <Button type="button" onClick={handlePasteIframe}>
                              <FaClipboard />
                            </Button>
                          </Tooltip>
                        </InputGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="aspect_ratio"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Aspect Ratio</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2"
                        >
                          <FormItem className="flex aspect-square items-center justify-center">
                            <FormControl>
                              <RadioGroupItem
                                className="hidden"
                                value="aspect-square"
                              />
                            </FormControl>
                            <FormLabel className="text-muted-foreground mb-0 flex h-full w-full cursor-pointer items-center justify-center">
                              <div
                                className={cn(
                                  'flex aspect-square w-full items-center justify-center border',
                                  field.value === 'aspect-square' &&
                                    'border-primary',
                                )}
                              >
                                1:1
                              </div>
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex aspect-square items-center justify-center">
                            <FormControl>
                              <RadioGroupItem
                                className="hidden"
                                value="aspect-video"
                              />
                            </FormControl>
                            <FormLabel className="text-muted-foreground mb-0 flex h-full w-full cursor-pointer items-center justify-center">
                              <div
                                className={cn(
                                  'flex aspect-video w-full items-center justify-center border',
                                  field.value === 'aspect-video' &&
                                    'border-primary',
                                )}
                              >
                                16:9
                              </div>
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex aspect-square items-center justify-center">
                            <FormControl>
                              <RadioGroupItem
                                className="hidden"
                                value="aspect-[4/3]"
                              />
                            </FormControl>
                            <FormLabel className="text-muted-foreground mb-0 flex h-full w-full cursor-pointer items-center justify-center">
                              <div
                                className={cn(
                                  'flex aspect-[4/3] w-full items-center justify-center border',
                                  field.value === 'aspect-[4/3]' &&
                                    'border-primary',
                                )}
                              >
                                4:3
                              </div>
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex aspect-square items-center justify-center">
                            <FormControl>
                              <RadioGroupItem
                                className="hidden"
                                value="aspect-[3/4]"
                              />
                            </FormControl>
                            <FormLabel className="text-muted-foreground mb-0 flex h-full w-full cursor-pointer items-center justify-center">
                              <div
                                className={cn(
                                  'flex aspect-[3/4] h-full items-center justify-center border',
                                  field.value === 'aspect-[3/4]' &&
                                    'border-primary',
                                )}
                              >
                                3:4
                              </div>
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex aspect-square items-center justify-center">
                            <FormControl>
                              <RadioGroupItem
                                className="hidden"
                                value="aspect-[2/3]"
                              />
                            </FormControl>
                            <FormLabel className="text-muted-foreground mb-0 flex h-full w-full cursor-pointer items-center justify-center">
                              <div
                                className={cn(
                                  'flex aspect-[2/3] h-full items-center justify-center border',
                                  field.value === 'aspect-[2/3]' &&
                                    'border-primary',
                                )}
                              >
                                2:3
                              </div>
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </DialogBody>

            <DialogFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Insert</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ReactQuillEmbedDialog;
