import { useState } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

export default () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { doRequest, errors } = useRequest({
    url: '/api/users/signin',
    method: 'post',
    body: { email, password },
    onSuccess: () => Router.push('/'),
  });
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    doRequest();
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <h1>Sign in</h1>
        <div className='form-group'>
          <label>Email Adress</label>
          <input
            className='form-control'
            value={email}
            onChange={handleEmailChange}
          />
        </div>

        <div className='form-group'>
          <label>Password</label>
          <input
            type='password'
            className='form-control'
            value={password}
            onChange={handlePasswordChange}
          />
        </div>
        <button className='btn btn-primary mt-2'>Sign in</button>
      </form>
      {errors}
    </>
  );
};
