import * as shiftRepository from "../database/default/repository/shiftRepository";
import * as publishRepository from "../database/default/repository/publishRepository";
import Shift from "../database/default/entity/shift";
import Publish from "../database/default/entity/publish";
import { ICreateShift, IUpdateShift } from "../shared/interfaces";
import { FindManyOptions, FindOneOptions, In, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { HttpError } from '../shared/classes/HttpError';
import { startOfWeek, endOfWeek, isEqual, isWithinInterval, addDays, subDays, formatISO } from 'date-fns';
import { isIntervalClashed } from "../shared/functions"

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
  shift.startTime = payload.startTime;
  shift.endTime = payload.endTime;
  shift.date = payload.date;

  const publish = new Publish();
  const findPublish = await publishRepository.findOne(
    { startDate: LessThanOrEqual(shift.date), endDate: MoreThanOrEqual(shift.date) }
  )
  
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
      select: ['id', 'date', 'startTime', 'endTime'],
      where: [ { date: shift.date } ]
    }
  )

  shift.date = formatISO(new Date(shift.date), { representation: 'date' });
  shift.startTime = shift.startTime + ":00";
  shift.endTime = shift.endTime + ":00";

  const startTimeDate = new Date(shift.date + ' ' + shift.startTime),
    endTimeDate = new Date(shift.date + ' ' + shift.endTime);

  isIntervalClashed(startTimeDate, endTimeDate, shifts);

  shift.publishId = findPublish === undefined
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
      select: ['id', 'date', 'startTime', 'endTime'],
      where: [ { date: payload.date } ]
    }
  )

  payload.date = formatISO(new Date(payload.date), { representation: 'date' });
  payload.startTime = payload.startTime + ":00";
  payload.endTime = payload.endTime + ":00";

  const startTimeDate = new Date(payload.date + ' ' + payload.startTime),
    endTimeDate = new Date(payload.date + ' ' + payload.endTime);
  
  isIntervalClashed(startTimeDate, endTimeDate, shifts);

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
