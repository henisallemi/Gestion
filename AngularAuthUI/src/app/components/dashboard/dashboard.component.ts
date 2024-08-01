import { Component, OnInit } from '@angular/core';
import { BookService } from '../../services/book.service';
import { ChartOptions, ChartType, ChartData } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // Statistiques
  totalBooks: number = 0;
  totalAuthors: number = 0;
  totalEditeurs: number = 0;
  averagePrice: number = 0;

  // Graphiques
  public genreChartLabels: string[] = [];
  public genreChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{ data: [] }]
  };

  public yearChartLabels: string[] = [];
  public yearChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [] }]
  };

  public publisherChartLabels: string[] = [];
  public publisherChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ data: [] }]
  };

  public authorYearChartLabels: string[] = [];
  public authorYearChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{ data: [] }]
  };

  // Options des Graphiques
  public chartOptions: ChartOptions<'bar' | 'line' | 'pie' | 'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true
      },
      y: {
        beginAtZero: true
      }
    }
  };

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.loadBookStatistics();
  }

  private loadBookStatistics(): void {
    this.bookService.getBooks().subscribe(
      books => {
        if (books.length > 0) {
          this.totalBooks = books.length;
          this.totalAuthors = new Set(books.map(book => book.author)).size;
          this.totalEditeurs = new Set(books.map(book => book.editeur)).size;
          this.averagePrice = books.reduce((acc, book) => acc + book.prix, 0) / this.totalBooks;

          // Générer les données pour les graphiques
          this.generateChartsData(books);
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

  private generateChartsData(books: any[]): void {
    // Pourcentage de livres par genre
    const genreCounts = books.reduce((acc, book) => {
      acc[book.genre] = (acc[book.genre] || 0) + 1;
      return acc;
    }, {});
    this.genreChartLabels = Object.keys(genreCounts);
    this.genreChartData = {
      labels: this.genreChartLabels,
      datasets: [{ data: Object.values(genreCounts), label: 'Books by Genre' }]
    };

    // Pourcentage de livres par année de publication
    const yearCounts = books.reduce((acc, book) => {
      acc[book.datePublication] = (acc[book.datePublication] || 0) + 1;
      return acc;
    }, {});
    this.yearChartLabels = Object.keys(yearCounts);
    this.yearChartData = {
      labels: this.yearChartLabels,
      datasets: [{ data: Object.values(yearCounts), label: 'Books by Year' }]
    };

    // Pourcentage de livres par éditeur
    const publisherCounts = books.reduce((acc, book) => {
      acc[book.editeur] = (acc[book.editeur] || 0) + 1;
      return acc;
    }, {});
    this.publisherChartLabels = Object.keys(publisherCounts);
    this.publisherChartData = {
      labels: this.publisherChartLabels,
      datasets: [{ data: Object.values(publisherCounts), label: 'Books by Publisher' }]
    };

    // Nombre de livres par auteur et par année
    const authorYearCounts = books.reduce((acc, book) => {
      const key = `${book.author} (${book.datePublication})`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    this.authorYearChartLabels = Object.keys(authorYearCounts);
    this.authorYearChartData = {
      labels: this.authorYearChartLabels,
      datasets: [{ data: Object.values(authorYearCounts), label: 'Books by Author and Year' }]
    };
  }

  private resetStatistics(): void {
    this.totalBooks = 0;
    this.totalAuthors = 0;
    this.totalEditeurs = 0;
    this.averagePrice = 0;
  }
}
