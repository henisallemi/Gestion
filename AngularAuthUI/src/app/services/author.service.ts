import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Author } from '../../models/author.model';

@Injectable({
  providedIn: 'root'
})
export class AuthorService {
  private apiUrl = `https://localhost:7114/Author`;

  constructor(private http: HttpClient) { }

  getAuthors(): Observable<Author[]> {
    return this.http.get<Author[]>(this.apiUrl);
  }
}
