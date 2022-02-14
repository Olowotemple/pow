import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import { useField } from 'formik';
import { InputHTMLAttributes } from 'react';

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
  textArea?: boolean;
};

const InputField = ({
  label,
  size: _size,
  textArea,
  ...props
}: InputFieldProps) => {
  const [field, meta, _helpers] = useField(props);

  return (
    <FormControl isInvalid={Boolean(meta.error)}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      <Input
        {...field}
        id={field.name}
        {...props}
        as={textArea ? 'textarea' : 'input'}
      />
      {meta.touched && meta.error ? (
        <FormErrorMessage>{meta.error}</FormErrorMessage>
      ) : null}
    </FormControl>
  );
};

export default InputField;
