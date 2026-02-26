import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '../ui/input-group';

const PasswordInput = ({ ...props }) => {
  const [isTypePassword, setIsTypePassword] = useState(true);

  const iconSizeClass =
    props.inputSize === 'sm'
      ? 'size-3'
      : props.inputSize === 'lg'
        ? 'size-6'
        : 'size-4'; // default

  return (
    <InputGroup inputSize={props.inputSize}>
      <InputGroupInput {...props} type={isTypePassword ? 'password' : 'text'} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          className="rounded-full"
          size="icon-xs"
          onClick={() => setIsTypePassword(!isTypePassword)}
        >
          {isTypePassword ? (
            <FaEyeSlash className={iconSizeClass} />
          ) : (
            <FaEye className={iconSizeClass} />
          )}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
};

export default PasswordInput;
