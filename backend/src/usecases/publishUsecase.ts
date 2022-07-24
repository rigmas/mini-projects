import * as publishRepository from "../database/default/repository/publishRepository";
import Publish from "../database/default/entity/publish";
import { IGetPublish, IUpdatePublish } from "../shared/interfaces";

export const update = async (payload: IUpdatePublish): Promise<Publish> => {
  const { id } = payload;
  delete payload.id;
  payload.isPublished = true;

  return await publishRepository.updateById(id, {
    ...payload,
  });
}

export const findOne = async (payload: IGetPublish): Promise<Publish> => {
  const data = await publishRepository.findOne(
    {startDate: payload.startDate, endDate: payload.endDate},
    {relations: ["shifts"]}
    )
    return data;
}