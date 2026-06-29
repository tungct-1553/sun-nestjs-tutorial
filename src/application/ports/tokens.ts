/** Inbound (driving) ports — use-case contracts consumed by presentation layer */
export const HEALTH_CHECK_PORT = Symbol('HEALTH_CHECK_PORT');
export const REGISTER_USER_PORT = Symbol('REGISTER_USER_PORT');
export const LOGIN_USER_PORT = Symbol('LOGIN_USER_PORT');
export const GET_CURRENT_USER_PORT = Symbol('GET_CURRENT_USER_PORT');
export const UPDATE_USER_PORT = Symbol('UPDATE_USER_PORT');

/** Outbound (driven) ports — adapters implemented in infrastructure */
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER');
export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');
