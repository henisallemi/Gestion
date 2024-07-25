import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  addBook(newBook: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add`, newBook);
  }

  updateBook(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data)
  }

  getBooks(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  deleteBook(id: number): Observable<any>{
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  checkIsbnExists(isbn: string) {
    return this.http.get<boolean>(`${this.apiUrl}/check-isbn/${isbn}`);
  }
}
