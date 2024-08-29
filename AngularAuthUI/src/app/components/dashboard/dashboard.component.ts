import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { BookService } from '../../services/book.service';
import { Router } from '@angular/router';
//import {MatGridListModule} from '@angular/material/grid-list';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewChecked {

  private customColors = [
    "#1C4E80", "#A5D8DD", "#EA6A47", "#0091D5",
    "#9467BD", "#8C564B", "#E377C2", "#7F7F7F"
  ];

  private chart: any;
  private yearChart: any;
  private publisherChart: any;
  private authorAndYearChart: any;
  
  // Statistiques
  totalBooks: number = 0;
  totalAuthors: number = 0;
  totalEditeurs: number = 0;
  averagePrice: number = 0;
  isDataEmpty: boolean = false; // Add this flag

  chartBackgroundColor: string = "#f7fbff";

  constructor(
    private bookService: BookService,
    private router: Router // Inject Router
  ) { }

  navigateToBookList(): void {
    this.router.navigate(['/book-list']);
  }

  
  ngOnInit(): void {
    (window as any).CanvasJS.addColorSet("customColorSet", this.customColors);
    this.loadBookStatistics();

    this.loadGenreChartData();
    this.loadPublisherChartData();
    this.loadYearChartData();
    this.loadAuthorAndYearChartData();
  }

  ngAfterViewChecked(): void {
      const elementToDelete = document.querySelectorAll(".canvasjs-chart-credit")
      elementToDelete.forEach(el => el.remove())
  }


  private loadBookStatistics(): void {
    this.bookService.getBooks().subscribe(
      books => {
        if (books.length > 0) {
          this.isDataEmpty = false; // Data is present
          this.totalBooks = books.length;
          this.totalAuthors = new Set(books.map(book => book.author)).size;
          this.totalEditeurs = new Set(books.map(book => book.editeur)).size;
          this.averagePrice = books.reduce((acc, book) => acc + book.prix, 0) / this.totalBooks;

        } else {
          this.isDataEmpty = true; // No data
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

  private loadGenreChartData(): void {
    this.bookService.getBooksByGenre().subscribe({
      next: (data) => {
        const genreChartOptions = {
          animationEnabled: true,
          theme: "light2",
          colorSet: "customColorSet",
          backgroundColor: this.chartBackgroundColor,
          //exportEnabled: true,
          title: {
            text: "Percentage of Books by Genre",
            fontSize: 16

          },
          copyright: {
            text: ''
          },

          data: [{
            indexLabel: "{name}: {y}%",
            toolTipContent: "{name}: {y}%",
            dataPoints: data.map(genre => ({
              name: genre.genreName,
              y: genre.percentage,
            }))
          }]
        };

        this.renderChart(genreChartOptions, 'genreChartContainer');
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
          theme: "light2",
          colorSet: "customColorSet",
          backgroundColor: this.chartBackgroundColor,
          //exportEnabled: true,
          title: {
            text: "Percentage of Books by Publisher",
            fontSize: 16
          },
          copyright: {
            text: ''
          },
        

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
          theme: "light2",
          colorSet: "customColorSet",
          backgroundColor: this.chartBackgroundColor,
          //exportEnabled: true,
          title: {
            text: "Percentage of Books by Publication Year",
            fontSize: 16
          },
          copyright: {
            text: ''
          },
          
          axisX: {
            title: "Year",
            interval: 1,  // Display each year
            labelAngle: -45, // Rotate labels to prevent overlap
            labelFontSize: 12, // Adjust font size for readability
          },
          axisY: {
            title: "Percentage",
            includeZero: true,
            labelFormatter: function (e: { value: string; }) {
              return e.value + "%"; // Append '%' to Y-axis labels
            },
            maximum: 100, // Set maximum value if percentages are used
          },
          
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
          theme: "light2",
          colorSet: "customColorSet",
          backgroundColor: this.chartBackgroundColor,
          //exportEnabled: true,
          title: {
            text: "Number of Books by Year",
            fontSize: 16
          },

          axisX: {
            title: "Year",
            interval: 1,  // Pour afficher chaque année
            labelAngle: -45, // Inclinaison des labels pour éviter le chevauchement
            labelFontSize: 10,
            labelFormatter: function (e: any) {
              // Assurez-vous que l'année est affichée correctement
              return e.value.toString();
            }
          },
          axisY: {
            title: "Number of Books",
            includeZero: true
          },
          
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
        if (containerId === 'genderChartContainer' && this.chart) {
          this.chart.destroy();
        } else if (containerId === 'yearChartContainer' && this.yearChart) {
          this.yearChart.destroy();
        } else if (containerId === 'publisherChartContainer' && this.publisherChart) {
          this.publisherChart.destroy();
        } else if (containerId === 'authorAndYearChartContainer' && this.authorAndYearChart) {
          this.authorAndYearChart.destroy();
        }
  
        const chart = new (window as any).CanvasJS.Chart(chartContainer, {
          ...options,
          width: chartContainer.clientWidth-40,  // Dynamically set the width based on the container
          height: chartContainer.clientHeight-40 // Dynamically set the height based on the container
        });
  
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
