import { Request, Response } from 'express';
export declare const messageController: {
    getChannels(req: Request, res: Response): Promise<void>;
    sendMessage(req: Request, res: Response): Promise<void>;
    scheduleMessage(req: Request, res: Response): Promise<void>;
    getScheduledMessages(req: Request, res: Response): Promise<void>;
    cancelScheduledMessage(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=messageController.d.ts.map