import { type FileRejection } from 'react-dropzone';
import { toast } from 'sonner';

export const handleRejectedFiles = (rejectedFiles: FileRejection[]) => {
  if (rejectedFiles.length > 0) {
    rejectedFiles.forEach(rejectedFile => {
      const error = rejectedFile.errors[0];
      if (error.code === 'file-too-large') {
        toast.error(`File "${rejectedFile.file.name}" is too large`);
      } else if (error.code === 'file-invalid-type') {
        toast.error(
          `File "${rejectedFile.file.name}" is not a valid file type`,
        );
      } else {
        toast.error(`File "${rejectedFile.file.name}" is invalid`);
      }
    });
  }
};
