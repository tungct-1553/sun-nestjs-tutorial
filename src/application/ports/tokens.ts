/** Inbound (driving) ports — use-case contracts consumed by presentation layer */
export const HEALTH_CHECK_PORT = Symbol('HEALTH_CHECK_PORT');

/** Outbound (driven) ports — adapters implemented in infrastructure (init-model PR) */
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
