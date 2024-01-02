const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
import { useState, useEffect, useRef } from "react";
import { MenuItem, Select } from "@mui/material";
import {
  GridRowModes,
  DataGrid,
  GridToolbarContainer,
  GridActionsCellItem,
  GridRowEditStopReasons,
} from "@mui/x-data-grid";

import axios from "axios";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import { actualizarFilaDomicilio, crearFilaDomicilio, eliminarFilaDomicilio, obtenerFilasDomicilio, obtenerLocalidades, obtenerProvincias, obtenerTipoDomicilio } from "./GrillaEmpresaDomicilioApi";

function EditToolbar(props) {
  const { setRowsDomicilio, rows_domicilio, setRowModesModel } = props;

  const handleClick = () => {
    const maxId = Math.max(...rows_domicilio.map((row) => row.id), 0);

    const newId = maxId + 1;

    const id = newId;

    setRowsDomicilio((oldRows) => [
      {
        id,
        tipo: "",
        provinciaId: "",
        localidadId: "",
        calle: "",
        piso: "",
        dpto: "",
        oficina: "",
        cp: "",
        planta: "",
        valor: "",
        isNew: true,
      },
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
        Agregar contacto
      </Button>
    </GridToolbarContainer>
  );
}

export const GrillaEmpresaDomilicio = ({
  rowsDomicilio,
  setRowsDomicilio,
  token,
}) => {
  const [rowModesModel, setRowModesModel] = useState({});
  const [tipoDomicilio, setTipoDomicilio] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [localidades, setLocalidades] = useState([]);

  const getTipoDomicilio = async () => {
    
    const tiposResponse = await obtenerTipoDomicilio(token);

    setTipoDomicilio(tiposResponse.map((item) => ({ ...item })));
  };

  const getProvincias = async () => {
      const provinciasResponse = await obtenerProvincias(token);
      setProvincias(provinciasResponse.map((item) => ({ ...item })));
  };

  const getLocalidades = async (provinciaId) => {
    console.log("provinciaId:", provinciaId);
    if (provinciaId) {
      
      return await obtenerLocalidades(token, provinciaId)
    }
  };

  const getRowsDomicilio = async () => {

    const domiciliosResponse = await obtenerFilasDomicilio(token);
    setRowsDomicilio(domiciliosResponse.map((item) => ({ ...item })));
    getDatosLocalidad(domiciliosResponse.map((item) => ({ ...item })));
  };

  const getDatosLocalidad = async (rowsDomicilio) => {
    const localidadesTemp = [];
    for (const reg of rowsDomicilio) {
      try {
        const vecRegProv = localidadesTemp.filter(
          (locTmp) => locTmp.provinciaId == reg.provinciaId
        );

        if (vecRegProv.length == 0) {
          const localidad = await getLocalidades(reg.provinciaId);

          // Agregar el campo idProvincia a cada objeto de localidades
          const localidadesConIdProvincia = localidad.map((item) => ({
            provinciaId: reg.provinciaId,
            ...item,
          }));
          localidadesTemp.push(...localidadesConIdProvincia);
        }
      } catch (error) {
        console.error("** Error al obtener localidades:", error);
      }
    }
    setLocalidades(localidadesTemp);
  };

  const actualizarDatosLocalidad = async (provinciaId) => {
    var options = [];
    options = localidades.filter((item) => {
      return item.provinciaId == provinciaId;
    });
    if (options.length == 0) {
      const localidad = await getLocalidades(provinciaId)

      if(localidad){

        const localidadesConIdProvincia = localidad.map((item) => ({
          provinciaId: provinciaId,
          ...item,
        }));
        localidadesConIdProvincia.push(...localidades);
        setLocalidades(localidadesConIdProvincia);
      }
    }
  };

  useEffect(() => {
    getProvincias();
  }, []);
  useEffect(() => {
    getTipoDomicilio();
  }, []);
  useEffect(() => {
    getRowsDomicilio();
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
    setRowsDomicilio(rowsDomicilio.filter((row) => row.id !== id));
    await eliminarFilaDomicilio(token, id);
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rowsDomicilio.find((row) => row.id === id);
    if (editedRow.isNew) {
      setRowsDomicilio(rowsDomicilio.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = async (newRow) => {
    const updatedRow = { ...newRow, isNew: false };

    if(newRow.isNew){
      
      const domicilio = {
        tipo: newRow.tipo,
        provinciaId: newRow.provinciaId,
        localidadId: newRow.localidadId,
        calle: newRow.calle,
        piso: newRow.piso,
        depto: newRow.depto,
        oficina: newRow.oficina,
        cp: newRow.cp,
        planta: newRow.planta,
      };

      await crearFilaDomicilio(token, domicilio);
    }else {

      const domicilio = {
        tipo: newRow.tipo,
        provinciaId: newRow.provinciaId,
        localidadId: newRow.localidadId,
        calle: newRow.calle,
        piso: newRow.piso,
        depto: newRow.depto,
        oficina: newRow.oficina,
        cp: newRow.cp,
        planta: newRow.planta,
      };

      await actualizarFilaDomicilio(token, newRow.id, domicilio);
    }

    setRowsDomicilio(
      rowsDomicilio.map((row) => (row.id === newRow.id ? updatedRow : row))
    );

    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleCellEditStart = (params, event, details) => {
    // Realiza acciones personalizadas cuando comienza la edición de una celda
    console.log("Cell edit started:", params, event, details);
  };

  const columns = [
    {
      field: "tipo",
      headerName: "Tipo",
      width: 120,
      editable: true,
      type: "singleSelect",
      getOptionValue: (dato) => dato.codigo,
      getOptionLabel: (dato) => dato.descripcion,
      valueOptions: tipoDomicilio,
    },
    {
      field: "provinciaId",
      headerName: "Provincia",
      width: 200,
      editable: true,
      type: "singleSelect",
      valueOptions: provincias,
      getOptionValue: (dato) => dato.id,
      getOptionLabel: (dato) => dato.descripcion,
      renderEditCell: (params) => {
        actualizarDatosLocalidad(params.value);
        return (
          <Select
            value={params.value}
            onChange={(e) => {
              
              params.api.setEditCellValue(
                {
                  id: params.id,
                  field: "provinciaId",
                  value: e.target.value,
                },
                e.target.value
              );

              console.log("params:", params);
              console.log(params.row.localidadId);
              params.row.localidadId = "";
            }}
            sx={{ width: 200 }}
          >
            {provincias.map((item) => {
              return (
                <MenuItem key={item.id} value={item.id}>
                  {item.descripcion}
                </MenuItem>
              );
            })}
          </Select>
        );
      },
    },
    {
      field: "localidadId",
      headerName: "Localidad",
      width: 220,
      editable: true,
      type: "singleSelect",
      //valueOptions: localidadesList,
      valueOptions: ({ row }) => {
        var options = localidades.filter((item) => {
          return item.provinciaId == row.provinciaId;
        });
        return options;
      },
      getOptionValue: (dato) => dato.id,
      getOptionLabel: (dato) => dato.descripcion,
      renderEditCell: (params) => {
        // limpiar el campo localidadId cuando se cambia la provincia
        var datos = localidades.filter((item) => {
          return item.provinciaId == params.row.provinciaId;
        });
        return (
          <Select
            value={params.value}
            onChange={(e) => {
              params.api.setEditCellValue(
                {
                  id: params.id,
                  field: "localidadId",
                  value: e.target.value,
                },
                e.target.value
              );
            }}
            sx={{ width: 220 }}
          >
            {datos.map((item) => {
              return (
                <MenuItem key={item.id} value={item.id}>
                  {item.descripcion}
                </MenuItem>
              );
            })}
          </Select>
        );
      },
    },
    {
      field: "calle",
      headerName: "Calle",
      width: 120,
      editable: true,
    },
    {
      field: "piso",
      headerName: "Piso",
      width: 80,
      editable: true,
    },
    {
      field: "depto",
      headerName: "Depto",
      width: 80,
      editable: true,
    },
    {
      field: "oficina",
      headerName: "Oficina",
      width: 100,
      editable: true,
    },
    {
      field: "cp",
      headerName: "CP",
      width: 80,
      editable: true,
    },
    {
      field: "planta",
      headerName: "Planta",
      width: 100,
      editable: true,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      cellClassName: "actions",
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
        height: "auto",
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
        autoHeight
        columns={columns}
        rows={rowsDomicilio}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        onCellEditStart={handleCellEditStart}
        processRowUpdate={processRowUpdate}
        slots={{
          toolbar: EditToolbar,
        }}
        slotProps={{
          toolbar: {
            setRowsDomicilio,
            rows_domicilio: rowsDomicilio,
            setRowModesModel,
          },
        }}
        localeText={{
          noRowsLabel: "",
        }}
      />
    </Box>
  );
};