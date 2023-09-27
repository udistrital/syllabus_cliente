import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizarSyllabusComponent } from './visualizar-syllabus.component';

describe('VisualizarSyllabusComponent', () => {
  let component: VisualizarSyllabusComponent;
  let fixture: ComponentFixture<VisualizarSyllabusComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VisualizarSyllabusComponent]
    });
    fixture = TestBed.createComponent(VisualizarSyllabusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
