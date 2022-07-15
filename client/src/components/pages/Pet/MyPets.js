import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { Link } from 'react-router-dom'
import RoundedImage from '../../layout/RoundedImage';
import styles from './Dashboard.module.css';

/* hooks */
import useFlashMessage from '../../../hooks/useFlashMessage';

function MyPets() {
  const [pets, setPets] = useState([]);
  const [token] = useState(localStorage.getItem('token') || '');
  const { setFlashMessage } = useFlashMessage();

  useEffect(() => {
    api.get('/pets/mypets', {
      headers: {
        Authorization: `Bearer ${JSON.parse(token)}`
      }
    })
    .then((response) => {
      setPets(response.data.pets);
    })
  }, [token]);

  async function removePet(id) {
    let msgType = 'success';

    const data = await api.delete(`/pets/${id}`, {
      headers: {
        Authorization: `Bearer ${JSON.parse(token)}`
      }
    })
    .then((response) => {
      const updatedPets = pets.filter((pet) => pet._id !== id);
      setPets(updatedPets);
      return response.data;
    })
    .catch((error) => {
      msgType = 'error';
      return error.response.data;
    });

    setFlashMessage(data.message, msgType);
  }

  async function concludeAdoption(id) {
    let msgType = 'success';
    
    const data = await api.patch(`pets/conclude/${id}`, {
      headers: {
        Authorization: `Bearer ${JSON.parse(token)}`,
      },
    }).then((response) => {
      return response.data;
    }).catch((error) => {
      msgType = 'error';
      return error.response.data;
    })

    setFlashMessage(data.message, msgType);
  }

  return (
    <section>
      <div className={styles.petlist_header}>
        <h1>My Pets</h1>
        <Link to='/pets/add'>Register Pet</Link>
      </div>
      <div className={styles.petlist_container}>
        {pets.length > 0 &&
          pets.map((pet) => (
            <div className={styles.petlist_row} key={pet._id}>
              <RoundedImage 
                src={`${process.env.REACT_APP_API_URL}/images/pets/${pet.images[0]}`}
                alt={pet.name}
                width='px75'
              />
              <span className='bold'>{pet.name}</span>
              <div className={styles.actions}>
                {pet.available ? (
                  <>
                    {pet.adopter && (
                      <button className={styles.conclude_btn} onClick={() => {
                        concludeAdoption(pet._id)
                      }}>
                        Conclude adoption
                      </button>
                    )}
                    <Link to={`/pets/edit/${pet._id}`}>Edit</Link>
                    <button onClick={() => removePet(pet._id)}>Delete</button>
                  </>
                ) : <p>Pet already adopted</p>
                }
              </div>
            </div>
          ))
        }
        {pets.length === 0 && <p>There are no registered pets</p>}
      </div>
    </section>
  )
}

export default MyPets;