import styles from './Profile.module.css';
import formStyles from '../../form/Form.module.css';
import Input from '../../form/Input';
import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import useFlashMessage from '../../../hooks/useFlashMessage';
import RoundedImage from '../../layout/RoundedImage';

function Profile() {
  const [user, setUser] = useState({});
  const [preview, setPreview] = useState();
  const [token] = useState(localStorage.getItem('token') || '');
  const { setFlashMessage } = useFlashMessage();

  useEffect(() => {
    api.get('/users/checkUser', {
      headers: {
        Authorization: `Bearer ${JSON.parse(token)}`
      }
    }).then((response) => {
      setUser(response.data);
    });
  }, [token]);

  function onFileChange(e) {
    setPreview(e.target.files[0]);
    setUser({ ...user, [e.target.name]: e.target.files[0] });
  }

  function handleChange(e) {
    setUser({ ...user, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    let msgType = 'success';
    const formData = new FormData();

    Object.keys(user).forEach((key) => 
      formData.append(key, user[key])
    );

    const data = await api.patch(`/users/edit/${user._id}`, formData, {
      headers: {
        Authorization: `Bearer ${JSON.parse(token)}`,
        'Content-Type': 'multipart/form-data'
      }
    }).then((response) => {
      return response.data;
    }).catch((error) => {
      msgType = 'error';
      return error.response.data;
    });

    setFlashMessage(data.message, msgType);
  }

  return (
    <section>
      <div className={styles.profile_header}>
        <h1>Profile</h1>
        {(user.image || preview) && (
          <RoundedImage 
            src={
              preview ? URL.createObjectURL(preview)
              : `${process.env.REACT_APP_API}/images/users/${user.image}`
            }
            alt={user.name}
          />
        )}
      </div>
      <form onSubmit={handleSubmit} className={formStyles.form_container}>
        <Input 
          text='Image'
          type='file'
          name='image'
          handleOnChange={onFileChange}
        />
        <Input 
          text='E-mail'
          type='email'
          name='email'
          placeholder='Type your e-mail'
          handleOnChange={handleChange}
          value={user.email || ''}
        />
        <Input 
          text='Name'
          type='text'
          name='name'
          placeholder='Type your name'
          handleOnChange={handleChange}
          value={user.name || ''}
        />
        <Input 
          text='Phone number'
          type='text'
          name='phone'
          placeholder='Type your phone'
          handleOnChange={handleChange}
          value={user.phone || ''}
        />
        <Input 
          text='Password'
          type='password'
          name='password'
          placeholder='Type your password'
          handleOnChange={handleChange}
        />
        <Input 
          text='Confirm password'
          type='password'
          name='confirmPassword'
          placeholder='Confirm your password'
          handleOnChange={handleChange}
        />
        <input type='submit' value='Update'></input>
      </form>
    </section>
  )
}

export default Profile;