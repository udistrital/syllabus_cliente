import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearSyllabusComponent } from './crear-syllabus.component';

describe('CrearSyllabusComponent', () => {
  let component: CrearSyllabusComponent;
  let fixture: ComponentFixture<CrearSyllabusComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CrearSyllabusComponent]
    });
    fixture = TestBed.createComponent(CrearSyllabusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
