export interface SendEmailTransporter {
  send: (data: SendEmailTransporter.Params) => Promise<void>;
}

export namespace SendEmailTransporter {
  export type Params = { from: string; to: string; subject: string; html: string };

  export type Model = void;
}
