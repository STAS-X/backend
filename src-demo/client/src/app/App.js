import { useSelector } from 'react-redux';
import { Admin, Resource, defaultTheme } from 'react-admin';

import UserIcon from '@material-ui/icons/People';
import CommentIcon from '@material-ui/icons/Comment';
import TaskIcon from '@material-ui/icons/Pages';

import { getAppTheme, getAppTitle } from './store/appcontext';
import { getLoggedStatus } from './store/authcontext';

import merge from 'lodash/merge';

import indigo from '@material-ui/core/colors/indigo';
import pink from '@material-ui/core/colors/pink';
import red from '@material-ui/core/colors/red';

import { CommentList } from './components/page/comments/comments.list';
import { CommentTabbetShow } from './components/page/comments/comments.tabbet.show';
import { CommentEdit } from './components/page/comments/comments.edit';
import { CommentCreate } from './components/page/comments/comments.create';

import { TaskList } from './components/page/tasks/tasks.list';
import { TaskTabbetShow } from './components/page/tasks/tasks.tabbet.show';
import { TaskEdit } from './components/page/tasks/tasks.edit';
import { TaskCreate } from './components/page/tasks/tasks.create';

import { UserList } from './components/page/users/users.list';
import { UserTabbetShow } from './components/page/users/users.tabbet.show';
import { UserEdit } from './components/page/users/users.edit';

import CustomLayout from './components/common/custom/customLayout';

import CustomLoginPage from './components/ui/CustomLoginPage';

import DashBoardPage from './components/ui/DashBoardPage';
import NotFound from './components/ui/NotFound';


const App = (props) => {
  const theme = useSelector(getAppTheme());
  const mainAppPage = useSelector(getAppTitle());
  //const loggedStatus = useSelector(getLoggedStatus());


  const changeTheme = (theme) => {
    if (theme === 'light') {
      return merge({}, defaultTheme, {
        palette: {
          type: `${theme}`,
          primary: indigo,
          secondary: pink,
          error: red,
          contrastThreshold: 3,
          tonalOffset: 0.2,
        },

        typography: {
          // Use the system font instead of the default Roboto font.
          fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Arial',
            'sans-serif',
          ].join(','),
        },
      });
    }

    return merge({}, defaultTheme, {
      palette: {
        type: `${theme}`,
        primary: indigo,
        secondary: pink,
        error: red,
        contrastThreshold: 6,
        tonalOffset: 0.6,
      },
    });
  };

  //const isLogged = useSelector(getLoggedStatus());

  return (
    <Admin
      authProvider={props.authProvider}
      dataProvider={props.dataProvider}
      theme={changeTheme(theme)}
      layout={CustomLayout(mainAppPage)}
      loginPage={CustomLoginPage}
      dashboard={DashBoardPage}
      history={props.history}
      catchAll={NotFound}
    >
      <Resource
        name="users"
        icon={UserIcon}
        list={UserList}
        show={UserTabbetShow}
        edit={UserEdit}
      />
      <Resource
        name="tasks"
        icon={TaskIcon}
        list={TaskList}
        show={TaskTabbetShow}
        create={TaskCreate}
        edit={TaskEdit}
      />
      <Resource
        name="comments"
        icon={CommentIcon}
        list={CommentList}
        show={CommentTabbetShow}
        create={CommentCreate}
        edit={CommentEdit}
      />
    </Admin>
  );
};

export default App;
