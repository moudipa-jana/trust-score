{
  /**
   * FormInput renders a labeled input field integrated with form libraries (e.g., Formik),
   * includes optional validation error display and conditional styling for modal contexts.
   */
}
import { FieldInputProps, FormikErrors, FormikTouched } from 'formik';

import Input from '@/elements/Input';
import Label from '@/elements/Label';
import Text from '@/elements/Text';

interface FormValues {
  [key: string]: string;
}

interface FormInputProps {
  field: FieldInputProps<string>;
  form: {
    touched: FormikTouched<FormValues>;
    errors: FormikErrors<FormValues>;
  };
  label?: string;
  required?: boolean;
  isModal?: boolean;
  type?: string;
  placeholder?: string;
}

const FormInput = ({
  field,
  form,
  label,
  required,
  isModal,
  ...props
}: FormInputProps) => {
  const { touched, errors } = form;
  function handleRequired() {
    if (required)
      return <Label title={label as string} color="text-black-200" required />;
    return <Label title={label as string} color="text-black-200" />;
  }
  return (
    <div className="mb-2 ">
      {label && handleRequired()}
      <Input {...field} {...props} />
      <div className={` ${isModal ? '' : ''} `}>
        {touched[field.name] && errors[field.name] && (
          <Text size="sm" color="text-[red]">
            {errors[field.name]}
          </Text>
        )}
      </div>
    </div>
  );
};

export default FormInput;
