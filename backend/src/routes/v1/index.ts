import { Server } from "@hapi/hapi";
import createShiftRoutes from "./shifts";
import createPublishRoutes from "./publish";

export default function (server: Server, basePath: string) {
  createShiftRoutes(server, basePath + "/shifts");
  createPublishRoutes(server, basePath + "/publish");
}
