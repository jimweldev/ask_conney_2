import useMailLogStore from '@/05_stores/mail/mail-log-store';
import FancyboxAttachmentViewer from '@/components/fancybox/fancybox-attachment-viewer';
import FancyboxViewer from '@/components/fancybox/fancybox-viewer';
import IframePreview from '@/components/iframe/iframe-preview';
import InputGroup from '@/components/input-group/input-group';
import InputGroupText from '@/components/input-group/input-group-text';
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
import { Input } from '@/components/ui/input';
import useFancybox from '@/hooks/fancybox/use-fancybox';
import { getDateTimezone } from '@/lib/date/get-date-timezone';
import { populateTemplate } from '@/lib/mail/populate-template';

// Component Props
type ViewMailLogDialogProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

const ViewMailLogDialog = ({ open, setOpen }: ViewMailLogDialogProps) => {
  // Access store values
  const { selectedMailLog } = useMailLogStore();

  const [fancyboxRef] = useFancybox();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent size="2xl">
        {/* Dialog header */}
        <DialogHeader>
          <DialogTitle>View Mail Log</DialogTitle>
        </DialogHeader>

        {/* Dialog body */}
        <DialogBody>
          <div className="space-y-layout">
            <div className="col-span-12 grid grid-cols-12 gap-2">
              <InputGroup className="col-span-12">
                <InputGroupText className="bg-muted text-muted-foreground">
                  Subject
                </InputGroupText>
                <Input
                  value={selectedMailLog?.subject}
                  inputSize="sm"
                  readOnly
                />
              </InputGroup>

              <InputGroup className="col-span-6">
                <InputGroupText className="bg-muted text-muted-foreground">
                  Recipient
                </InputGroupText>
                <Input
                  value={selectedMailLog?.recipient_email}
                  inputSize="sm"
                  readOnly
                />
              </InputGroup>
              <InputGroup className="col-span-6">
                <InputGroupText className="bg-muted text-muted-foreground">
                  Created At
                </InputGroupText>
                <Input
                  value={getDateTimezone(
                    selectedMailLog?.created_at,
                    'date_time',
                  )}
                  inputSize="sm"
                  readOnly
                />
              </InputGroup>

              <InputGroup className="col-span-6">
                <InputGroupText className="bg-muted text-muted-foreground">
                  Cc
                </InputGroupText>
                <Input
                  value={selectedMailLog?.cc || '-'}
                  inputSize="sm"
                  readOnly
                />
              </InputGroup>
              <InputGroup className="col-span-6">
                <InputGroupText className="bg-muted text-muted-foreground">
                  Bcc
                </InputGroupText>
                <Input
                  value={selectedMailLog?.bcc || '-'}
                  inputSize="sm"
                  readOnly
                />
              </InputGroup>
            </div>

            <div>
              <IframePreview htmlContent={populateTemplate(selectedMailLog)} />
            </div>

            {/* Display attachments using Fancybox */}
            <div
              className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2"
              ref={fancyboxRef}
            >
              {selectedMailLog?.mail_log_attachments?.map(attachment => (
                <div key={attachment.id}>
                  <FancyboxViewer
                    baseUrl={import.meta.env.VITE_STORAGE_BASE_URL}
                    filePath={attachment.file_path}
                    key={attachment.id}
                    data-fancybox={`${selectedMailLog.id}`}
                    data-caption={attachment.file_name}
                  >
                    <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded border">
                      <FancyboxAttachmentViewer
                        className="min-h-full min-w-full object-cover"
                        src={`${import.meta.env.VITE_STORAGE_BASE_URL}/${attachment.file_path}`}
                      />
                    </div>
                  </FancyboxViewer>

                  <Tooltip content={attachment.file_name!}>
                    <p className="line-clamp-2 text-center text-xs text-wrap break-all">
                      {attachment.file_name}
                    </p>
                  </Tooltip>
                </div>
              ))}
            </div>
          </div>
        </DialogBody>

        {/* Dialog footer */}
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewMailLogDialog;
