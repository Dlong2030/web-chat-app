import { Request, Response, NextFunction } from 'express';

export const asyncHandler = <TReq, TRes>(
    fn: (req: Request<TReq>, res: Response<TRes>, next: NextFunction) => Promise<void>
) => {
    return (req: Request<TReq>, res: Response<TRes>, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
};
