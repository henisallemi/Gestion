import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Author } from '../../models/author.model';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = `https://localhost:7114/Books`;

  constructor(private http: HttpClient) { }

  uploadFile(file: File): Observable<any[]> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<any[]>(`${this.apiUrl}/upload`, formData);
  }

  addBook(newBook: any, authorName : string): Observable<any> {
    const requestPayload = {
      book: newBook,
      authorName: authorName
    };
    return this.http.post<any>(`${this.apiUrl}/add`, requestPayload);
  }

  updateBook(id: number, bookData: any, authorName: string): Observable<any> {
    const dataToSend = {
      Book: bookData,
      AuthorName: authorName
    };
    console.log(dataToSend)
    return this.http.put(`${this.apiUrl}/${id}`, dataToSend);
  }
  
  getBooks(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  deleteBook(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  checkIsbnExists(isbn: string) {
    return this.http.get<boolean>(`${this.apiUrl}/check-isbn/${isbn}`);
  }

  getBooksByGenre(): Observable<{ genreName: string, percentage: number }[]> {
    return this.http.get<{ genreName: string, percentage: number }[]>(`${this.apiUrl}/books-by-genres`);
  }

  getBooksByYear(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/books-by-year`); // Ensure this endpoint exists
  }

  getBooksByPublisher(): Observable<{ publisherName: string, percentage: number }[]> {
    return this.http.get<{ publisherName: string, percentage: number }[]>(`${this.apiUrl}/books-by-publisher`);
  }

  getBooksByAuthorAndYear(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/books-by-author-and-year`);
  }
 
}                     
