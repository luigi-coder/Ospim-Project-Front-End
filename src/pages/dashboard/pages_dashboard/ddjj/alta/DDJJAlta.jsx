import { useEffect, useState } from "react";
import { Stack } from "@mui/material";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { esES } from "@mui/x-date-pickers/locales";
import {
  Box,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import dayjs from "dayjs";
import esLocale from "dayjs/locale/es";
import "./DDJJAlta.css";
import { GrillaPasoTres } from "./paso_tres/GrillaPasoTres";
import { axiosDDJJ } from "./DDJJAltaApi";
import Swal from "sweetalert2";
import XLSX from "xlsx";

export const MisAltaDeclaracionesJuradas = ({
  periodo,
  periodoIso,
  handleChangePeriodo,
  handleAcceptPeriodoDDJJ,
  rowsAltaDDJJ,
  setRowsAltaDDJJ,
  rowsAltaDDJJAux,
  setRowsAltaDDJJAux,
  peticion,
  idDDJJ,
}) => {
  const [otroPeriodo, setOtroPeriodo] = useState(null);
  const [otroPeriodoIso, setOtroPeriodoIso] = useState(null);
  const [camaras, setCamaras] = useState([]);
  const [todasLasCategorias, setTodasLasCategorias] = useState([]);
  const [categoriasFiltradas, setCategoriasFiltradas] = useState([]);
  const [afiliado, setAfiliado] = useState({});
  const [plantas, setPlantas] = useState([]);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [mostrarPeriodos, setMostrarPeriodos] = useState(false);
  const [validacionResponse, setValidacionResponse] = useState([]);
  const [afiliadoImportado, setAfiliadoImportado] = useState([]);
  const TOKEN = JSON.parse(localStorage.getItem("stateLogin")).usuarioLogueado
    .usuario.token;
  const ID_EMPRESA = JSON.parse(localStorage.getItem("stateLogin"))
    .usuarioLogueado.empresa.id;

  useEffect(() => {
    // imprimir en consola rowsAltaDDJJ
    console.log(rowsAltaDDJJ);

    // imprimir en consola la fecha del primero de diciembre del 2022 con el objeto dayjs
    console.log(dayjs("2022-12-01").locale(esLocale).format("MMMM YYYY"));
    console.log(dayjs("2024-02-15").locale(esLocale).format("MMMM YYYY"));
    // formato dia mes año
    console.log(dayjs("2024-02-15").locale(esLocale).format("DD MMMM YYYY"));
  }, [rowsAltaDDJJ]);

  const handleChangeOtroPeriodo = (date) => setOtroPeriodo(date);

  const handleAcceptOtroPeriodo = () => {
    if (otroPeriodo && otroPeriodo.$d) {
      const { $d: fecha } = otroPeriodo;
      const fechaFormateada = new Date(fecha);
      fechaFormateada.setDate(1); // Establecer el día del mes a 1

      // Ajustar la zona horaria a UTC
      fechaFormateada.setUTCHours(0, 0, 0, 0);

      const fechaISO = fechaFormateada.toISOString(); // 2026-02-01T00:00:00.000Z
      setOtroPeriodoIso(fechaISO);
    }
  };

  useEffect(() => {
    const ObtenerCamaras = async () => {
      const data = await axiosDDJJ.getCamaras();
      //const camarasResponse = await obtenerCamaras(TOKEN);
      setCamaras(data.map((item, index) => ({ id: index + 1, ...item })));
    };
    ObtenerCamaras();
  }, []);

  useEffect(() => {
    const ObtenerCategorias = async () => {
      const data = await axiosDDJJ.getCategorias();
      setTodasLasCategorias(
        data.map((item, index) => ({ id: index + 1, ...item }))
      );
    };
    ObtenerCategorias();
  }, []);

  useEffect(() => {
    const ObtenerPlantaEmpresas = async () => {
      const data = await axiosDDJJ.getPlantas(ID_EMPRESA);
      console.log(data);
      setPlantas(data.map((item) => ({ id: item, ...item })));
    };
    ObtenerPlantaEmpresas();
  }, []);

  const importarAfiliado = async () => {
    const cuiles = afiliadoImportado.map((item) => item.cuil);
    const cuilesString = cuiles.map((item) => item.toString());

    const cuilesResponse = await axiosDDJJ.validarCuiles(
      ID_EMPRESA,
      cuilesString
    );

    // Si alguno de los cuiles el valor de cuilesValidados es igual a false
    if (cuilesResponse.some((item) => item.cuilValido === false)) {
      // imprimir en consola el cuil que tiene el valor de cuilValido igual a false
      const cuilFallido = cuilesResponse.filter(
        (item) => item.cuilValido === false
      );
      cuilFallido.forEach((item) => {
        console.log(item.cuil);
      });

      const mensajesFormateados = cuilFallido
        .map((item, index) => {
          return `<p>${item.cuil}</p>`;
        })
        .join("");

      Swal.fire({
        icon: "error",
        title: "Error de validacion",
        html: `Cuiles con errores:<br>${mensajesFormateados}<br>`,
        showConfirmButton: true,
        confirmButtonText: "Aceptar",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
      });
    } else {
      // swall de 1 segundo success
      Swal.fire({
        icon: "success",
        title: "Importación exitosa",
        showConfirmButton: false,
        timer: 1000,
      });

      setRowsAltaDDJJ(afiliadoImportado);
    }
  };

  const formatearFecha = (fecha) => {
    const partes = fecha.split("/");
    const anio = partes[2].length === 2 ? "20" + partes[2] : partes[2];
    const mes = partes[1].padStart(2, "0");
    const dia = partes[0];
    return `${anio}-${mes}-${dia}`;
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    setSelectedFileName(file ? file.name : "");

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const arraySinEncabezado = rows.slice(1);

        console.log(arraySinEncabezado);

        const arrayTransformado = arraySinEncabezado.map((item, index) => {
          return {
            id: index + 1,
            cuil: item[0],
            apellido: item[1],
            nombre: item[2],
            camara: item[3],
            categoria: item[4],
            fechaIngreso: formatearFecha(item[5]),
            empresaDomicilioId: plantas.find(
              (plantas) => plantas.planta === item[6]
            )?.id,
            remunerativo: item[7],
            noRemunerativo: item[8],
            adheridoSindicato: item[9] === "Si",
            pagaMutual: item[10] === "Si",
          };
        });

        setAfiliadoImportado(arrayTransformado);
        // setRowsAltaDDJJ(arrayTransformado);
      };

      reader.readAsArrayBuffer(file);
    }
  };

  const handleElegirOtroChange = (event) => {
    setMostrarPeriodos(event.target.value === "elegirOtro");
  };

  const guardarDeclaracionJurada = async () => {
    const altaDDJJFinal = {
      periodo: periodoIso,
      afiliados: rowsAltaDDJJ.map((item) => ({
        cuil: !item.cuil ? null : item.cuil,
        inte: null,
        apellido: !item.apellido ? null : item.apellido,
        nombre: !item.nombre ? null : item.nombre,
        fechaIngreso: !item.fechaIngreso ? null : item.fechaIngreso,
        empresaDomicilioId: !item.empresaDomicilioId
          ? null
          : item.empresaDomicilioId,
        camara: !item.camara ? null : item.camara,
        categoria: !item.categoria ? null : item.categoria,
        remunerativo: !item.remunerativo ? null : item.remunerativo,
        noRemunerativo: !item.noRemunerativo ? null : item.noRemunerativo,
        /* UOMASocio: item.aporteUomaCs && item.aporteUomaAs && item.aporteArt46 ? true : false,
                ANTIMASocio: item.aporteUomaCs && item.aporteUomaAs && item.aporteArt46 && item.aporteAntimaCs ? true : false, */
        UOMASocio: item.uomasocio,
        ANTIMASocio: item.antimasocio,
      })),
    };
    console.log(rowsAltaDDJJ);

    const erroresResponse = await axiosDDJJ.validar(ID_EMPRESA, altaDDJJFinal);
    console.log(erroresResponse);
    setValidacionResponse(erroresResponse);

    // Validar si validacionResponse es igual a {errores: Array(6)}
    if (erroresResponse.errores) {
      const mensajesUnicos = new Set();

      erroresResponse.errores.forEach((error) => {
        if (!mensajesUnicos.has(error.descripcion)) {
          mensajesUnicos.add(error.descripcion);
        }
      });

      const mensajesFormateados = Array.from(mensajesUnicos)
        .map((mensaje, index) => {
          return `<p>${index + 1} - ${mensaje}</p>`;
        })
        .join("");

      Swal.fire({
        icon: "error",
        title: "Oops...",
        html: `${mensajesFormateados}<br>
                      <label for="guardarErrores">¿Deseas guardar la declaración jurada con errores?</label>`,
        showConfirmButton: true,
        confirmButtonText: "Aceptar",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
      }).then(async (result) => {
        if (result.isConfirmed) {
          console.log("Aceptar...");

          /* if (peticion === "PUT") {

                        await actualizarDeclaracionJurada(TOKEN, ID_EMPRESA, altaDDJJFinal, idDDJJ);

                    } else {

                        await crearAltaDeclaracionJurada(TOKEN, ID_EMPRESA, altaDDJJFinal);
                    } */
        } else {
          console.log("Cancelar...");

          // limpiar la grilla
          setRowsAltaDDJJ([]);
        }
      });
    }
  };

  return (
    <div className="mis_alta_declaraciones_juradas_container">
      <div className="periodo_container">
        <h5 className="paso">Paso 1 - Indique período a presentar</h5>
        <Stack spacing={4} direction="row" alignItems="center">
          <h5 className="title_periodo">Período</h5>
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale={"es"}
            localeText={
              esES.components.MuiLocalizationProvider.defaultProps.localeText
            }
          >
            <DemoContainer components={["DatePicker"]}>
              <DesktopDatePicker
                label={"Periodo"}
                views={["month", "year"]}
                closeOnSelect={false}
                onChange={handleChangePeriodo}
                value={periodo}
                slotProps={{ actionBar: { actions: ["cancel", "accept"] } }}
                onAccept={handleAcceptPeriodoDDJJ}
              />
            </DemoContainer>
          </LocalizationProvider>
        </Stack>
      </div>

      <div className="presentacion_container">
        <h5 className="paso">Paso 2 - Elija un modo de presentación</h5>
        <div className="subir_archivo_container">
          <span className="span">1</span>
          <h5 className="title_subir_archivo">Subir un archivo CSV - XLSL</h5>
          <div className="file-select" id="src-file1">
            <input
              type="file"
              name="src-file1"
              aria-label="Archivo"
              onChange={handleFileChange}
              accept=".csv, .xlsx"
            />
            <div className="file-select-label" id="src-file1-label">
              {selectedFileName || "Nombre del archivo"}
            </div>
          </div>
          <Button
            variant="contained"
            sx={{
              padding: "6px 52px",
            }}
            onClick={importarAfiliado}
          >
            Subir
          </Button>
        </div>
        <div className="copiar_periodo_container">
          <span className="span">2</span>
          <h5 className="title_subir_archivo">Copiar un período anterior</h5>
          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            defaultValue="ultimoPeriodoPresentado"
            name="radio-buttons-group"
            sx={{ marginLeft: "67px" }}
            onChange={handleElegirOtroChange}
          >
            <FormControlLabel
              value="ultimoPeriodoPresentado"
              control={<Radio />}
              label="Ultimo período presentado"
            />
            <FormControlLabel
              value="elegirOtro"
              control={<Radio />}
              label="Elegir otro"
            />
            <div className="elegir_otro_container">
              {mostrarPeriodos && (
                <Stack
                  spacing={4}
                  direction="row"
                  sx={{ marginLeft: "-11px", marginTop: "10px" }}
                >
                  <LocalizationProvider
                    dateAdapter={AdapterDayjs}
                    adapterLocale={"es"}
                    localeText={
                      esES.components.MuiLocalizationProvider.defaultProps
                        .localeText
                    }
                  >
                    <DesktopDatePicker
                      label={"Otro Periodo"}
                      views={["month", "year"]}
                      closeOnSelect={false}
                      onChange={handleChangeOtroPeriodo}
                      value={otroPeriodo}
                      slotProps={{
                        actionBar: { actions: ["cancel", "accept"] },
                      }}
                      onAccept={handleAcceptOtroPeriodo}
                    />
                  </LocalizationProvider>
                </Stack>
              )}
            </div>
          </RadioGroup>
          <Button
            variant="contained"
            sx={{
              marginLeft: "114px",
              padding: "6px 45px",
            }}
          >
            Buscar
          </Button>
        </div>
        <div className="manualmente_container">
          <span className="span">3</span>
          <h5 className="title_manualmente">Cargar manualmente</h5>
          <Button
            variant="contained"
            sx={{
              padding: "6px 23px",
              marginLeft: "468px",
            }}
          >
            Seleccionar
          </Button>
        </div>
      </div>

      <div className="formulario_container">
        <h5 className="paso">Paso 3 - Completar el formulario</h5>
        <GrillaPasoTres
          rowsAltaDDJJ={rowsAltaDDJJ}
          setRowsAltaDDJJ={setRowsAltaDDJJ}
          rowsAltaDDJJAux={rowsAltaDDJJAux}
          setRowsAltaDDJJAux={setRowsAltaDDJJAux}
          token={TOKEN}
          camaras={camaras}
          categoriasFiltradas={categoriasFiltradas}
          setCategoriasFiltradas={setCategoriasFiltradas}
          afiliado={afiliado}
          setAfiliado={setAfiliado}
          todasLasCategorias={todasLasCategorias}
          plantas={plantas}
          validacionResponse={validacionResponse}
        />
        <div
          className="botones_container"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "20px",
          }}
        >
          <Button
            variant="contained" // Si quito esto se ve mejor ?????
            sx={{ padding: "6px 52px", marginLeft: "10px" }}
            onClick={guardarDeclaracionJurada}
          >
            Guardar
          </Button>
          <Button
            variant="contained"
            sx={{ padding: "6px 52px", marginLeft: "10px" }}
          >
            Presentar
          </Button>
        </div>
      </div>
    </div>
  );
};

// Como debe de venir la respuesa de la API

/* cuilesValidados = [
    {
     int nullo que no existe el afiliado
    }
]
 */

// int si existe o no en la base de datos
// validacion validar si el cuil es correcto
