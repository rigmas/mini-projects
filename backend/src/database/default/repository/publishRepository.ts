import {
  getRepository,
  FindOneOptions,
  FindConditions,
} from "typeorm";
import Publish from "../entity/publish";
import moduleLogger from "../../../shared/functions/logger";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

const logger = moduleLogger("publishRepository");

export const findOne = async (
  where?: FindConditions<Publish>,
  opts?: FindOneOptions<Publish>
): Promise<Publish> => {
  logger.info("Find one");
  const repository = getRepository(Publish);
  const data = await repository.findOne(where, opts);
  return data;
};

export const create = async (payload: Publish): Promise<Publish> => {
  logger.info("Create");
  const repository = getRepository(Publish);
  const newdata = await repository.save(payload);
  return newdata;
};

export const findOneOrInsert = async (
  where?: FindConditions<Publish>,
  opts?: FindOneOptions<Publish>,
  payload?: Publish
  ): Promise<Publish> => {
  logger.info("Find One or Insert");
  const repository = getRepository(Publish);
  const data = await repository.findOne(where, opts);
  if (!data) {
    return repository.save(payload)
  }
  return data
}

export const findById = async (
  id: number,
  opts?: FindOneOptions<Publish>
): Promise<Publish> => {
  logger.info("Find by id");
  const repository = getRepository(Publish);
  const data = await repository.findOne(id, opts);
  return data;
};

export const updateById = async (
  id: number,
  payload: QueryDeepPartialEntity<Publish>
): Promise<Publish> => {
  logger.info("Update by id");
  const repository = getRepository(Publish);
  await repository.update(id, payload);
  return findById(id);
}