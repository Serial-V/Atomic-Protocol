declare module 'xbox-rta';

declare module 'node-nethernet/src/connection' {
  export class Connection {
    constructor(...args: any[]);
    setChannels(...args: any[]): any;
    send(data: any): any;
    reliable: any;
    unreliable: any;
    rtcConnection: any;
    close(): void;
  }
}

