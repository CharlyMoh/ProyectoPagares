import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagareFormComponent } from './pagare-form.component';

describe('PagareFormComponent', () => {
  let component: PagareFormComponent;
  let fixture: ComponentFixture<PagareFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagareFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagareFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
