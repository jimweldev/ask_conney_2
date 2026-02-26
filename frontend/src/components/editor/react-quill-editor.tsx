import { useMemo, useRef, useState } from 'react';
import ReactQuill from 'react-quill-new';
import { defaultModules, simpleModules } from '@/08_configs/react-quill.config';
import 'react-quill-new/dist/quill.snow.css';
import ReactQuillEmbedDialog from './_dialogs/react-quill-embed-dialog';
import ReactQuillInsertImageDialog from './_dialogs/react-quill-insert-image-dialog';

// ===== Add the IframeBlot definition here =====
/* eslint-disable @typescript-eslint/no-explicit-any -- missing types */
interface EmbedBlotClass {
  new (...args: any[]): any;
  create(value?: any): HTMLElement;
  value(node: HTMLElement): any;
}
/* eslint-enable @typescript-eslint/no-explicit-any -- missing types */

const BlockEmbed = ReactQuill.Quill.import(
  'blots/block/embed',
) as EmbedBlotClass;

class IframeBlot extends BlockEmbed {
  static blotName = 'iframe';
  static tagName = 'iframe';

  static create(value: { src: string; class: string }) {
    const node = super.create(value) as HTMLElement;
    node.setAttribute('src', value.src);
    node.setAttribute('frameborder', '0');
    node.setAttribute('allowfullscreen', 'true');
    node.setAttribute('class', value.class);
    return node;
  }

  static value(node: HTMLIFrameElement) {
    return {
      src: node.getAttribute('src'),
      class: node.getAttribute('class'),
    };
  }
}

// Register the custom blot
ReactQuill.Quill.register('formats/iframe', IframeBlot);

// Add custom icon for embed
const icons = ReactQuill.Quill.import('ui/icons') as Record<string, string>;
icons['embed'] = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M392.8 65.2C375.8 60.3 358.1 70.2 353.2 87.2L225.2 535.2C220.3 552.2 230.2 569.9 247.2 574.8C264.2 579.7 281.9 569.8 286.8 552.8L414.8 104.8C419.7 87.8 409.8 70.1 392.8 65.2zM457.4 201.3C444.9 213.8 444.9 234.1 457.4 246.6L530.8 320L457.4 393.4C444.9 405.9 444.9 426.2 457.4 438.7C469.9 451.2 490.2 451.2 502.7 438.7L598.7 342.7C611.2 330.2 611.2 309.9 598.7 297.4L502.7 201.4C490.2 188.9 469.9 188.9 457.4 201.4zM182.7 201.3C170.2 188.8 149.9 188.8 137.4 201.3L41.4 297.3C28.9 309.8 28.9 330.1 41.4 342.6L137.4 438.6C149.9 451.1 170.2 451.1 182.7 438.6C195.2 426.1 195.2 405.8 182.7 393.3L109.3 320L182.6 246.6C195.1 234.1 195.1 213.8 182.6 201.3z"/></svg>
`;

// Define type for Quill instance
type QuillEditor = ReactQuill & {
  getEditor: () => ReactQuill;
};

interface ReactQuillEditorProps {
  type?: 'default' | 'simple';
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const ReactQuillEditor = ({
  type = 'default',
  value,
  onChange,
  placeholder,
  className = '',
}: ReactQuillEditorProps) => {
  const quillRef = useRef<QuillEditor | null>(null);

  const [selection, setSelection] = useState<ReactQuill.Range | null>(null);
  const [openReactQuillImageDialog, setOpenReactQuillImageDialog] =
    useState(false);
  const [openReactQuillEmbedDialog, setOpenReactQuillEmbedDialog] =
    useState(false);

  const modules = useMemo(
    () => ({
      ...(type === 'default' ? defaultModules : simpleModules),
      toolbar: {
        ...(type === 'default' ? defaultModules : simpleModules).toolbar,
        handlers: {
          image: () => {
            if (quillRef.current) {
              const quill = quillRef.current.getEditor();
              const range = quill.getSelection();
              if (range) setSelection(range);
              setOpenReactQuillImageDialog(true);
            }
          },
          embed: () => {
            if (quillRef.current) {
              const quill = quillRef.current.getEditor();
              const range = quill.getSelection();
              if (range) setSelection(range);
              setOpenReactQuillEmbedDialog(true);
            }
          },
        },
      },
    }),
    [type],
  );

  return (
    <>
      <ReactQuill
        ref={quillRef}
        className={className}
        theme="snow"
        modules={modules}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />

      <ReactQuillInsertImageDialog
        open={openReactQuillImageDialog}
        setOpen={setOpenReactQuillImageDialog}
        ref={quillRef}
        selection={selection}
      />

      <ReactQuillEmbedDialog
        open={openReactQuillEmbedDialog}
        setOpen={setOpenReactQuillEmbedDialog}
        ref={quillRef}
        selection={selection}
      />
    </>
  );
};

export default ReactQuillEditor;
