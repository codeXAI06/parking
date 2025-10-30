import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ParkingListComponent } from './components/parking-list/parking-list.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'parking-list', component: ParkingListComponent },
  { path: 'admin-panel', component: AdminPanelComponent },
  { path: '**', redirectTo: '/login' }
];
