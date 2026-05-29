import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagareHistorialComponent } from './pagare-historial.component';

describe('PagareHistorialComponent', () => {
  let component: PagareHistorialComponent;
  let fixture: ComponentFixture<PagareHistorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagareHistorialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagareHistorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
