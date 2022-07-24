import { Request, ResponseToolkit } from "@hapi/hapi";
import * as publishUsecase from "../../../usecases/publishUsecase";
import { errorHandler } from "../../../shared/functions/error";
import { IGetPublish, ISuccessResponse, IUpdatePublish } from "../../../shared/interfaces";
import moduleLogger from "../../../shared/functions/logger";

const logger = moduleLogger("shiftController");

export const createPublish = async (req: Request, h: ResponseToolkit) => {
  logger.info("Publish shift");
  try {
    const body = req.payload as IUpdatePublish;
    const data = await publishUsecase.update(body);
    const res: ISuccessResponse = {
      statusCode: 200,
      message: "Publish shift week successful",
      results: data,
    }
    return res;
  } catch (error) {
    logger.error(error.message)
    return errorHandler(h, error);
  }
}

export const findPublish = async (req: Request, h: ResponseToolkit) => {
  logger.info("Find publish shift week");
  try {
    const filter = req.query as IGetPublish;
    const data = await publishUsecase.findOne(filter);
    const res: ISuccessResponse = {
      statusCode: 200,
      message: "Get shift week successful",
      results: data,
    };
    return res;
  } catch (error) {
    logger.error(error.message)
    return errorHandler(h, error);
  }
};