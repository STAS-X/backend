import React, { useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { useSelector } from 'react-redux';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@material-ui/icons/DeleteRounded';
import UnSelectedIcon from '@material-ui/icons/UndoRounded';
import CreateCommentIcon from '@material-ui/icons/AddCommentRounded';
import EditCommentIcon from '@material-ui/icons/EditAttributesRounded';
import MailIcon from '@material-ui/icons/MailOutline';
import TagFacesIcon from '@material-ui/icons/TagFaces';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import {
  getRandomInt,
  dateWithMonths,
  dateWithDays,
} from '../../../utils/getRandomInt';
import { green, blue, red } from '@mui/material/colors';
import {
  Datagrid,
  ListBase,
  TextField,
  ShowButton,
  EditButton,
  DeleteButton,
  RichTextField,
  FilterButton,
  FilterForm,
  CreateButton,
  ChipField,
  DateField,
  TextInput,
  SortButton,
  FunctionField,
  useListContext,
  DatagridBody,
  ArrayField,
  NumberField,
  RecordContextProvider,
  useUnselectAll,
  DeleteWithConfirmButton,
  useDeleteMany,
  useGetOne,
  useRefresh,
  useNotify,
  useGetMany,
  useGetList,
  useRecordContext,
  useTranslate,
  Pagination as RaPagination,
  PaginationActions as RaPaginationActions,
} from 'react-admin';
import {
  TableCell,
  TableRow,
  Toolbar,
  Box,
  CircularProgress,
  Stack,
  Card,
  Chip,
  Button,
  Divider,
  Avatar,
  Checkbox,
} from '@mui/material';
import { makeStyles } from '@material-ui/core/styles';
import { dateFormatter } from '../../../utils/displayDate';
import Loading from '../../ui/loading/loading';
import TaskAsideCard from '../../common/cards/task.card.aside';
import TaskCard from '../../common/cards/task.card.list';
import { getAuthData } from '../../../store/authcontext';
import TaskProgressBar from '../../common/progressbar/task.progress';
import {
  getAppColorized,
  getAppLoading,
  getAppCarding,
} from '../../../store/appcontext';

const QuickFilter = ({ label }) => {
  const translate = useTranslate();
  return <Chip sx={{ marginBottom: 1 }} label={translate(label)} />;
};

const PaginationActions = (props) => {
  //console.log(props, 'pagination inside props');
  return (
    <RaPaginationActions
      {...props}
      // these props are passed down to the MUI <Pagination> component
      color="primary"
    />
  );
};

const TaskPagination = (props) => {
  return (
    <RaPagination
      {...props}
      rowsPerPageOptions={[10, 15, 20]}
      ActionsComponent={RaPaginationActions}
    />
  );
};

const taskFilters = (userId) => [
  <TextInput label="Глобальный поиск" source="q" alwaysOn />,
  <TextInput
    resettable
    source="title"
    label="По наименованию"
    defaultValue="Заголовок"
  />,
  <QuickFilter
    source="createdAt_gte"
    label="За последний месяц"
    defaultValue={dateWithMonths(-1)}
  />,
  <QuickFilter
    source="createdAt_lte"
    label="Ранее 1 месяца"
    defaultValue={dateWithMonths(-1)}
  />,
  <QuickFilter
    source="status_eq"
    label="Завешенные"
    defaultValue={{
      status: true,
    }}
  />,
  <QuickFilter
    source="status_neq"
    label="Незавешенные"
    defaultValue={{
      status: false,
    }}
  />,
  <QuickFilter
    source="executeAt_lte"
    label="Просроченные"
    defaultValue={{
      executeAt_lte: new Date(),
      status: false,
    }}
  />,
  <QuickFilter
    source="progress_lte"
    label="На исполнении"
    defaultValue={{
      executeAt_gte: new Date(),
      status: false,
    }}
  />,
  <QuickFilter
    source="userId"
    label="Создано пользователем"
    defaultValue={userId}
  />,
  <QuickFilter
    source="executors_arr"
    label="Назначено пользователю"
    defaultValue={userId}
  />,
];

const DeleteTasksButton = ({ tasksIds, setTasksIds }) => {
  const refresh = useRefresh();
  const notify = useNotify();
  const [deleteMany, { loading, loaded, data, total, error }] = useDeleteMany(
    'tasks',
    tasksIds
  );
  const handleClick = () => {
    if (confirm('Уверены, что хотите удалить задачи?')) {
      deleteMany();
    }
  };

  if (loaded && !error && data?.length > 0) {
    //console.info(isLoading, total, error,'test for delete many');
    notify(`Задачи ${tasksIds} удалены успешно`);
    setTasksIds([]);
    refresh();
  }

  return (
    <Button
      variant="text"
      className="RaButton-button"
      disabled={tasksIds.length === 0 || loading}
      sx={{
        '& > *': { color: '#3f51b5' },
        fontFamily:
          '-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif',
        fontSize: '0.8125rem',
        color: '#3f51b5',
      }}
      startIcon={!(tasksIds.length === 0 || loading) && <DeleteIcon />}
      onClick={handleClick}
    >
      Delete All
    </Button>
  );
};

const UnselectButton = ({ setTasksIds }) => {
  const handleClick = () => {
    setTasksIds([]);
  };

  return (
    <Button
      variant="text"
      color="primary"
      sx={{
        '& > *': { color: '#3f51b5' },
        fontFamily:
          '-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif',
        fontSize: '0.8125rem',
        color: '#3f51b5',
      }}
      startIcon={<UnSelectedIcon />}
      onClick={handleClick}
    >
      UnSelect All
    </Button>
  );
};

const TaskToolbar = ({ tasksIds, setTasksIds, userId }) => {
  const filters = taskFilters(userId);

  return (
    <Stack direction="row" justifyContent="space-between">
      <FilterForm filters={filters} />
      <div>
        <SortButton
          fields={[
            'title',
            'createdAt',
            'executeAt',
            'status',
            'progress',
            'commentable',
          ]}
        />
        <FilterButton filters={filters} />
        <CreateButton />
        <DeleteTasksButton tasksIds={tasksIds} setTasksIds={setTasksIds} />
        {tasksIds.length > 0 && <UnselectButton setTasksIds={setTasksIds} />}
      </div>
    </Stack>
  );
};

const getTaskResult = (data) => {
  if (data.status) {
    if (new Date(data.finishedAt) <= new Date(data.executeAt)) {
      return 1;
    } else {
      return 0;
    }
  } else {
    if (new Date(data.executeAt) < new Date()) {
      if (data.progress < 100) {
        return -1;
      } else {
        return 1;
      }
    } else {
      return 0;
    }
  }
};

const KeywordsField = ({ keywords }) => {
  console.log(keywords);
  if (!keywords) return <h5>Тэги не заданы</h5>;

  const tagsCount = keywords.length;

  return (
    <>
      {keywords && (
        <Stack
          direction="row"
          /*divider={<Divider orientation="vertical" flexItem />} */

          sx={{
            maxWidth: 'min-content',
            justifyContent: 'flex-start',
            alignContent: 'space-between',
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          {keywords.map((key, ind) => (
            <Chip
              key={ind}
              label={key}
              sx={{
                '&': {
                  backgroundColor:
                    tagsCount > 4
                      ? green[200]
                      : tagsCount > 2
                      ? blue[200]
                      : red[200],
                  color:
                    tagsCount > 4
                      ? red[600]
                      : tagsCount > 2
                      ? green[600]
                      : blue[600],
                  display: 'inline-flex',
                  fontWeight: 'bold',
                  fontSize: 14,
                  transition: '150ms ease-out',
                  'span:after': {
                    content:
                      tagsCount > 4
                        ? '" 😃"'
                        : tagsCount > 2
                        ? '" 😐"'
                        : '"  😉"',
                  },
                  '&:hover': {
                    opacity: 0.7,
                    boxShadow:
                      '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                  },
                },
              }}
            />
          ))}
        </Stack>
      )}
    </>
  );
};

const ExecutorsField = ({ executors: ids, ...data }) => {
  if (!ids) return <h5>Исполнители не назначены</h5>;

  const { data: users, loading, loaded, error } = useGetMany('users', ids);

  if (loading || !loaded) return <CircularProgress color="inherit" />;

  if (error) {
    return <p>ERROR</p>;
  }
  const result = getTaskResult(data);

  return (
    <>
      {users && (
        <Stack
          direction="row"
          /*divider={<Divider orientation="vertical" flexItem />} */

          sx={{
            maxWidth: 'min-content',
            justifyContent: 'flex-start',
            alignContent: 'space-between',
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          {users.map((user, ind) => (
            <Chip
              key={ind}
              label={user.name + '' ? user.name : '-XXX-'}
              sx={{
                '&': {
                  backgroundColor: result === 1 ? blue[200] : green[200],
                  color:
                    result === 1
                      ? green[600]
                      : result === 0
                      ? blue[600]
                      : red[600],
                  display: 'inline-flex',
                  fontWeight: 'bold',
                  fontSize: 14,
                  transition: '50ms ease-out',
                  'span:after': {
                    content:
                      result === 1
                        ? '" 😃"'
                        : result === 0
                        ? '" 😐"'
                        : '"  😉"',
                  },
                  '&:hover': {
                    opacity: 0.9,
                    boxShadow:
                      '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                  },
                },
              }}
              avatar={
                <Avatar
                  alt="Пользователь"
                  src={
                    user.url
                      ? user.url
                      : `https://i.pravatar.cc/300?u=${user.id}`
                  }
                  sx={{ width: 24, height: 24 }}
                />
              }
            />
          ))}
        </Stack>
      )}
    </>
  );
};

export const TaskList = (props) => {
  const [tasksIds, setTasksIds] = React.useState([]);
  const [hoverId, setHoverId] = React.useState();

  const { loadedOnce: isLoading, ids } = useSelector(
    (state) => state.admin.resources.tasks.list
  );
  const tasks = useSelector((state) => state.admin.resources.tasks.data);

  const { user: authUser } = useSelector(getAuthData());
  const isAppColorized = useSelector(getAppColorized());
  const isAppLoading = useSelector(getAppLoading());
  const isCarding = useSelector(getAppCarding());

  React.useEffect(() => {
    const paging = document.querySelector('div.MuiTablePagination-toolbar');
    if (paging) {
      paging.style.backgroundColor = isAppColorized ? blue[200] : 'whitesmoke';
      paging.querySelector('p').textContent = 'Строк на странице';
      if (paging.querySelector('.previous-page'))
        paging.querySelector('.previous-page').textContent = '< Предыдущая';
      if (paging.querySelector('.next-page'))
        paging.querySelector('.next-page').textContent = 'Следующая > ';
    }
    return () => {};
  }, [isAppColorized, isLoading, isCarding]);

  return (
    <>
      {authUser && (
        <ListBase
          {...props}
          sort={{ field: 'createdAt', order: 'ASC' }}
          //aside={<TaskAsideCard id={hoverId} />}
          style={
            !isLoading && isAppLoading ? { height: '0px', display: 'none' } : {}
          }
        >
          {!(!isLoading && isAppLoading) && (
            <TaskToolbar
              tasksIds={tasksIds}
              setTasksIds={setTasksIds}
              userId={authUser.uid}
            />
          )}
          {!isCarding && !(!isLoading && isAppLoading) && (
            <MyDatagrid
              isAppColorized={isAppColorized}
              authId={authUser.uid}
              tasksIds={tasksIds}
              setTasksIds={setTasksIds}
              hoverId={hoverId}
              setHoverId={setHoverId}
            />
          )}
          {isCarding && !(!isLoading && isAppLoading) && (
            <Stack
              direction="row"
              display="inline-flex"
              sx={{
                justifyContent: 'space-around',
                alignItems: 'flex-start',
                gap: 10,
                flexWrap: 'wrap',
                py: 5,
              }}
            >
              {ids.map((id) => (
                <TaskCard key={id} record={tasks[id]} />
              ))}
            </Stack>
          )}

          {!(!isLoading && isAppLoading) && (
            <TaskPagination />
          )}
        </ListBase>
      )}
      {!isLoading && isAppLoading && <Loading />}
    </>
  );
};

const ProgressBarField = (id, progress) => (
  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
    <TaskProgressBar id={id} value={progress} />
  </Box>
);

const ControlButtons = ({ record, authId }) => {
  const {
    data: comment,
    loading,
    loaded,
    error,
  } = useGetList(
    'comments',
    { page: 1, perPage: 1 },
    { field: 'id', order: 'ASC' },
    { taskId: record.id }
  );
  if (loaded) console.info(comment, 'comments from hook');

  return (
    <FunctionField
      label=""
      render={(record) => {
        //const { data, isLoading } = useGetOne('tasks', {id: "1"});

        return (
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <ShowButton basePath="/tasks" label="" record={record} />
            {loading && !loaded && <CircularProgress color="inherit" />}
            {loaded && Object.keys(comment).length > 0 && (
              <EditButton
                basePath="/comments"
                icon={<EditCommentIcon />}
                label=""
                record={comment[Object.keys(comment)[0]]}
              />
            )}
            {loaded && Object.keys(comment).length === 0 && (
              <CreateButton
                basePath="/comments"
                icon={<CreateCommentIcon />}
                label=""
              />
            )}
            {record.userId === authId && (
              <>
                <EditButton basePath="/tasks" label="" record={record} />
                <DeleteWithConfirmButton
                  record={record}
                  label=""
                  undoable={true}
                  confirmContent="Подтверждаете удаление задачи?"
                  redirect={false}
                />
              </>
            )}
          </Box>
        );
      }}
    />
  );
};

const updateListColorizedStyle = (taskList, isAppColorized) => {
  const ths = taskList.querySelectorAll('thead>tr>th');
  for (const taskTh of ths)
    taskTh.style.backgroundColor = isAppColorized ? blue[100] : 'whitesmoke';
  const paging = taskList.parentNode.nextSibling?.querySelector(
    'div.MuiToolbar-root'
  );
  if (paging) {
    paging.style.backgroundColor = isAppColorized ? blue[200] : 'whitesmoke';
    paging.querySelector('p').textContent = 'Строк на странице';
    if (paging.querySelector('.previous-page'))
      paging.querySelector('.previous-page').textContent = '< Предыдущая';
    if (paging.querySelector('.next-page'))
      paging.querySelector('.next-page').textContent = 'Следующая > ';
  }
};

const MyDatagrid = ({
  isAppColorized,
  authId,
  setTasksIds,
  tasksIds,
  hoverId,
  setHoverId,
  ...props
}) => {

  const taskRef = React.useRef();
  const { loaded, loading } = useListContext();

  React.useEffect(() => {
    const taskList = taskRef.current;
    if (taskList) {
      updateListColorizedStyle(taskList, isAppColorized);
    }
    return () => {};
  }, [taskRef.current, isAppColorized, loading, loaded]);

  const taskRowStyle = (id) => (record, index) => {
    return {
      backgroundColor: record.userId === id ? green[200] : red[100],
    };
  };

  const handleUpdateId = (id) => {
    setHoverId(id);
  };

  const handleMouseEnter = ({ target }) => {
    if (
      target.closest('tr') &&
      !target.closest('td')?.classList.contains('column-undefined') &&
      target.closest('tr').querySelector('td.column-id')
    ) {
      if (
        hoverId !==
        target.closest('tr').querySelector('td.column-id').textContent
      ) {
        const newHoverId = target
          .closest('tr')
          .querySelector('td.column-id').textContent;
        if (newHoverId) handleUpdateId(newHoverId);
        //setTransition(true);
      }
    }
  };

  React.useEffect(() => {
    setTasksIds(tasksIds);
    localStorage.setItem('tasksIds', JSON.stringify(tasksIds));
    return () => {};
  }, [tasksIds]);
  React.useEffect(() => {
    setTasksIds(
      localStorage.getItem('tasksIds')
        ? JSON.parse(localStorage.getItem('tasksIds'))
        : []
    );

    return () => {};
  }, []);

  return (
    <Stack>
      <Datagrid
        {...props}
        onMouseMove={handleMouseEnter}
        onMouseLeave={() => {
          setTimeout(() => handleUpdateId(null), 0);
        }}
        isRowSelectable={(row) => authId === row.userId}
        ref={taskRef}
        rowStyle={isAppColorized ? taskRowStyle(authId) : () => {}}
        sx={{
          '& .RaDatagrid-row': { color: 'green', backgroundColor: 'red' },
          '& .RaDatagrid-selectable': {
            color: 'green',
            backgroundColor: 'red',
          },
        }}
      >
        <FunctionField
          {...props}
          label="Выбрать"
          render={(record) => (
            <Checkbox
              disabled={record.userId !== authId}
              checked={tasksIds.findIndex((id) => id === record.id) > -1}
              onClick={(event) => {
                if (tasksIds.findIndex((id) => id === record.id) < 0) {
                  tasksIds.push(record.id);
                } else {
                  const index = tasksIds.findIndex((id) => id === record.id);
                  delete tasksIds[index];
                }
                setTasksIds(tasksIds.filter((task) => task !== null));
              }}
            />
          )}
        />

        <TextField
          label=""
          sortable={false}
          source="id"
          style={{ display: 'none' }}
        />
        <TextField label="Название" source="title" />
        <TextField label="Описание" sortable={false} source="description" />
        <DateField label="Дата создания" source="createdAt" lacales="ru" />
        <DateField label="Дата исполнения" source="executeAt" locales="ru" />
        <FunctionField
          label="Исполнители"
          sortable={false}
          source="executors"
          render={(record) => <ExecutorsField {...record} />}
        />

        <FunctionField
          label="Ход исполнения"
          source="progress"
          render={(record) =>
            ProgressBarField(
              record.progressType ? record.progressType : 1,
              !isNaN(record.progress) ? record.progress : 0
            )
          }
        />

        <FunctionField
          label="Тэги"
          sortable={false}
          source="keywords"
          render={(record) => <KeywordsField keywords={record.keywords} />}
        />

        <FunctionField
          label="Статус"
          source="status"
          render={(record) => {
            if (record.status) {
              if (new Date(record.finishedAt) <= new Date(record.executeAt)) {
                return (
                  <>
                    <strong style={{ fontSize: 16, color: 'green' }}>👍</strong>{' '}
                    Завершено
                  </>
                );
              } else {
                return (
                  <>
                    <strong style={{ fontSize: 16, color: 'green' }}>✌️</strong>{' '}
                    Завершено вне сроков
                  </>
                );
              }
            } else {
              if (new Date(record.executeAt) < new Date()) {
                if (record.progress < 100) {
                  return (
                    <>
                      <strong style={{ fontSize: 16, color: 'red' }}>✌️</strong>{' '}
                      Просрочено
                    </>
                  );
                } else {
                  return (
                    <>
                      <strong style={{ fontSize: 16, color: 'red' }}>✌️</strong>{' '}
                      Завершено но открыто
                    </>
                  );
                }
              } else {
                return (
                  <>
                    <strong style={{ fontSize: 16, color: 'blue' }}>✌️</strong>{' '}
                    На исполнении
                  </>
                );
              }
            }
          }}
        />
        <FunctionField
          label="Комментарии"
          source="commantable"
          render={(record) => {
            if (record.commentable) {
              return (
                <strong style={{ fontSize: 16, color: 'green' }}>✔️</strong>
              );
            } else {
              return <strong style={{ fontSize: 16, color: 'red' }}>✖️</strong>;
            }
          }}
        />

        <ControlButtons authId={authId} />
      </Datagrid>
      {hoverId && <TaskAsideCard id={hoverId} />}
    </Stack>
  );
};
