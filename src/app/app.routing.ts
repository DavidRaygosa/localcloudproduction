import { Routes, RouterModule } from '@angular/router';
//Routes
import { LoginComponent } from './components/login/login.component';
import { UserGuardGuard } from './user-guard.guard';
import { DashboardComponent } from './components/dashboard/dashboard.component';
const routes: Routes = [
    {
        path: '',
        component: DashboardComponent,
        canActivate: [UserGuardGuard]
    },
    {
        path: 'login',
        loadChildren: () => import('./components/login/login.module').then(m => m.LoginModule),
    },
    {
        path: 'table',
        loadChildren: () => import('./components/table/table.module').then(m => m.TableModule),
        canActivate: [UserGuardGuard]
    },
    {
        path: 'sidebar',
        loadChildren: () => import('./components/sidebar/sidebar.module').then(m => m.SideBarModule),
        canActivate: [UserGuardGuard]
    }
  ];
export const appRoutingProviders: any[] = [];
export const routing  = RouterModule.forRoot(routes);