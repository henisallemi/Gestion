import { Component, Input, OnDestroy, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'canvasjs-chart',
  template: '<div id="{{chartId}}" style="width: 100%; height: 100%;"></div>',
  styleUrls: ['./canvasjs-chart.component.scss']
})
export class CanvasJSChartComponent implements AfterViewInit, OnDestroy {
  @Input() options: any;
  @Input() chartId: string = 'chartContainer';
  private chart: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.createChart();
    }
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private createChart() {
    if (isPlatformBrowser(this.platformId) && (window as any).CanvasJS) {
      // Ensure the copyright property is correctly set
      this.options = {
        ...this.options, 
        copyright: {
          text: ''
        }
      };

      this.chart = new (window as any).CanvasJS.Chart(this.chartId, this.options);
      this.chart.render();
    } else {
      console.error('CanvasJS library is not available.');
    }
  }
}
