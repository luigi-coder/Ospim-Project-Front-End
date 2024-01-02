import EmailIcon from '@mui/icons-material/Email';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import './Inicio.css'
import { CarouselText } from '../../../../components/carousel/CarouselText';

export const Inicio = () => {
    return (
        <div className='bienvenidos_container'>
            <div className='bienvenidos'>
                <h1 style={{ color: '#1A76D2', marginBottom: '10px', textAlign: 'left' }}>Bienvenidos</h1>

                <p className='parrafo_portal'>Desde este portal, podrá generar boletas de pago para las entidades UOMA, OSPIM y AMTIMA</p>
            </div>

            <div className='contacto'>
                <h2>Contacto</h2>
                <div className='contacto_child'>
                    <p>Ante cualquier inconveniente, por favor, no dude en contactarse con nosotros a través de los siguientes medios</p>

                    <div className='medios'>
                        <div><span><EmailIcon /></span>Correo Electrónico</div>
                        <div><span><LocalPhoneIcon /></span>Teléfono</div>
                        <div><span><WhatsAppIcon /></span>WhatsApp</div>
                    </div>

                    <h5>Días y horarios:</h5>
                    <p>Lunes a Viernes de 10 a 12 y de 14 a 17hs.</p>
                </div>
            </div>
            <div className='novedades'>
                <CarouselText />
            </div>
        </div>
    )
}
