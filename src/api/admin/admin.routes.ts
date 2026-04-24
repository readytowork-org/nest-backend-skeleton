import { StaffModule } from './staffs/staff.module';

export const adminChildRoutes = [
  {
    path: 'staffs',
    module: StaffModule,
  },
];
