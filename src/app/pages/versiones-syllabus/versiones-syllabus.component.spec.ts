import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VersionesSyllabusComponent } from './versiones-syllabus.component';

describe('VersionesSyllabusComponent', () => {
  let component: VersionesSyllabusComponent;
  let fixture: ComponentFixture<VersionesSyllabusComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VersionesSyllabusComponent]
    });
    fixture = TestBed.createComponent(VersionesSyllabusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
