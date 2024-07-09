import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BookService } from '../../services/book.service';
import { FormBuilder, FormGroup, NgForm } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  selectedFile: File | null = null;
  books: any[] = [];
  headers: string[] = [];
  searchTerm: string = '';

  bookForm: FormGroup;
  addBookModal: NgbModalRef | undefined;
  
  @ViewChild('addBookModal') addBookModalContent!: TemplateRef<any>; // Reference to the modal content

  constructor(private http: HttpClient, private bookService: BookService, private fb: FormBuilder, private modalService: NgbModal) {
    this.bookForm = this.fb.group({
      title: [''],
      author: [''], 
      isbn: [''],
      genre: [''],
      datePublication: [''],
      editeur: [''],
      langue: [''],
      description: [''],
      nbPage: [''],
      prix: ['']
    });
  }
  newBook: any = {}; // Définissez newBook pour stocker les données du formulaire

  onSubmit() {
    if (this.bookForm.valid) {
      const newBook = this.bookForm.value;
      this.http.post<any>('https://localhost:7114/Books/add', newBook)
        .subscribe(
          response => {
            console.log('Livre ajouté avec succès :', response);
            this.addBookModal?.close(); // Ferme le modal après soumission réussie
            this.loadBooks(); // Recharge la liste des livres
          },
          error => {
            console.error('Erreur lors de l\'ajout du livre :', error);
            // Gérez les erreurs (par exemple, affichez un message d'erreur)
          }
        );
    }
  }

  ngOnInit() {
    this.loadBooks();
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] ?? null;
  }

  loadBooks() {
    this.bookService.getBooks().subscribe(response => {
      this.books = response;
      if (this.books.length > 0) {
        this.headers = Object.keys(this.books[0]);
      }
    }, error => {
      console.error('Error loading books', error);
    });
  }

  onUpload() {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile, this.selectedFile.name);

      this.http.post<any[]>('https://localhost:7114/Books/upload', formData)
        .subscribe(data => {
          if (data.length > 0) {
            this.headers = Object.keys(data[0]);
            this.books = data;
          }
        });
    } else {
      console.error('No file selected');
    }
  }

  openAddBookModal() {
    this.addBookModal = this.modalService.open(this.addBookModalContent, { centered: true });
  }

  // Ensure to add any necessary cleanup or other logic here as needed
  ngOnDestroy() {
    if (this.addBookModal) {
      this.addBookModal.close();
    }
  }
}
