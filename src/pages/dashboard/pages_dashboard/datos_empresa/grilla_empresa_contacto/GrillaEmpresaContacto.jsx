import { useState, useEffect } from 'react';

import {
    GridRowModes,
    DataGrid,
    GridToolbarContainer,
    GridActionsCellItem,
    GridRowEditStopReasons,
} from '@mui/x-data-grid';

import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { crearFilaContacto, eliminarFilaContacto, modificarFilaContacto, obtenerDatosEmpresa, obtenerTipo } from './GrillaEmpresaContactoApi';


function EditToolbar(props) {
    const { setRows, rows, setRowModesModel } = props;

    const handleClick = () => {

        const maxId = Math.max(...rows.map((row) => row.id), 0);

        const newId = maxId + 1;

        const id = newId;

        setRows((oldRows) => [{ id, tipo: '', prefijo: '', valor: '', isNew: true }, ...oldRows]);
        setRowModesModel((oldModel) => ({
            ...oldModel,
            [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
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

export const GrillaEmpresaContacto = ({ rows, setRows, BACKEND_URL, token }) => {

    const [rowModesModel, setRowModesModel] = useState({});  // pasar
    const [tipoContacto, setTipoContacto] = useState([]); // pasar

    useEffect(() => {
        const getTipoContacto = async () => {
            
            const tipo = await obtenerTipo(token);

            setTipoContacto(tipo.map((item) => ({ ...item })));
        }
        getTipoContacto();
    }, []);

    useEffect(() => {
        const getDatosEmpresa = async () => {
            
            const datosEmpresa = await obtenerDatosEmpresa(token);

            setRows(datosEmpresa.map((item) => ({ ...item, id: item.id })));
        }
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
        
        await eliminarFilaContacto(token, id)
    }

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

        console.log(newRow);

        if (newRow.isNew) {

            const nuevoContacto = {
                tipo: newRow.tipo,
                prefijo: newRow.prefijo,
                valor: newRow.valor,
            }

            await crearFilaContacto(token, nuevoContacto);

        } else {

            console.log("Fila existente");

            const contacto = {
                tipo: newRow.tipo,
                prefijo: newRow.prefijo,
                valor: newRow.valor,
            }

            await modificarFilaContacto(token, newRow.id, contacto);
        }

        setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));

        return updatedRow;
    }

    const handleRowModesModelChange = (newRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    const columns = [
        {
            field: 'tipo',
            headerName: 'Tipo de contacto',
            width: 150,
            editable: true,
            type: 'singleSelect',
            valueOptions: tipoContacto.map((item) => {
                return {
                    value: item.codigo,
                    label: item.descripcion
                }
            })
        },
        {
            field: 'prefijo',
            headerName: 'Prefijo',
            width: 100,
            type: 'string',
            headerAlign: 'left',
            align: 'left',
            editable: true,
        },
        {
            field: 'valor',
            headerName: 'Valor de contacto',
            width: 200,
            type: 'string',
            editable: true,
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            type: 'actions',
            getActions: ({ id }) => {
                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            icon={<SaveIcon />}
                            label="Save"
                            sx={{
                                color: 'primary.main',
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
        }
    ]

    return (
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
        />
    )
}