import * as signalR from '@microsoft/signalr';
import { api, getToken } from './api';

export function createLiveHubConnection() {
  return new signalR.HubConnectionBuilder()
    .withUrl(`${api.baseUrl}/hubs/live`, {
      accessTokenFactory: () => getToken() ?? '',
    })
    .withAutomaticReconnect()
    .build();
}
