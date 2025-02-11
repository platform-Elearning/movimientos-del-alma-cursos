
const ValidateField = (name, value,error,setError) => {
  let errorMessage = '';
  const regex = /^[a-zA-ZáéíóúüñÑ\s-]+$/;

  if (name === 'name' || name === 'lastname') {
    if (!regex.test(value)) {
      errorMessage = 'Solo se permiten letras, espacios y guiones';
    } else if (value.length > 50) {
      errorMessage = 'El máximo permitido es 50 caracteres';
    }
  }

  setError({
    ...error,
    [name]: errorMessage,
  });
};

export default ValidateField;