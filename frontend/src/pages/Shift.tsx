import React, { FunctionComponent, useEffect, useState } from "react";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import CardContent from "@material-ui/core/CardContent";
import { makeStyles } from "@material-ui/core/styles";
import { getErrorMessage } from "../helper/error/index";
import { deleteShiftById, getShifts } from "../helper/api/shift";
import { createPublish } from "../helper/api/publish";
import DataTable from "react-data-table-component";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import { ArrowLeft, ArrowRight } from "@material-ui/icons";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import { useHistory } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import Alert from "@material-ui/lab/Alert";
import { Link as RouterLink } from "react-router-dom";
import { addDays, subDays, startOfWeek, endOfWeek, format } from 'date-fns';
import { Button, Box } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 275,
  },
  fab: {
    position: "absolute",
    bottom: 40,
    right: 40,
    backgroundColor: 'white',
    color: theme.color.turquoise
  },
}));

interface ActionButtonProps {
  id: string;
  onDelete: () => void;
  isDisableAction: boolean;
  publishId: any;
}

const ActionButton: FunctionComponent<ActionButtonProps> = ({
  id,
  onDelete,
  isDisableAction,
  publishId
}) => {
  return (
    <div>
      <IconButton
        size="small"
        aria-label="delete"
        component={RouterLink}
        to={`/shift/${id}/edit/${publishId}`}
        disabled={isDisableAction}
      >
        <EditIcon fontSize="small" />
      </IconButton>
      <IconButton  disabled={isDisableAction} size="small" aria-label="delete" onClick={() => onDelete()}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    </div>
  );
};

interface WeekPickerProps {
  startDate: string;
  endDate: string;
  isLoading: boolean;
  onNext: (date: Date) => void;
  onPrevious: (date: Date) => void;
  isPublished: boolean;
}

const WeekPicker: FunctionComponent<WeekPickerProps> = ({
  startDate,
  endDate,
  isLoading,
  onNext,
  onPrevious,
  isPublished,
}) => {
  if (isLoading) {
    return null
  }

  const startWeek = new Date(startDate);
  const startMonth = startWeek.toLocaleString('default', { month: 'short' });
  const endWeek = new Date(endDate);
  const endMonth = endWeek.toLocaleString('default', { month: 'short' });

  const textColor = isPublished ? '#26580f' : '#000000';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
    }}>
      <IconButton onClick={() => onPrevious(startWeek)}>
        <ArrowLeft />
      </IconButton>
      <Typography
        component="h1"
        variant="h6"
        style={{color: textColor}}
        >
        {`${startMonth} ${startWeek.getDate()} - ${endMonth} ${endWeek.getDate()}`}
      </Typography>
      <IconButton onClick={() => onNext(endWeek)}>
        <ArrowRight/>
      </IconButton>
  </div>  
  )
}

interface WeekData {
  startDate: string;
  endDate: string;
  isPublished: boolean;
  createdAt: string | null;
}

const Shift = () => {
  const classes = useStyles();
  const history = useHistory();

  const [week, setWeek] = useState<WeekData>({
    startDate: startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString(),
    endDate: endOfWeek(new Date(), { weekStartsOn: 1 }).toISOString(),
    isPublished: false,
    createdAt: null
  });

  const [publishId, setPublishId] = useState<number>(0);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [isDisableShiftAction, setDisableShiftAction] = useState(false);
  const [isDisablePublish, setDisablePublish] = useState(false);
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const onDeleteClick = (id: string) => {
    setSelectedId(id);
    setShowDeleteConfirm(true);
  };

  const onCloseDeleteDialog = () => {
    setSelectedId(null);
    setShowDeleteConfirm(false);
  };

  const handleWeekClick = (type: string, weekDate: Date): WeekData => {
    const output = { createdAt: null, isPublished: false };
    if (type === "NEXT") {
      return {
        ...output,
        startDate: addDays(weekDate, 1).toISOString(),
        endDate: addDays(weekDate, 7).toISOString(),
      }
    }
    return {
      ...output,
      startDate: subDays(weekDate, 7).toISOString(),
      endDate: subDays(weekDate, 1).toISOString()
    }
  }

  const onNextWeekClick = (endWeek: Date) => {
    const weekData = handleWeekClick("NEXT", endWeek);
    setWeek(weekData);
    fetchData(weekData.startDate, weekData.endDate);
  };

  const onPreviousWeekClick = (startWeek: Date) => {
    const weekData = handleWeekClick("PREV", startWeek);
    setWeek(weekData);
    fetchData(weekData.startDate, weekData.endDate);
  };

  const onPublishClick = async (id: number): Promise<void> => {
    await createPublish({ id });
    fetchData(week.startDate, week.endDate);
  }

  const handlePublishData = (isPublished: boolean, createdTime: string): void => {
    if (isPublished) {
      setDisablePublish(true);
      setDisableShiftAction(true);
      const createdAt = format(new Date(createdTime), "dd MMM yyyy, h:m aa");
      setPublishedAt(createdAt);
    } else {
      setDisablePublish(false);
    }
  }

  const handleDisplayData = (data: any): void => {
    if (data?.shifts.length) {
      setRows(data.shifts);
      setPublishId(data.id);
      setWeek(data);
      setDisableShiftAction(false);

      handlePublishData(data.isPublished, data.createdAt);
    } else {
      setRows([]);
      setDisableShiftAction(false);
      setDisablePublish(true);
    }
  }

  const fetchData = async (weekStart: string | Date, weekEnd: string | Date) => {
    try {
      setIsLoading(true);
      setErrMsg("");

      const { results } = await getShifts(weekStart, weekEnd);
      handleDisplayData(results);
    } catch (err) {
      const message = getErrorMessage(err);
      setErrMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(week.startDate, week.endDate);
  }, []);

  const columns = [
    {
      name: "Name",
      selector: "name",
      sortable: true,
    },
    {
      name: "Date",
      selector: "date",
      sortable: true,
    },
    {
      name: "Start Time",
      selector: "startTime",
      sortable: true,
    },
    {
      name: "End Time",
      selector: "endTime",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: any) => (
        <ActionButton 
          id={row.id} 
          publishId={publishId}
          onDelete={() => onDeleteClick(row.id)} 
          isDisableAction={isDisableShiftAction}
        />
      ),
    },
  ];

  const deleteDataById = async () => {
    try {
      setDeleteLoading(true);
      setErrMsg("");

      if (selectedId === null) {
        throw new Error("ID is null");
      }

      await deleteShiftById(selectedId);

      const tempRows = [...rows];
      const idx = tempRows.findIndex((v: any) => v.id === selectedId);
      tempRows.splice(idx, 1);
      setRows(tempRows);
    } catch (error) {
      const message = getErrorMessage(error);
      setErrMsg(message);
    } finally {
      setDeleteLoading(false);
      onCloseDeleteDialog();
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card className={classes.root}>
          <CardContent>
            {errMsg.length > 0 ? (
              <Alert severity="error">{errMsg}</Alert>
            ) : (
              <></>
            )}
            
            <WeekPicker
            isPublished={isDisableShiftAction}
            onPrevious={onPreviousWeekClick}
            onNext={onNextWeekClick}
            isLoading= {isLoading}
            startDate= {week.startDate}
            endDate= {week.endDate}
            />

            <Box
              display={'flex'}
              alignItems='right'
              flexWrap={'wrap'}
            >
              { publishedAt && week.isPublished
                ?  <Typography
                    variant="caption"
                    style={{
                      color: '#26580f', 
                      marginRight: '8px', 
                      marginLeft: 'auto', 
                      marginTop: 'auto', 
                      marginBottom: 'auto'
                    }}
                    >
                    {`Week published on ${publishedAt}`}
                  </Typography>  
                : <Typography style={{marginLeft: 'auto'}}></Typography>
              }
            
              <Button 
                variant="outlined" 
                disabled={isDisableShiftAction} 
                style={{marginRight: '16px', color: "#26580f"}}
                onClick={() => history.push("/shift/add")}
              >
                ADD SHIFT
              </Button>
              
              <Button variant="contained" 
                color="secondary" 
                disabled={isDisablePublish}
                onClick={() => onPublishClick(publishId)}
              >
                PUBLISH
              </Button>

            </Box>

            <DataTable
              columns={columns}
              data={rows}
              pagination
              progressPending={isLoading}
            />
          </CardContent>
        </Card>
      </Grid>
      <Fab
        size="medium"
        aria-label="add"
        className={classes.fab}
        onClick={() => history.push("/shift/add")}
      >
        <AddIcon />
      </Fab>
      <ConfirmDialog
        title="Delete Confirmation"
        description={`Do you want to delete this data ?`}
        onClose={onCloseDeleteDialog}
        open={showDeleteConfirm}
        onYes={deleteDataById}
        loading={deleteLoading}
      />
    </Grid>
  );
};

export default Shift;
