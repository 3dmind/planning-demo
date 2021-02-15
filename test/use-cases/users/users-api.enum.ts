export enum UsersApi {
  USERS = '/users',
  USERS_LOGIN = '/users/login',
  USERS_LOGOUT = '/users/logout',
  USERS_ME = '/users/me',
  USERS_REFRESH = '/users/refresh',

  TASKS = '/tasks',
  TASKS_TICK_OFF = '/tasks/:id/tickoff',
  TASKS_RESUME = '/tasks/:id/resume',
  TASKS_EDIT = '/tasks/:id/edit',
  TASKS_ARCHIVE = '/tasks/:id/archive',
  TASKS_DISCARD = '/tasks/:id/discard',
  TASKS_ASSIGN = '/tasks/:id/assign',
  TASKS_ACTIVE = '/tasks/active',
  TASKS_ARCHIVED = '/tasks/archived',
}
