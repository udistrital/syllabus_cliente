import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarSyllabusComponent } from './buscar-syllabus.component';

describe('BuscarSyllabusComponent', () => {
  let component: BuscarSyllabusComponent;
  let fixture: ComponentFixture<BuscarSyllabusComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BuscarSyllabusComponent]
    });
    fixture = TestBed.createComponent(BuscarSyllabusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
