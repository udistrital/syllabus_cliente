import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { PercentPipe, CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LocalStorageService } from './@core/utils/local_storage.service';
import { WindowRefService } from './@core/utils/windowref.service';
import { SyllabusService } from './pages/services/syllabus.service';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { BuscarSyllabusComponent } from './pages/buscar-syllabus/buscar-syllabus.component';
import { ListarSyllabusComponent } from './pages/listar-syllabus/listar-syllabus.component';
import { CrearSyllabusComponent } from './pages/crear-syllabus/crear-syllabus.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { VersionesSyllabusComponent } from './pages/versiones-syllabus/versiones-syllabus.component';
import { VisualizarSyllabusComponent } from './pages/visualizar-syllabus/visualizar-syllabus.component';
import { AsignarDocenteComponent } from './pages/asignar-docente/asignar-docente.component';
import { AprobacionComponent } from './pages/aprobacion/aprobacion.component';
import { MisAsignacionesComponent } from './pages/mis-asignaciones/mis-asignaciones.component';
import { PendientesComponent } from './pages/pendientes/pendientes.component';
import { SafeURL } from './@core/pipes/safeUrl.pipe';

import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider'
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { MatNativeDateModule, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MatMomentDateModule, } from '@angular/material-moment-adapter';
import { AlertComponent } from './components/alert/alert.component';
import { RichTextEditorComponent } from './components/rich-text-editor/rich-text-editor.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SpinnerUtilModule } from 'spinner-util';
import { environment } from 'src/environments/environment';
import { SpinnerUtilCounterInterceptor } from './interceptors/spinner-util-counter.interceptor';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, environment.apiUrl + 'assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    BuscarSyllabusComponent,
    ListarSyllabusComponent,
    CrearSyllabusComponent,
    DashboardComponent,
    VersionesSyllabusComponent,
    VisualizarSyllabusComponent,
    AsignarDocenteComponent,
    AprobacionComponent,
    MisAsignacionesComponent,
    PendientesComponent,
    SafeURL,
    AlertComponent,
    RichTextEditorComponent
  ],
  imports: [
    NgxMatSelectSearchModule,
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
    MatTabsModule,
    MatPaginatorModule,
    MatTableModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMomentDateModule,
    MatDividerModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    SweetAlert2Module.forRoot(),
    SpinnerUtilModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    LocalStorageService,
    WindowRefService,
    SyllabusService,
    PercentPipe,
    { provide: MAT_DATE_LOCALE, useValue: 'es-CO' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: HTTP_INTERCEPTORS, useClass: SpinnerUtilCounterInterceptor, multi: true },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
