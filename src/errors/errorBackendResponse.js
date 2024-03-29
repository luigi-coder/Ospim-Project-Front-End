import Swal from "sweetalert2";

const ERROR_BUSINESS = import.meta.env.VITE_ERROR_BUSINESS;
const ERROR_MESSAGE = import.meta.env.VITE_ERROR_MESSAGE;
const ERROR_BODY = import.meta.env.VITE_ERROR_BODY;

const showSwalError = (descripcion) => {
  Swal.fire({
    icon: "error",
    title: "Error de Validación",
    text: descripcion,
    showConfirmButton: false,
    timer: 3000,
  });
};

export const errorBackendResponse = (error) => {
  try {
    if (error.response && error.response.data) {
      const { codigo, descripcion, ticket, tipo } = error.response.data;

      if (tipo === ERROR_BUSINESS) {
        showSwalError(descripcion);
        console.error(descripcion);
      } else {
        showSwalError(`${ERROR_MESSAGE} ${ticket}`);
        console.error("Ticket: " + ticket + " - Descripcion: " + descripcion);
      }
    } else {
      showSwalError(`${ERROR_MESSAGE}`);
      console.error(`${ERROR_BODY} : ${error}`);
    }
  } catch (error) {
    showSwalError(`${ERROR_MESSAGE}`);
    console.error(`${ERROR_BODY} : ${error}`);
  }
};
