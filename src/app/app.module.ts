import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { HashLocationStrategy, LocationStrategy,PercentPipe,CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LocalStorageService } from './@core/utils/local_storage.service';
import { WindowRefService } from './@core/utils/windowref.service';
import { RequestManager } from './pages/services/requestManager';
import { UserService } from './pages/services/userService';
import { SyllabusService } from './pages/services/syllabus.service';
import { HttpClientModule } from '@angular/common/http';
import { BuscarSyllabusComponent } from './pages/buscar-syllabus/buscar-syllabus.component';
import { ListarSyllabusComponent } from './pages/listar-syllabus/listar-syllabus.component';
import { CrearSyllabusComponent } from './pages/crear-syllabus/crear-syllabus.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule  } from '@angular/material/divider'
import { MatNativeDateModule,DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MatMomentDateModule, } from '@angular/material-moment-adapter';

@NgModule({
  declarations: [
    AppComponent,
    BuscarSyllabusComponent,
    ListarSyllabusComponent,
    CrearSyllabusComponent,
    DashboardComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    MatGridListModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatStepperModule,
    MatListModule,
    MatPaginatorModule,
    MatTableModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMomentDateModule,
    MatDividerModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    LocalStorageService,
    WindowRefService,
    RequestManager,
    UserService,
    SyllabusService,
    PercentPipe,
    { provide: MAT_DATE_LOCALE, useValue: 'es-CO' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
