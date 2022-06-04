import * as React from 'react';
import { useSelector } from 'react-redux';
import {
  Edit,
  BooleanInput,
  DateInput,
  SaveButton,
  EditButton,
  SimpleForm,
  TextInput,
  SelectInput,
  FunctionField,
  NumberInput,
  ReferenceInput,
  FileInput,
  FileField,
  ArrayInput,
  SimpleFormIterator,
  useNotify,
  useRedirect,
  useRefresh,
  useRecordContext,
  FormDataConsumer,
  Toolbar,
  useEditContext,
  useEditController,
  Title,
  useGetOne,
  useGetList,
  required,
  minLength,
  maxLength,
  minValue,
  maxValue,
  number,
} from 'react-admin';
import RichTextInput from 'ra-input-rich-text';
import { makeStyles } from '@material-ui/core/styles';
import { green, blue, red } from '@mui/material/colors';
import {
  Stack,
  Box,
  Typography,
  Avatar,
  Chip,
  CircularProgress,
} from '@mui/material';
import TaskEditIcon from '@material-ui/icons/EditRounded';
import DeleteIcon from '@material-ui/icons/DeleteRounded';
import TaskProgressBar from '../../common/progressbar/task.progress';
import TagsField from '../../common/fields/task.tags';
import { getAuthData } from '../../../store/authcontext';
import {
  getRandomInt,
  dateWithDays,
  normalise,
} from '../../../utils/getRandomInt';
import { dateFormatter } from '../../../utils/displayDate';

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
        return 0;
      }
    } else {
      return 0;
    }
  }
};

const TaskForCommentSelector = (data) => {
  const { id, title } = data;
  const result = getTaskResult(data);
  if (title === undefined) return '';
  return (
    <Chip
      label={`${title} - id#${id}`}
      sx={{
        '&': {
          minWidth: 150,
          backgroundColor: result === 1 ? blue[200] : green[200],
          color:
            result === 1 ? green[600] : result === 0 ? blue[600] : red[600],
          fontWeight: 'bold',
          fontSize: 14,
          'span:after': {
            content: result === 1 ? '" ✔️"' : '" 😐"',
            color: result >= 0 ? 'green' : 'inherit',
          },
        },
      }}
    />
  );
};

const CustomToolbar = ({ authId, ...props }) => {
  const redirect = useRedirect();

  const {
    invalid: isInvalid,
    record,
    pristine,
    handleSubmit,
    handleSubmitWithRedirect,
  } = props;

  return (
    <Toolbar
      {...props}
      style={{
        display: 'inline-flex',
        justifyContent: 'space-around',
        minWidth: 500,
      }}
    >
      <SaveButton
        label="Сохранить"
        key={1}
        onClick={() => {
          handleSubmit();
        }}
        redirect={'show'}
        disabled={isInvalid || pristine}
      />
      <FormDataConsumer>
        {({ formData, ...rest }) => (
          <SaveButton
            label="Перейти к задаче"
            icon={<TaskEditIcon />}
            onClick={() => {
              handleSubmit();
            }}
            redirect={`/tasks/${formData.taskId}`}
            handleSubmitWithRedirect={handleSubmitWithRedirect}
            disabled={authId !== record.userId || isInvalid}
          />
        )}
      </FormDataConsumer>
    </Toolbar>
  );
};

const validateBody = [
  required('Необходимо ввести тело комментария'),
  minLength(3, 'Комментарий должен быть более 3-х символов'),
];
const validateDescription = [
  required('Необходимо описание'),
  minLength(3, 'Описание должно быть более 3-х символов'),
];

export const CommentEdit = (props) => {
  const refresh = useRefresh();
  const notify = useNotify();
  const redirect = useRedirect();

  const {
    data: { userId: editUserId },
    loaded: isLoaded,
  } = useGetOne('comments', props.id);

  const { user: authUser } = useSelector(getAuthData());

  const [currentTaskId] = React.useState(() =>
    localStorage.getItem('currentTaskId')
  );

  const {
    data: comments,
    total,
    loaded,
  } = useGetList(
    'comments',
    { page: 1, perPage: 10 },
    { field: 'id', order: 'ASC' },
    { userId: authUser.uid, commentable: true }
  );

  const transform = (data) => {
    console.log(data, 'transform data from edit');
    return {
      ...data,
      userId: authUser.uid,
      finishedAt: data.status ? dateFormatter(Date.now()) : '',
    };
  };

  const handleFailure = ({ error }) => {
    notify(`Возникла ошибка: ${error}`, { type: 'warning' }); // default message is 'ra.notification.created'
    refresh();
  };

  React.useEffect(() => {
    if (isLoaded && authUser.uid !== editUserId)
      setTimeout(() => redirect('show', '/comments', props.id), 0);

    return () => {};
  }, [isLoaded]);

  React.useEffect(() => {

    return () => {
      if (localStorage.getItem('currentTaskId')) localStorage.removeItem('currentTaskId');
    };
  }, []);

  return (
    <>
      <Edit
        {...props}
        mutationMode="undoable"
        transform={transform}
        onFailure={handleFailure}
        hasShow={false}
        redirect={false}
      >
        <SimpleForm
          mode="onBlur"
          warnWhenUnsavedChanges
          toolbar={<CustomToolbar authId={authUser.uid} />}
        >
          <FunctionField
            addLabel={false}
            render={(record) => (
              <h3 className="titleDialog">
                Редактирование комментария #{record.id}{' '}
              </h3>
            )}
          />

          <TextInput disabled label="Идентификатор" source="id" />
          <DateInput
            disabled
            label="Создано"
            source="createdAt"
            parse={dateFormatter}
            defaultValue={dateFormatter(Date.now())}
          />

          <TextInput
            label="Описание"
            source="description"
            validate={validateDescription}
            defaultValue={'Текст описания к задаче'}
          />

          <ReferenceInput
            label="Комментируемая задача"
            defaultValue={currentTaskId}
            source="taskId"
            reference="tasks"
            filter={total > 0 ? { id_nar: Object.keys(comments) } : {}}
            validate={required('Необходимо выбрать задачу для комментария')}
            sort={{ field: 'title', order: 'ASC' }}
          >
            <SelectInput
              optionText={(choise) => <TaskForCommentSelector {...choise} />}
              helperText="Выберите исполнителей"
            />
          </ReferenceInput>

          <RichTextInput
            label="Комментарий"
            source="body"
            validate={validateBody}
            defaultValue={'Комментарий к задаче'}
          />
        </SimpleForm>
      </Edit>
    </>
  );
};
