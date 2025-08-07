import { Request, Response } from 'express';
export declare const authController: {
    initiateAuth(req: Request, res: Response): Promise<void>;
    handleCallback(req: Request, res: Response): Promise<void>;
    logout(req: Request, res: Response): Promise<void>;
    exchangeTokens(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=authController.d.ts.map