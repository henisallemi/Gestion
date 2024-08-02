import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasjsChartComponent } from './canvasjs-chart.component';

describe('CanvasjsChartComponent', () => {
  let component: CanvasjsChartComponent;
  let fixture: ComponentFixture<CanvasjsChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CanvasjsChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CanvasjsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
