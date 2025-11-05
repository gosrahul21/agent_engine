import * as express from "express";
declare class ChatController {
    getChatbot(req: express.Request, res: express.Response): Promise<express.Response<any, Record<string, any>>>;
    getAllChatbots(req: express.Request, res: express.Response): Promise<express.Response<any, Record<string, any>>>;
    createChatbot(req: express.Request, res: express.Response): Promise<express.Response<any, Record<string, any>>>;
    updateChatbot(req: express.Request, res: express.Response): Promise<express.Response<any, Record<string, any>>>;
    deleteChatbot(req: express.Request, res: express.Response): Promise<express.Response<any, Record<string, any>>>;
}
declare const _default: ChatController;
export default _default;
//# sourceMappingURL=chatController.d.ts.map