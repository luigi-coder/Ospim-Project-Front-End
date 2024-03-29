import { errorBackendResponse } from "../../../../errors/errorBackendResponse";
import axios from "axios";
import Swal from "sweetalert2";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const MESSAGE_HTTP_CREATED = import.meta.env.VITE_MESSAGE_HTTP_CREATED;
const MESSAGE_HTTP_UPDATED = import.meta.env.VITE_MESSAGE_HTTP_UPDATED;
const MESSAGE_HTTP_DELETED = import.meta.env.VITE_MESSAGE_HTTP_DELETED;

export const obtenerCategorias = async (token) => {
  const URL = `${BACKEND_URL}/categoria`;

  try {
    const categoriasResponse = await axios.get(URL, {
      headers: {
        Authorization: token,
      },
    });
    const categorias = await categoriasResponse.data;

    return categorias || [];
  } catch (error) {
    errorBackendResponse(error);
  }
};

export const obtenerCamaras = async (token) => {
  const URL = `${BACKEND_URL}/camara`;

  try {
    const camarasResponse = await axios.get(URL, {
      headers: {
        Authorization: token,
      },
    });
    const camaras = await camarasResponse.data;

    return camaras || [];
  } catch (error) {
    errorBackendResponse(error);
  }
};

export const crearCategoria = async (nuevaCategoria, token) => {
  const URL = `${BACKEND_URL}/categoria`;

  const showSwallSuccess = () => {
    Swal.fire({
      icon: "success",
      title: MESSAGE_HTTP_CREATED,
      showConfirmButton: false,
      timer: 2000,
    });
  };

  try {
    const categoriaResponse = await axios.post(URL, nuevaCategoria, {
      headers: {
        Authorization: token,
      },
    });

    if (categoriaResponse.status === 201) {
      showSwallSuccess();
    }
  } catch (error) {
    errorBackendResponse(error);
  }
};

export const actualizarCategoria = async (idCategoria, categoria, token) => {
  const URL = `${BACKEND_URL}/categoria/${idCategoria}`;

  const showSwallSuccess = () => {
    Swal.fire({
      icon: "success",
      title: MESSAGE_HTTP_UPDATED,
      showConfirmButton: false,
      timer: 2000,
    });
  };

  try {
    const categoriaResponse = await axios.put(URL, categoria, {
      headers: {
        Authorization: token,
      },
    });

    if (categoriaResponse.status === 200) {
      showSwallSuccess();
    }
  } catch (error) {
    errorBackendResponse(error);
  }
};

export const eliminarCategoria = async (idCategoria, token) => {
  const URL = `${BACKEND_URL}/categoria/${idCategoria}`;

  const showSwallSuccess = () => {
    Swal.fire({
      icon: "success",
      title: MESSAGE_HTTP_DELETED,
      showConfirmButton: false,
      timer: 2000,
    });
  };

  try {
    const categoriaResponse = await axios.delete(URL, {
      headers: {
        Authorization: token,
      },
    });

    if (categoriaResponse.status === 200) {
      showSwallSuccess();
    }
  } catch (error) {
    errorBackendResponse(error);
  }
};
