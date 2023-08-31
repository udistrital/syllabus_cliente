import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarSyllabusComponent } from './listar-syllabus.component';

describe('ListarSyllabusComponent', () => {
  let component: ListarSyllabusComponent;
  let fixture: ComponentFixture<ListarSyllabusComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListarSyllabusComponent]
    });
    fixture = TestBed.createComponent(ListarSyllabusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
