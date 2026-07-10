# F3M Connector Test Frontend

Frontend web application used to test and interact with the **F3M Connector Desktop App**.

The frontend communicates with a local HTTPS API exposed by the desktop connector, allowing a browser-based application to pair with the connector, monitor smart card readers in real time, and read Portuguese Citizen Card data.

## Main Features

- Pairing with the local desktop connector.
- Token-based communication with the connector API.
- Real-time reader and card status updates using SignalR.
- Automatic Citizen Card data reading when a card is inserted.
- Protected data reading with PIN.
- Support for multiple readers.
- Manual data clearing per reader.
- Session persistence in local storage.
- Automatic validation of stored sessions on startup.
- Vue 3 + Pinia architecture.
- Vite-ready build for local usage or static hosting.

## Tech Stack

- Vue 3
- TypeScript
- Vite
- Pinia
- PrimeVue
- Tailwind CSS
- SignalR Client

## Project Structure

```text
src/
├── app/
│   └── app.config.ts
├── application/
│   ├── connector/
│   │   ├── connector-realtime-gateway.ts
│   │   └── connector-realtime.store.ts
│   └── readers/
│       └── readers.store.ts
├── domain/
│   ├── cards/
│   │   ├── citizen-card-address.ts
│   │   └── citizen-card-data.ts
│   ├── connector/
│   │   ├── connector-gateway.ts
│   │   ├── connector-realtime-events.ts
│   │   ├── connector-session-storage.ts
│   │   ├── connector-session.ts
│   │   └── connector.store.ts
│   └── readers/
│       └── reader-card.ts
├── infrastructure/
│   ├── http/
│   │   ├── dtos/
│   │   ├── mappers/
│   │   ├── connector-api-client.ts
│   │   └── connector-http-client.ts
│   ├── signalr/
│   │   └── connector-signalr-client.ts
│   └── storage/
│       └── local-connector-session-storage.ts
├── presentation/
│   ├── components/
│   └── views/
├── App.vue
└── main.ts