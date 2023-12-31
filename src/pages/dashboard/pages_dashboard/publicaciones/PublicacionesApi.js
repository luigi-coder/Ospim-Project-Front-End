const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const MESSAGE_HTTP_CREATED = import.meta.env.VITE_MESSAGE_HTTP_CREATED;
const MESSAGE_HTTP_UPDATED = import.meta.env.VITE_MESSAGE_HTTP_UPDATED;
const MESSAGE_HTTP_DELETED = import.meta.env.VITE_MESSAGE_HTTP_DELETED;


import axios from 'axios'
import Swal from 'sweetalert2'
import { errorBackendResponse } from '../../../../errors/errorBackendResponse';

export const obtenerPublicaciones = async (token) => {

    const URL = `${BACKEND_URL}/publicaciones`;


    const showSwalError = (descripcion) => {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: descripcion,
            showConfirmButton: false,
            timer: 3000,
        })
    }

    try {
        
        const novedadesResponse = await axios.get(URL, {
            headers: {
                'Authorization': token
            }
        });
        const novedades = await novedadesResponse.data;

        return novedades || [];

    } catch (error) {

        errorBackendResponse(error, showSwalError);

    }  
}


export const crearPublicacion = async (publicacion, token) => {

    const URL = `${BACKEND_URL}/publicaciones`;

    const showSwalError = (descripcion) => {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: descripcion,
            showConfirmButton: false,
            timer: 2000,
        })
    }

    const showSwallSuccess = () => {
        Swal.fire({
            icon: 'success',
            title: MESSAGE_HTTP_CREATED,
            showConfirmButton: false,
            timer: 2000,
        })
    }

    try {
        
        const publicacionCreada = await axios.post(URL, publicacion, {
            headers: {
                'Authorization': token
            }
        });

        if(publicacionCreada.status === 201){
            showSwallSuccess();
        }

    } catch (error) {

        errorBackendResponse(error, showSwalError);

    }  
}

export const actualizarPublicacion = async (publicacionId, publicacion, token) => {

    const URL = `${BACKEND_URL}/publicaciones/${publicacionId}`;

    const showSwalError = (descripcion) => {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: descripcion,
            showConfirmButton: false,
            timer: 2000,
        })
    }

    const showSwallSuccess = () => {
        Swal.fire({
            icon: 'success',
            title: MESSAGE_HTTP_UPDATED,
            showConfirmButton: false,
            timer: 2000,
        })
    }

    try {
        
        const publicacionEditada = await axios.put(URL, publicacion, {
            headers: {
                'Authorization': token
            }
        });

        if(publicacionEditada.status === 200){
            showSwallSuccess();
        }

    } catch (error) {

        errorBackendResponse(error, showSwalError);

    } 
}

export const eliminarPublicacion = async (publicacionId, token) => {

    const URL = `${BACKEND_URL}/publicaciones/${publicacionId}`;

    const showSwalError = (descripcion) => {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: descripcion,
            showConfirmButton: false,
            timer: 2000,
        })
    }

    const showSwallSuccess = () => {
        Swal.fire({
            icon: 'success',
            title: MESSAGE_HTTP_DELETED,
            showConfirmButton: false,
            timer: 2000,
        })
    }

    try {
        
        const publicacionEliminada = await axios.delete(URL, {
            headers: {
                'Authorization': token
            }
        });

        console.log(publicacionEliminada);

        if(publicacionEliminada.status === 200){
            showSwallSuccess();
        }

    } catch (error) {

        errorBackendResponse(error, showSwalError);

    } 
}