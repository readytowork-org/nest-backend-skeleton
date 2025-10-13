import * as schemas from '@app/db/schemas';

export type Schema = (typeof schemas)[keyof typeof schemas];
