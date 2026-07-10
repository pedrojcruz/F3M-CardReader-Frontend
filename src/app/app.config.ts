export const APP_CONFIG = {
  connectorAppName: import.meta.env.VITE_CONNECTOR_APP_NAME ?? 'F3M Connector Test Frontend',
  defaultConnectorPort: Number(import.meta.env.VITE_CONNECTOR_DEFAULT_PORT ?? '37491'),
}