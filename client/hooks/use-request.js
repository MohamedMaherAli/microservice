import { useState } from 'react';
import axios from 'axios';

export default ({ url, method, body, onSuccess }) => {
  const [errors, setErrors] = useState(null);
  const doRequest = async (props = {}) => {
    try {
      setErrors(null);
      const response = await axios[method](url, { ...body, ...props });
      if (onSuccess) {
        onSuccess(response.data);
      }
      return response.data;
    } catch (error) {
      console.log(error);
      setErrors(
        <>
          <div className='alert alert-danger'>
            <h4>Ooops..</h4>
            <ul className='my=0'>
              {error.response.data.errors.map((e) => (
                <li key={e.message}>{e.message}</li>
              ))}
            </ul>
          </div>
        </>
      );
    }
  };
  return { doRequest, errors };
};
