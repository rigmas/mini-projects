import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { BaseTimestamp } from "./baseTimestamp";
import Publish from "./publish";

@Entity()
export default class Shift extends BaseTimestamp {
  // @ManyToOne(type => Publish)
  // @JoinColumn({ name: 'publishId' })
  // publish: Publish;

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({
    type: "date",
  })
  date: string;

  @Column({
    type: "time",
  })
  startTime: string;

  @Column({
    type: "time",
  })
  endTime: string;

  @Column({
    nullable: true,
  })
  publishId: number;

  @ManyToOne(() => Publish, (publish) => publish.shifts)
  publish: Publish;
}
