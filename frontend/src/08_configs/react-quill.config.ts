export const getDefaultModules = () => ({
  toolbar: {
    container: [
      [{ size: ['small', false, 'large'] }],
      ['bold', 'italic', 'underline'],
      [{ script: 'sub' }, { script: 'super' }],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ align: [] }],
      ['link', 'image', 'embed'],
      ['clean'],
    ],
  },
});

export const defaultModules = {
  toolbar: {
    container: [
      [{ size: ['small', false, 'large'] }],
      ['bold', 'italic', 'underline'],
      [{ script: 'sub' }, { script: 'super' }],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ align: [] }],
      ['link', 'image', 'embed'],
      ['clean'],
    ],
  },
};

export const getSimpleModules = () => ({
  toolbar: {
    container: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link', 'image'],
      ['clean'],
    ],
  },
});

export const simpleModules = {
  toolbar: {
    container: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link', 'image'],
      ['clean'],
    ],
  },
};
