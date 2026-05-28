{
  /**
   * FormSelect is a gender selection dropdown integrated with form libraries.
   * It uses predefined gender options and renders a placeholder by default.
   */
}
import { FieldInputProps } from 'formik';
import React from 'react';

import Dropdown from '@/components/Utility/Dropdown';
import { GENDER_OPTIONS } from '@/lib/constants';

interface FormSelectProps {
  field: FieldInputProps<string>;
}

function FormSelect({ field, ...props }: FormSelectProps) {
  return (
    <Dropdown
      {...field}
      {...props}
      placeHolder="Male"
      options={GENDER_OPTIONS}
      onChange={() => null}
    />
  );
}

export default FormSelect;
