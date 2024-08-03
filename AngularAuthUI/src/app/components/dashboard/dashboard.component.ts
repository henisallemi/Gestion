import { Component, OnInit } from '@angular/core';
import { BookService } from '../../services/book.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  
})
export class DashboardComponent implements OnInit {
  private chart: any;
  private yearChart: any;
  private publisherChart: any;
  private authorAndYearChart: any;      
 // Statistiques
 totalBooks: number = 0;
 totalAuthors: number = 0;
 totalEditeurs: number = 0;
 averagePrice: number = 0;

 constructor(
  private bookService: BookService,
  private router: Router // Inject Router
) {}
   
  navigateToBookList(): void {
    this.router.navigate(['/book-list']);
  }
  ngOnInit(): void {  
    this.loadBookStatistics();      

    this.loadChartData();
    this.loadPublisherChartData();
    this.loadYearChartData();
    this.loadAuthorAndYearChartData();  
  }
 
  private loadBookStatistics(): void {
    this.bookService.getBooks().subscribe(
      books => {
        if (books.length > 0) {
          this.totalBooks = books.length;
          this.totalAuthors = new Set(books.map(book => book.author)).size;
          this.totalEditeurs = new Set(books.map(book => book.editeur)).size;
          this.averagePrice = books.reduce((acc, book) => acc + book.prix, 0) / this.totalBooks;

        } else {
          this.resetStatistics();
        }
      },
      error => {
        console.error('Error loading book statistics', error);
        // Handle error scenario
      }
    );
  }

  

  private resetStatistics(): void {
    this.totalBooks = 0;
    this.totalAuthors = 0;    
    this.totalEditeurs = 0;
    this.averagePrice = 0;
  }

  private loadChartData(): void {
    this.bookService.getBooksByGenre().subscribe({
      next: (data) => {
        const chartOptions = {
          animationEnabled: true,
          theme: "dark2",
          exportEnabled: true,
          title: {
            text: "Percentage of Books by Genre",
            fontSize: 16

          },
          copyright: {
            text: ''
          },
          height: 330, // Set the desired height
          width: 592,  // Set the desired width
          data: [{ 
            type: "pie",
            indexLabel: "{name}: {y}%",
            toolTipContent: "{name}: {y}%",
            dataPoints: data.map(genre => ({
              name: genre.genreName,
              y: genre.percentage
            }))
          }]
        };

        this.renderChart(chartOptions, 'chartContainer');
      },
      error: (err) => {
        console.error('Error loading chart data', err);
      }
    });
  }


  private loadPublisherChartData(): void {
    this.bookService.getBooksByPublisher().subscribe({
      next: (data) => {
        const publisherChartOptions = {
          animationEnabled: true,
          theme: "dark2",
          exportEnabled: true,
          title: {
            text: "Percentage of Books by Publisher",
            fontSize: 16
          },
          copyright: {
            text: ''
          },
          height: 330, // Set the desired height
          width: 592,  // Set the desired width
          data: [{
            type: "doughnut",
            startAngle: 90,
            indexLabel: "{name}: {y}%",
            toolTipContent: "{name}: {y}%",
            dataPoints: data.map(publisher => ({
              name: publisher.publisherName,
              y: publisher.percentage
            }))
          }]
        };
  
        this.renderChart(publisherChartOptions, 'publisherChartContainer');
      },
      error: (err) => {
        console.error('Error loading publisher chart data', err);
      }
    });
  }
  

  private loadYearChartData(): void {
    this.bookService.getBooksByYear().subscribe({
      next: (data) => {
        const yearChartOptions = { 
          animationEnabled: true,
          theme: "dark2",
          exportEnabled: true, 
          title: {
            text: "Percentage of Books by Publication Year",
            fontSize: 16

          },
          copyright: {
            text: ''
          },
          axisX: {
            labelAngle: -90, // Rotate labels if necessary (optional)
            labelFontSize: 0, // Hide labels completely
            lineThickness: 0, // Hide axis line
            tickThickness: 0, // Hide axis ticks
          },
          axisY: {
            title: "Percentage",
            includeZero: true,
            labelFormatter: function(e: { value: string; }) {
              return e.value + "%"; // Append '%' to Y-axis labels
            }
          },
          height: 330, // Set the desired height
          width: 592,  // Set the desired width
          data: [{
            type: "bar",
            indexLabel: "{label}: {y}%",
            toolTipContent: "Year {label}: {y}%",
            dataPoints: data.map(year => ({
              label: `${year.publicationYear}`,
              y: year.percentage
            }))
          }]
        };
  
        this.renderChart(yearChartOptions, 'yearChartContainer');
      },
      error: (err) => {
        console.error('Error loading year chart data', err);
      }
    });
  }
  








  private loadAuthorAndYearChartData(): void {
    this.bookService.getBooksByAuthorAndYear().subscribe({
      next: (data) => {
        console.log(data); // Vérifiez la structure des données ici
  
        // Trier les données par année
        const sortedData = data.sort((a, b) => a.publicationYear - b.publicationYear);
  
        // Regrouper les données par année
        const yearAuthorMap = sortedData.reduce<Record<number, { author: string, count: number }[]>>((acc, item) => {
          if (!acc[item.publicationYear]) {
            acc[item.publicationYear] = [];
          }
          acc[item.publicationYear].push({ author: item.author, count: item.count });
          return acc;
        }, {});
  
        // Préparer les points de données
        const dataPoints = Object.keys(yearAuthorMap).map(year => {
          const yearNum = parseInt(year, 10);
          const authors = yearAuthorMap[yearNum];
          const totalBooks = authors.reduce((total, item) => total + item.count, 0);
          return {
            x: yearNum,
            y: totalBooks,
            indexLabel: `${totalBooks} ${totalBooks === 1 ? 'book' : 'books'}`, // Afficher le nombre total avec "book" ou "books"
            toolTipContent: authors.map(authorInfo => {
              const bookText = authorInfo.count === 1 ? 'book' : 'books';
              return `${authorInfo.author}: ${authorInfo.count} ${bookText}`;
            }).join('<br/>')
          };
        });
  
        const authorAndYearChartOptions = {
          animationEnabled: true,
          theme: "dark2",
          exportEnabled: true,
          title: {
            text: "Number of Books by Year",
            fontSize: 16

          },
          axisX: {
            title: "Year",
            interval: 1,  // Pour afficher chaque année
            labelAngle: -45, // Inclinaison des labels pour éviter le chevauchement
            labelFormatter: function(e: any) {
              // Assurez-vous que l'année est affichée correctement
              return e.value.toString();
            }
          },          
          axisY: {
            title: "Number of Books",
            includeZero: true
          },   
          height: 330, // Set the desired height
          width: 592,  // Set the desired width
          data: [{  
            type: "line",  // Change to "bar" or other type if preferred
            indexLabel: "{indexLabel}", // Afficher le nombre total à côté de chaque point
            toolTipContent: "{toolTipContent}", // Afficher uniquement les éditeurs et le nombre de livres dans l'info-bulle
            dataPoints: dataPoints
          }]
        };
  
        // Personnaliser la méthode de rendu du graphique pour afficher l'info-bulle
        this.renderChart(authorAndYearChartOptions, 'authorAndYearChartContainer');
      },
      error: (err) => {
        console.error('Error loading author and year chart data', err);
      }
    });
  }     
  
  
  
  
   
  
  private renderChart(options: any, containerId: string): void {
    if (typeof (window as any).CanvasJS !== 'undefined') {
      const chartContainer = document.getElementById(containerId);
      if (chartContainer) {
        if (containerId === 'chartContainer' && this.chart) {
          this.chart.destroy();
        } else if (containerId === 'yearChartContainer' && this.yearChart) {
          this.yearChart.destroy();
        } else if (containerId === 'publisherChartContainer' && this.publisherChart) {
          this.publisherChart.destroy();
        } else if (containerId === 'authorAndYearChartContainer' && this.authorAndYearChart) {
          this.authorAndYearChart.destroy();
        }

        const chart = new (window as any).CanvasJS.Chart(chartContainer, options);
        chart.render();

        if (containerId === 'chartContainer') {
          this.chart = chart;
        } else if (containerId === 'yearChartContainer') {
          this.yearChart = chart;
        } else if (containerId === 'publisherChartContainer') {
          this.publisherChart = chart;
        } else if (containerId === 'authorAndYearChartContainer') {
          this.authorAndYearChart = chart;
        }
      }
    } else {
      console.error('CanvasJS is not loaded');
    }
  }

}
