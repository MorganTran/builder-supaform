import { memo } from 'react'
import { FormBuilder, type FormType, type FormSource } from '@formio/react';

interface FormBuilderIOProps {
  initialForm: FormSource;
  onChange?: (form: FormType) => void;
}


const FormBuilderIO: React.FC<FormBuilderIOProps> = memo(({ initialForm, onChange }) => {
  
  return (
    <FormBuilder initialForm={initialForm} onChange={onChange}/>
  );
}, ()=>{return true});

export default FormBuilderIO;