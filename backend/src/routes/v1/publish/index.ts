import { Server } from '@hapi/hapi';
import * as publishController from './publishController';
import { createPublishDto, findPublishDto } from '../../../shared/dtos';

export default function (server: Server, basePath: string) {
  server.route({
    method: "PUT",
    path: basePath,
    handler: publishController.createPublish,
    options: {
      description: 'Publish shifts',
      notes: 'Publish shifts by week',
      tags: ['api', 'publish'],
      validate: {
        payload: createPublishDto
      }
    }
  }),

  server.route({
    method: "GET",
    path: basePath,
    handler: publishController.findPublish,
    options: {
      description: 'Find publish shifts',
      notes: 'Publish shifts by week',
      tags: ['api', 'publish'],
      validate: {
        query: findPublishDto
      }
    }
  });
}