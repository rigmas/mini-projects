import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BaseTimestamp } from "./baseTimestamp";
import Shift from "./shift";

@Entity()
export default class Publish extends BaseTimestamp {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({
    type: "date",
  })
  startDate: Date;

  @Column({
    type: "date",
  })
  endDate: Date;

  @Column({
    type: "boolean",
    default: false,
  })
  isPublished: boolean;

  @Column({
    type: "timestamp",
  })
  createdAt: number;

  @OneToMany(() => Shift, (shift) => shift.publish)
  shifts: Shift[];
}
