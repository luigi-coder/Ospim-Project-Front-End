const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

import axios from "axios";
import Swal from "sweetalert2";
import { errorBackendResponse } from "../../errors/errorBackendResponse";

export const logon = async (usuario, clave) => {
  const URL = `${BACKEND_URL}/auth/login`;
  let jsonResponse = {
    token: null,
    tokenRefresco: null,
  };

  try {
    const logonDto = {
      usuario: usuario,
      clave: clave,
    };
    const logonResponse = await axios.post(URL, logonDto);
    const logon = await logonResponse.data;

    return logon || {};
  } catch (error) {
    errorBackendResponse(error);
    return jsonResponse;
  }
};

export const usuarioLogueadoHabilitadoDFA = async (token) => {
  const URL = `${BACKEND_URL}/auth/dfa/usuario-loguedo-habilitado`;

  try {
    const usuarioResponse = await axios.get(URL, {
      headers: {
        Authorization: token,
      },
    });
    const usuario = await usuarioResponse.data;
    return usuario || {};
  } catch (error) {
    errorBackendResponse(error);
  }
};

export const logonDFA = async (token, codigo) => {
  const URL = `${BACKEND_URL}/auth/login-dfa`;

  const codigoVerificacion = {
    codigo: codigo,
  };

  try {
    const loginDfaResponse = await axios.post(URL, codigoVerificacion, {
      headers: {
        Authorization: token,
      },
    });
    const loginDfa = await loginDfaResponse.data;

    return loginDfa || {};
  } catch (error) {
    errorBackendResponse(error);
  }
};

export const consultarUsuarioLogueado = async (token) => {
  const URL = `${BACKEND_URL}/auth/login/usuario`;
  console.log("consultarUsuarioLogueado - INIT");
  try {
    const usuarioLogeadoResponse = await axios.get(URL, {
      headers: {
        Authorization: token,
      },
    });

    const usuarioLogeado = await usuarioLogeadoResponse.data;

    return usuarioLogeado || {};
  } catch (error) {
    console.log("consultarUsuarioLogueado - ERRROR");
    errorBackendResponse(error);
  }
};
