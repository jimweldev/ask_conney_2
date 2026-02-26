import { useState } from 'react';
import InputGroup from '@/components/input-group/input-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type FilenameInputGroupProps = {
  tableName: string;
};

const FilenameInputGroup = ({ tableName }: FilenameInputGroupProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(tableName);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <InputGroup className="mb-layout">
      <Input inputSize="sm" value={tableName} readOnly />
      <Button size="sm" onClick={onCopy}>
        {isCopied ? 'Copied!' : 'Copy'}
      </Button>
    </InputGroup>
  );
};

export default FilenameInputGroup;
