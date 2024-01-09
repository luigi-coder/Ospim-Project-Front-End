import { useState, useEffect, useMemo } from "react";
import { Box, Button } from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  DeleteOutlined as DeleteIcon,
  Save as SaveIcon,
  Close as CancelIcon,
} from "@mui/icons-material";

import {
  GridRowModes,
  DataGrid,
  GridToolbarContainer,
  GridActionsCellItem,
  GridRowEditStopReasons,
} from "@mui/x-data-grid";
import { actualizarFeriado, 
  crearFeriado, 
  eliminarFeriado, 
  obtenerFeriados } from "./FeriadosApi";
import { 
  createTheme, 
  ThemeProvider, 
  useTheme } from '@mui/material/styles';
import * as locales from '@mui/material/locale';
import "./Feriados.css";

function EditToolbar(props) {
  const { setRows, rows, setRowModesModel } = props;

  const handleClick = () => {
    const maxId = Math.max(...rows.map((row) => row.id), 0);
    const newId = maxId + 1;
    const id = newId;

    setRows((oldRows) => [
      { id, fecha: "", descripcion: "", isNew: true },
      ...oldRows,
    ]);
    setRowModesModel((oldModel) => ({
      [id]: { mode: GridRowModes.Edit, fieldToFocus: "name" },
      ...oldModel,
    }));
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
        Nuevo Registro
      </Button>
    </GridToolbarContainer>
  );
}

export const Feriados = () => {

  const [locale, setLocale] = useState('esES');
  const [rows, setRows] = useState([]);
  const [rowModesModel, setRowModesModel] = useState({});

  const TOKEN = JSON.parse(localStorage.getItem('stateLogin')).usuarioLogueado.usuario.token;

  const theme = useTheme();

  const themeWithLocale = useMemo(
    () => createTheme(theme, locales[locale]),
    [locale, theme],
  );

  useEffect(() => {
    const ObtenerFeriados = async () => {

      const feriadosResponse = await obtenerFeriados(TOKEN);
      setRows(feriadosResponse.map((item) => ({ id: item.id, ...item })));

    };

    ObtenerFeriados();

  }, []);

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (fila, id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id) => async () => {

    setRows((prevRows) => prevRows.filter((row) => row.id !== id));

    await eliminarFeriado(id, TOKEN);
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

    if (newRow.isNew) {

      const nuevoFeriado = {
        fecha: newRow.fecha,
        descripcion: newRow.descripcion,
      };

      await crearFeriado(nuevoFeriado, TOKEN);

    } else {

      const updatedFeriado = {
        fecha: newRow.fecha,
        descripcion: newRow.descripcion,
      };

      await actualizarFeriado(newRow.id, updatedFeriado, TOKEN);
    }

    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));

    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns = [
    {
      field: "fecha",
      headerName: "Fecha",
      width: 500,
      type: "date",
      editable: true,
      headerAlign: "center",
      align: "center",
      headerClassName: 'header--cell',
      valueFormatter: (params) => {
        
        const date = new Date(params.value);
      
        const day = date.getUTCDate().toString().padStart(2, "0");
        const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
        const year = date.getUTCFullYear();
      
        return `${day}-${month}-${year}`;
      },
    },
    {
      field: "descripcion",
      headerName: "Descripción",
      width: 520,
      editable: true,
      headerAlign: "center",
      align: "center",
      headerClassName: 'header--cell',
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Acciones",
      width: 505,
      cellClassName: "actions",
      headerAlign: "center",
      align: "center",
      headerClassName: 'header--cell',
      getActions: (params) => {
        const isInEditMode =
          rowModesModel[params.row.id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: "primary.main",
              }}
              onClick={handleSaveClick(params.row, params.row.id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(params.row.id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(params.row.id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            color="inherit"
            onClick={handleDeleteClick(params.row.id)}
          />,
        ];
      },
    },
  ];

  return (
    <div className="feriados_container">
      <h1>Administración de feriados</h1>
      <Box
        sx={{
          height: "400px",
          width: "100%",
          "& .actions": {
            color: "text.secondary",
          },
          "& .textPrimary": {
            color: "text.primary",
          },
        }}
      >
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
              toolbar: EditToolbar,
            }}
            slotProps={{
              toolbar: { setRows, rows, setRowModesModel },
            }}
            sx={{
              '& .MuiDataGrid-virtualScroller::-webkit-scrollbar': {
                width: '8px',
                visibility: 'visible',
              },
              '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb': {
                backgroundColor: '#ccc',
              },
            }}
            initialState={{
              ...rows.initialState,
              pagination: {
                paginationModel: { pageSize: 5 },
              },
            }}
            pageSizeOptions={[5, 10, 25]}
          />
        </ThemeProvider>
      </Box>
    </div>
  );
}
