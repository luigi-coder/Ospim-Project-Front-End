import { useState, useEffect } from "react";
import {
  GridRowModes,
  DataGrid,
  GridToolbarContainer,
  GridActionsCellItem,
  GridRowEditStopReasons,
} from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import {
  actualizarContacto,
  crearContacto,
  eliminarContacto,
  obtenerDatosEmpresa,
  obtenerTipo,
} from "./GrillaEmpresaContactoApi";
import Box from "@mui/material/Box";

function EditToolbar(props) {
  const { setRows, rows, setRowModesModel } = props;

  const handleClick = () => {
    const maxId = Math.max(...rows.map((row) => row.id), 0);

    const newId = maxId + 1;

    const id = newId;

    setRows((oldRows) => [
      { id, tipo: "", prefijo: "", valor: "", isNew: true },
      ...oldRows,
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: "name" },
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

export const GrillaEmpresaContacto = ({ rows, setRows, token }) => {

  const [rowModesModel, setRowModesModel] = useState({});
  const [tipoContacto, setTipoContacto] = useState([]);

  useEffect(() => {
    const getTipoContacto = async () => {
      const tipo = await obtenerTipo(token);

      setTipoContacto(tipo.map((item) => ({ ...item })));
    };
    getTipoContacto();
  }, []);

  useEffect(() => {
    const getDatosEmpresa = async () => {
      const datosEmpresa = await obtenerDatosEmpresa(token);

      setRows(datosEmpresa.map((item) => ({ ...item, id: item.id })));
    };
    getDatosEmpresa();
  }, []);

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
    setRows(rows.filter((row) => row.id !== id));

    await eliminarContacto(id, token);
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
      const nuevoContacto = {
        tipo: newRow.tipo,
        prefijo: newRow.prefijo,
        valor: newRow.valor,
      };

      await crearContacto(nuevoContacto, token);

    } else {

      const contacto = {
        tipo: newRow.tipo,
        prefijo: newRow.prefijo,
        valor: newRow.valor,
      };

      await actualizarContacto(newRow.id, contacto, token);
    }

    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));

    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns = [
    {
      field: "tipo",
      headerName: "Tipo de contacto",
      width: 240,
      editable: true,
      type: "singleSelect",
      headerAlign: "center",
      align: "center",
      headerClassName: 'header--cell',
      valueOptions: tipoContacto.map((item) => {
        return {
          value: item.codigo,
          label: item.descripcion,
        };
      }),
    },
    {
      field: "prefijo",
      headerName: "Prefijo",
      width: 240,
      type: "string",
      editable: true,
      headerAlign: "center",
      align: "center",
      headerClassName: 'header--cell',
    },
    {
      field: "valor",
      headerName: "Valor de contacto",
      width: 240,
      type: "string",
      editable: true,
      headerAlign: "center",
      align: "center",
      headerClassName: 'header--cell',
    },
    {
      field: "actions",
      headerName: "Acciones",
      width: 240,
      type: "actions",
      headerAlign: "center",
      align: "center",
      headerClassName: 'header--cell',
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
    <Box
      sx={{
        height: "400px",
        width: "100%",
        overflowX: "scroll",
        "& .actions": {
          color: "text.secondary",
        },
        "& .textPrimary": {
          color: "text.primary",
        },
      }}
    >
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
        /* sx={{
          // ...
          '& .MuiDataGrid-virtualScroller::-webkit-scrollbar': {
            width: '8px',
            visibility: 'visible',
          },
          '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb': {
            backgroundColor: '#ccc',
          },
        }} */
        initialState={{
          ...rows.initialState,
          pagination: {
            paginationModel: { pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10, 25]}
      />
    </Box>
  );
};
