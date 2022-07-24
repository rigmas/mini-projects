import * as shiftRepository from "../database/default/repository/shiftRepository";
import * as publishRepository from "../database/default/repository/publishRepository";
import Shift from "../database/default/entity/shift";
import Publish from "../database/default/entity/publish";
import { ICreateShift, IErrorResponse, IUpdateShift } from "../shared/interfaces";
import { FindManyOptions, FindOneOptions, In, LessThan, LessThanOrEqual, MoreThan, MoreThanOrEqual } from "typeorm";
import { HttpError } from '../shared/classes/HttpError'
import { startOfWeek, endOfWeek } from 'date-fns'

export const find = async (opts: FindManyOptions<Shift>): Promise<Shift[]> => {
  return shiftRepository.find(opts);
};

export const findById = async (
  id: string,
  opts?: FindOneOptions<Shift>
): Promise<Shift> => {
  return shiftRepository.findById(id, opts);
};

export const create = async (payload: ICreateShift): Promise<Shift> => {
  const shift = new Shift();
  shift.name = payload.name;
  shift.date = payload.date;
  shift.startTime = payload.startTime;
  shift.endTime = payload.endTime;

  const publish = new Publish();
  const findPublish = await publishRepository.findOne(
    { startDate: LessThanOrEqual(shift.date), endDate: MoreThanOrEqual(shift.date) }
  )
  
  console.log({ findPublish });
  
  if (!findPublish?.id) {
    const date = new Date(shift.date);
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });
    publish.startDate = start;
    publish.endDate = end;
    
    const newPublish = await publishRepository.create(publish);
    publish.id = newPublish.id;
  }

  const shifts = await shiftRepository.find(
    { 
      select: ['id', 'startTime', 'endTime'],
      where: [ { date: shift.date } ]
    }
  )

  shifts.map((el) => {
    if ((shift.startTime >= el.startTime && shift.startTime < el.endTime) ||
      (shift.endTime > el.startTime && shift.endTime <= el.endTime)) {
      throw new HttpError(400, 'Shift is clashed');
    }
  })

  shift.publishId = findPublish == undefined
    ? publish.id
    : findPublish.id 
  ;
  return shiftRepository.create(shift);
};

export const updateById = async (
  id: string,
  payload: IUpdateShift
): Promise<Shift> => {
  const publish = await publishRepository.findById(payload.publishId);
  if (publish.isPublished) throw new HttpError(400, "Cannot update shift, shift already published");

  const shifts = await shiftRepository.find(
    { 
      select: ['id', 'startTime', 'endTime'],
      where: [ { date: payload.date } ]
    }
  )

  shifts.map((el) => {
    if ((payload.startTime >= el.startTime && payload.startTime < el.endTime) ||
      (payload.endTime > el.startTime && payload.endTime <= el.endTime)) {
      throw new HttpError(400, 'Cannot update shift, shift time is clashed');
    }
  })

  return shiftRepository.updateById(id, {
    ...payload,
  });
};

export const deleteById = async (id: string) => {
  const shift = await shiftRepository.findById(id);
  const publish = await publishRepository.findById(shift.publishId);
  
  if (publish.isPublished) throw new HttpError(400, "Cannot delete shift, shift already published");
  
  return shiftRepository.deleteById(id);
};
