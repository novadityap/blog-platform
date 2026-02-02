import { useForm } from 'react-hook-form';
import { useState } from 'react';

const sanitizeNull = data => {
  const result = {};

  for (const key in data) {
    const value = data[key];

    if (value === null || value === undefined) {
      result[key] = '';
    } else {
      result[key] = value;
    }
  }

  return result;
};

const buildFormData = ({ data, fieldName, isMultiple, method }) => {
  const formData = new FormData();

  for (const key in data) {
    const value = data[key];

    if (key === fieldName) {
      if (isMultiple === true && Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          if (value[i] instanceof File) {
            formData.append(key, value[i]);
          }
        }
      } else {
        if (value instanceof File) {
          formData.append(key, value);
        }
      }
    } else {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    }
  }

  return formData;
};

const buildPayload = (data, params) => {
  if (!params || params.length === 0) {
    return data;
  }

  const payload = {};
  payload.data = data;

  for (let i = 0; i < params.length; i++) {
    const param = params[i];
    const name = param.name;
    const value = param.value;

    payload[name] = value;
  }

  return payload;
};

const useFormHandler = ({
  file,
  mutation,
  defaultValues,
  params = [],
  onSuccess,
  onError,
  isUpdate = false,
}) => {
  const [message, setMessage] = useState('');
  const [mutate, { isLoading, isError, error, isSuccess }] = mutation();
  const form = useForm({ defaultValues });
  const {
    handleSubmit,
    formState: { dirtyFields },
  } = form;

  const onSubmit = async data => {
    try {
      if (file?.fieldName) {
        data = buildFormData({
          data,
          fieldName: file.fieldName,
          isMultiple: file.isMultiple,
          ...(isUpdate && { method: file.method }),
        });
      }

      const result = await mutate(buildPayload(data, params)).unwrap();

      if (isUpdate && result?.data) {
        form.reset(sanitizeNull(result.data), {
          keepDefaultValues: true,
        });
      } else {
        form.reset();
      }

      setMessage(result?.message);

      if (onSuccess) onSuccess(result);
    } catch (e) {
      if (e.errors) {
        for (const key in e.errors) {
          const message = e.errors[key];

          form.setError(key, {
            type: 'manual',
            message: message,
          });
        }
      }

      if (e.code !== 400) {
        setMessage(e.message);
        if (onError) onError(e);
      }
    }
  };

  return {
    form,
    handleSubmit: handleSubmit(onSubmit),
    isLoading,
    isError,
    error,
    isSuccess,
    message,
  };
};

export default useFormHandler;
