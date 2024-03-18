import { GridRowModes, GridToolbarContainer } from "@mui/x-data-grid";

import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";

export const EditarNuevaFila = (props) => {
  const { setRows, rows, setRowModesModel, volverPrimerPagina } = props;

  const handleClick = () => {
    const maxId = rows ? Math.max(...rows.map((row) => row.internalId), 0) : 1;
    const newId = maxId + 1;
    const internalId = newId;

    volverPrimerPagina();

    setRows((oldRows) => [
      {
        internalId,
        titulo: "",
        cuerpo: "",
        vigenciaDesde: "",
        vigenciaHasta: "",
        isNew: true,
      },
      ...oldRows,
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [internalId]: { mode: GridRowModes.Edit, fieldToFocus: "name" },
    }));
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
        Nuevo Registro
      </Button>
    </GridToolbarContainer>
  );
};
