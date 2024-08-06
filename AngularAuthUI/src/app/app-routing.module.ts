import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { BookListComponent } from './components/book-list/book-list.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

const routes: Routes = [
  {path : 'login' , component : LoginComponent },
  {path : 'signup' , component : SignupComponent },
  {path : 'book-list' , component : BookListComponent },
  {path : 'dashboard' , component : DashboardComponent }, 
  { path: '**', redirectTo: '/login' } // Redirige toutes les autres routes vers la page de connexion
  
];    

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule] 
})
export class AppRoutingModule { }