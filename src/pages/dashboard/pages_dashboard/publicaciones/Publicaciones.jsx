import { useState, useEffect, useMemo } from "react";
import { crearPublicacion, obtenerPublicaciones, actualizarPublicacion, eliminarPublicacion } from "./PublicacionesApi";
import { EditarNuevaFila } from "./PublicacionNueva";
import {
  GridRowModes,
  DataGrid,
  GridActionsCellItem,
  GridRowEditStopReasons,
} from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import * as locales from '@mui/material/locale';
import Swal from 'sweetalert2'
import "./Publicaciones.css";  
import { ThreeCircles } from 'react-loader-spinner';

export const Publicaciones = () => {

  const [locale, setLocale] = useState('esES');
  const [rows, setRows] = useState([]);
  const [rowModesModel, setRowModesModel] = useState({});
  const [showDataGrid, setShowDataGrid] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  const TOKEN = JSON.parse(localStorage.getItem('stateLogin')).usuarioLogueado.usuario.token;

  const theme = useTheme();

  const themeWithLocale = useMemo(
    () => createTheme(theme, locales[locale]),
    [locale, theme],
  );

  useEffect(() => {
    const ObtenerPublicaciones = async () => {
      const publicaciones = await obtenerPublicaciones(TOKEN);
      setRows(publicaciones.map((item, index) => ({ ...item, id: item.id })));
    };

    ObtenerPublicaciones();
  }, []);

  const volverPrimerPagina = () => {
    setPaginationModel((prevPaginationModel) => ({
      ...prevPaginationModel,
      page: 0,
    }));
  };

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id) => async () => {

    /* setRowModesModel((oldModel) => {
      const newModel = { ...oldModel };
      delete newModel[id];
      return newModel;
    }); */

    const showSwalConfirm = async () => {
      try {
        Swal.fire({
          title: '¿Estás seguro?',
          text: "¡No podrás revertir esto!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#1A76D2',
          cancelButtonColor: '#6c757d',
          confirmButtonText: 'Si, bórralo!'
        }).then(async (result) => {
          if (result.isConfirmed) {
            setRows((oldRows) => oldRows.filter((row) => row.id !== id));
            await eliminarPublicacion(id, TOKEN);
          }
        });
      } catch (error) {
        console.error('Error al ejecutar eliminarFeriado:', error);
      }
    };

    showSwalConfirm();
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = async (newRow) => {
    const updatedRow = { ...newRow, isNew: false };

    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));

    const fechaDesde = new Date(newRow.vigenciaDesde);
    const fechaHasta = new Date(newRow.vigenciaHasta);

    fechaDesde.setUTCHours(0, 0, 0, 0);
    fechaHasta.setUTCHours(0, 0, 0, 0);

    const fechaDesdeFormateada = fechaDesde.toISOString();
    const fechaHastaFormateada = fechaHasta.toISOString();

    if (newRow.isNew) {
      const nuevaPublicacion = {
        titulo: newRow.titulo,
        cuerpo: newRow.cuerpo,
        vigenciaDesde: fechaDesdeFormateada,
        vigenciaHasta: fechaHastaFormateada,
      };

      await crearPublicacion(nuevaPublicacion, TOKEN);
    } else {
      const publicacionEditada = {
        titulo: newRow.titulo,
        cuerpo: newRow.cuerpo,
        vigenciaDesde: fechaDesdeFormateada,
        vigenciaHasta: fechaHastaFormateada,
      };

      await actualizarPublicacion(newRow.id, publicacionEditada, TOKEN);
    }

    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  useEffect(()=>{
    const timer = setTimeout(() => {
      setShowDataGrid(true);
    }, 2000);

    return () => clearTimeout(timer);

  })
  const columns = [
    {
      field: "titulo",
      headerName: "Titulo",
      flex: 1,
      type: "string",
      editable: true,
      headerAlign: "center",
      align: "center",
      headerClassName: 'header--cell',
    },
    {
      field: "cuerpo",
      headerName: "Cuerpo",
      flex: 1,
      type: "string",
      editable: true,
      headerAlign: "center",
      align: "center",
      headerClassName: 'header--cell header--cell--left',
    },
    {
      field: "vigenciaDesde",
      headerName: "Vigencia Desde",
      flex: 1,
      type: "date",
      editable: true,
      headerAlign: "center",
      align: "center",
      headerClassName: 'header--cell header--cell--left',
      valueFormatter: (params) => {

        const date = new Date(params.value);

        const day = date.getUTCDate().toString().padStart(2, "0");
        const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
        const year = date.getUTCFullYear();

        return `${day}-${month}-${year}`;
      },
    },
    {
      field: "vigenciaHasta",
      headerName: "Vigencia Hasta",
      flex: 1,
      type: "date",
      editable: true,
      headerAlign: "center",
      align: "center",
      headerClassName: 'header--cell header--cell--left',
      valueFormatter: (params) => {

        const date = new Date(params.value);

        const day = date.getUTCDate().toString().padStart(2, "0");
        const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
        const year = date.getUTCFullYear();

        return `${day}-${month}-${year}`;
      },
    },
    {
      field: "actions",
      headerName: "Acciones",
      flex: 1,
      type: "actions",
      headerAlign: "center",
      align: "center",
      headerClassName: 'header--cell header--cell--left',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: "primary.main",
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <div className="publicaciones_container">
      <h1>Administracion de Publicaciones</h1>
      <Box
        sx={{
          height: "600px",
          width: "100%",
          "& .actions": {
            color: "text.secondary",
          },
          "& .textPrimary": {
            color: "text.primary",
          },
        }}
      >
        {
          !showDataGrid && (
            <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <ThreeCircles
            visible={true}
            height="100"
            width="100"
            color="#1A76D2"
            ariaLabel="three-circles-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
          <ThreeCircles
            visible={true}
            height="100"
            width="100"
            color="#1A76D2"
            ariaLabel="three-circles-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
          <ThreeCircles
            visible={true}
            height="100"
            width="100"
            color="#1A76D2"
            ariaLabel="three-circles-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
        </div>
          )
        }
        {
          showDataGrid && (
            <ThemeProvider theme={themeWithLocale}>
              <DataGrid
                rows={rows}
                columns={columns}
                editMode="row"
                rowModesModel={rowModesModel}
                onRowModesModelChange={handleRowModesModelChange}
                onRowEditStop={handleRowEditStop}
                processRowUpdate={processRowUpdate}
                slots={{
                  toolbar: EditarNuevaFila,
                }}
                slotProps={{
                  toolbar: { setRows, rows, setRowModesModel, volverPrimerPagina },
                }}
                sx={{
                  '& .MuiDataGrid-virtualScroller::-webkit-scrollbar': {
                    width: '8px',
                    visibility: 'visible',
                  },
                  '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb': {
                    backgroundColor: '#ccc',
                  },
                  '& .css-1iyq7zh-MuiDataGrid-columnHeaders': {
                    backgroundColor: '#1A76D2 !important',
                  },
                }}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[10, 15, 25]}
              />
            </ThemeProvider>
          )
        }
      </Box>
    </div>
  );
};


