export type Property = `id` | `login` | `password` | `email` | `emailSent`;
export type DownloadFilter = 'current view' | 'all data';
export type ObserverType = `createRedirection` | `logsLoading` | `changePassword` | `emailValidation` | `emailChange` | `createUser`;
export type Filters = `all` | `success` | `failed` | `completed` | `received` | `deleted` | `created` | `updated` | `authorized`;