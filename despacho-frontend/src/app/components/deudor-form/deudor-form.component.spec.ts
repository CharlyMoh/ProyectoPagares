import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeudorFormComponent } from './deudor-form.component';

describe('DeudorFormComponent', () => {
  let component: DeudorFormComponent;
  let fixture: ComponentFixture<DeudorFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeudorFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeudorFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
