{
  /**
   * FormInput renders a labeled input field with optional validation error display,
   * supporting integration with form libraries like Formik and modal-specific layout adjustments.
   */
}
import { FieldInputProps, FormikErrors, FormikTouched } from 'formik';

import InputSecondary from '@/elements/InputSecondary';
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
    if (required) {
      return (
        <Label
          title={label as string}
          color="text-black-200 mb-1 !text-base"
          required
        />
      );
    }
    return (
      <Label title={label as string} color="text-black-200 mb-1 !text-base" />
    );
  }
  return (
    <div className="mb-2">
      {label && handleRequired()}
      <InputSecondary {...field} {...props} />
      <div className={` ${isModal ? '' : 'min-h-[1.5rem]'} `}>
        {touched[field.name] && errors[field.name] && (
          <Text size="sm" color="text-[red]">
            {String(errors[field.name])}
          </Text>
        )}
      </div>
    </div>
  );
};

export default FormInput;
