import { useState } from 'react';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';                    
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import './MisDeclaracionesJuradas.css'
import { GrillaMisDeclaracionesJuradas } from './grilla_mis_declaraciones_juradas/GrillaMisDeclaracionesJuradas';
import { obtenerMisDeclaracionesJuradas } from './grilla_mis_declaraciones_juradas/GrillaMisDeclaracionesJuradasApi';
import { esES } from '@mui/x-date-pickers/locales';
import dayjs from 'dayjs';
import esLocale from 'dayjs/locale/es';

export const MisDeclaracionesJuradas = () => {

    const [rows_mis_ddjj, setRowsMisDdjj] = useState([]);
    const [desde, setDesde] = useState(null);
    const [hasta, setHasta] = useState(null);
    const TOKEN = JSON.parse(localStorage.getItem('stateLogin')).usuarioLogueado.usuario.token;
    const ID_EMPRESA = JSON.parse(localStorage.getItem('stateLogin')).usuarioLogueado.empresa.id;

    const handleChangeDesde = (date) => setDesde(date);

    const handleChangeHasta = (date) => setHasta(date);

    const buscarDeclaracionesJuradas = async () => {
        try {
            const ddjjResponse = await obtenerMisDeclaracionesJuradas(ID_EMPRESA, TOKEN);
            const declaracionesFiltradas = ddjjResponse.filter(ddjj => {
                const fecha = new Date(ddjj.periodo);
                return fecha >= new Date(desde) && fecha <= new Date(hasta);
            });
            setRowsMisDdjj(declaracionesFiltradas);
        } catch (error) {
            console.error('Error al buscar declaraciones juradas:', error);
        }
    }

    return (
        <div>
            <div className='mis_declaraciones_juradas_container'>
                <Stack
                    spacing={4}
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                >
                    <LocalizationProvider 
                        dateAdapter={AdapterDayjs}
                        adapterLocale={"es"}
                        localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText}
                    >
                        <DemoContainer components={['DatePicker']}>
                            <DatePicker
                                label="Periodo desde"
                                value={desde}
                                onChange={handleChangeDesde}
                                format="DD-MM-YYYY"
                            />
                        </DemoContainer>
                    </LocalizationProvider>
                    <LocalizationProvider 
                        dateAdapter={AdapterDayjs}
                        adapterLocale={"es"}
                        localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText}    
                    >
                        <DemoContainer components={['DatePicker']}>
                            <DatePicker
                                label="Periodo hasta"
                                value={hasta}
                                onChange={handleChangeHasta}
                                format="DD-MM-YYYY"
                            />
                        </DemoContainer>
                    </LocalizationProvider>
                </Stack>

                <Stack  
                    spacing={4}
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                >

                    <Button
                        onClick={buscarDeclaracionesJuradas}
                        variant="contained">Buscar</Button>
                    <Button variant="contained">Exportar</Button>

                </Stack>

            </div>
            <Stack
                direction="row"
                justifyContent="center"
                alignItems="center"
            >
                <GrillaMisDeclaracionesJuradas
                    rows_mis_ddjj={rows_mis_ddjj}
                    setRowsMisDdjj={setRowsMisDdjj}
                    token={TOKEN}
                    idEmpresa={ID_EMPRESA}

                />
            </Stack>
        </div>

    )
}
