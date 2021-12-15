import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 
import { HttpClientModule, HTTP_INTERCEPTORS  } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { routing, appRoutingProviders } from './app.routing';
import { JwtInterceptorInterceptor } from './jwt-interceptor.interceptor';
import { CookieService } from 'ngx-cookie-service';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { TableComponent } from './components/table/table.component';

// PRIMENG
  import { MenubarModule } from 'primeng/menubar';
  import { InputTextModule } from 'primeng/inputtext';
  import { ButtonModule } from 'primeng/button';
  import { AvatarModule } from 'primeng/avatar';
  import { TieredMenuModule } from 'primeng/tieredmenu';
  import { BreadcrumbModule } from 'primeng/breadcrumb';
  import { ChipModule } from 'primeng/chip';
  import { TabViewModule } from 'primeng/tabview';
  import { SplitButtonModule } from 'primeng/splitbutton';
  import { ProgressBarModule } from 'primeng/progressbar';
  import { CheckboxModule } from 'primeng/checkbox';
  import { PasswordModule } from 'primeng/password';
  import { DialogModule } from 'primeng/dialog';
  import { ToastModule } from 'primeng/toast';
  import { TableModule } from 'primeng/table';
  import { CalendarModule } from 'primeng/calendar';
  import { SliderModule } from 'primeng/slider';
  import { MultiSelectModule } from 'primeng/multiselect';
  import { ContextMenuModule } from 'primeng/contextmenu';
  import { DropdownModule } from 'primeng/dropdown';
  import { FileUploadModule } from 'primeng/fileupload';
  import { TooltipModule } from 'primeng/tooltip';
  import { RippleModule } from 'primeng/ripple';
  import { ConfirmPopupModule } from 'primeng/confirmpopup';
  import { SidebarModule } from 'primeng/sidebar';
  import { SidebarComponent } from './components/sidebar/sidebar.component';
  import { ProgressSpinnerModule } from 'primeng/progressspinner';
  import { InputSwitchModule } from 'primeng/inputswitch'
  import { DragDropModule } from 'primeng/dragdrop';
  import { PaginatorModule } from 'primeng/paginator';
  import { ScrollTopModule } from 'primeng/scrolltop';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
  
@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LoginComponent,
    TableComponent,
    SidebarComponent
  ],
  imports: [
    routing,
    FormsModule,
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MenubarModule,
    InputTextModule,
    ButtonModule,
    AvatarModule,
    TieredMenuModule,
    BreadcrumbModule,
    ChipModule,
    TabViewModule,
    SplitButtonModule,
    ProgressBarModule,
    CheckboxModule,
    PasswordModule,
    DialogModule,
    ToastModule,
    TableModule,
    CalendarModule,
    SliderModule,
    MultiSelectModule,
    ContextMenuModule,
    DropdownModule,
    FileUploadModule,
    ConfirmPopupModule,
    TooltipModule,
    RippleModule,
    SidebarModule,
    ProgressSpinnerModule,
    InputSwitchModule,
    DragDropModule,
    PaginatorModule,
    ScrollTopModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [appRoutingProviders, CookieService, { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptorInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
