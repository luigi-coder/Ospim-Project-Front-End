//import { errorBackendResponse } from '../../../../../errors/errorBackendResponse';
import axios from 'axios'
//import Swal from 'sweetalert2'
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
//const MESSAGE_HTTP_CREATED = import.meta.env.VITE_MESSAGE_HTTP_CREATED;
//const MESSAGE_HTTP_UPDATED = import.meta.env.VITE_MESSAGE_HTTP_UPDATED;
//const MESSAGE_HTTP_DELETED = import.meta.env.VITE_MESSAGE_HTTP_DELETED;


export const getBoletasByDDJJid = async (empresa_id, ddjj_id ) => {   
    const URL = `${BACKEND_URL}/empresa/${ empresa_id }/ddjj/${ ddjj_id }/boletas`;
    return axios.get(URL)
}

export const getBoletasByEmpresa = async(empresa_id) =>{
    const URL = `${BACKEND_URL}/empresa/${ empresa_id }/boletas`;
    return axios.get(URL)
} 


export const downloadPdfDetalle = async () => {
    const URL = `${BACKEND_URL}/empresa/123/ddjj/123/boleta-pago/concepto/uoma/imprimir-detalle`;
    
    try {
      const response = await axios({
        url: URL,
        method: 'GET',
        responseType: 'blob'
      });
  
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'boleta.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error al descargar el archivo PDF:', error);
    }
}

export const downloadPdfBoleta = async () => {
  const URL = `${BACKEND_URL}/empresa/123/ddjj/123/boleta-pago/concepto/uoma/imprimir-boleta`;
  
  try {
    const response = await axios({
      url: URL,
      method: 'GET',
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'boleta.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error('Error al descargar el archivo PDF:', error);
  }
}