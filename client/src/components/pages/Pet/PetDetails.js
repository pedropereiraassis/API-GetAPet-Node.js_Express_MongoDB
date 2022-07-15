import api from '../../../utils/api';
import { useState, useEffect } from'react';
import { useParams, Link } from 'react-router-dom';
import styles from './PetDetails.module.css';

/* hooks */
import useFlashMessage from '../../../hooks/useFlashMessage';

function PetDetails() {
  const [pet, setPet] = useState({});
  const { id } = useParams();
  const { setFlashMessage } = useFlashMessage();
  const [token] = useState(localStorage.getItem('token') || '');
  
  useEffect(() => {
    api.get(`/pets/${id}`).then((response) => {
      setPet(response.data.pet);
    });
  }, [id]);

  async function schedule() {
    let msgType = 'success';
    
    const data = await api.patch(`pets/schedule/${pet._id}`, {
      headers: {
        Authorization: `Bearer ${JSON.parse(token)}`,
      }
    }).then((response) => {
      return response.data;
    }).catch((error) => {
      msgType = 'error';
      return error.response.data;
    })

    setFlashMessage(data.message, msgType);
  }
  return (
    <>
      {pet.name && (
        <section className={styles.pet_details_container}>
          <div className={styles.pet_details_header}>
            <h1>Meeting pet: {pet.name}</h1>
            <p>If interested schedule a visit</p>
          </div>
          <div className={styles.pet_images}>
            {pet.images.map((image, index) => (
              <img 
                src={`${process.env.REACT_APP_API_URL}/images/pets/${image}`}
                alt={pet.name}
                key={index}
              />
            ))}
          </div>
          <p>
            <span className='bold'>Weight:</span> {pet.weight}kg
          </p>
          <p>
            <span className='bold'>Age:</span> {pet.age} year (s)
          </p>
          {token ? (
            <button onClick={schedule}>Schedule a visit</button>
          ) : (
            <p>
              You need to <Link to='/register'>create an account</Link> to schedule a visit
            </p>
          )}
        </section>
      )}
    </>
  )
}

export default PetDetails;