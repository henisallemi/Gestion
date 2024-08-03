import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { BookService } from '../../services/book.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';

import { BookAddEditComponent } from '../book-add-edit/book-add-edit.component';
import { CoreService } from '../../services/core.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-book-list', 
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.scss']     
})
export class BookListComponent implements OnInit {
  selectedFile: File | null = null;
  books!: MatTableDataSource<any>;
  headers: string[] = [
    "title",
    "author",
    "isbn",
    "datePublication",
    "editeur",
    "langue",
    "prix",
    "action"
  ];

  bookForm: FormGroup;
  addBookModal: NgbModalRef | undefined;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  //@ViewChild('addBookModal') addBookModalContent!: TemplateRef<any>; // Reference to the modal content

  constructor(
    private bookService: BookService,
    private fb: FormBuilder,
    private _dialog: MatDialog,
    private _coreService: CoreService,
    private router: Router 

  ) {
    this.bookForm = this.fb.group({
      title: [''],
      author: [''], 
      isbn: [''],
      datePublication: [''],
      editeur: [''],
      langue: [''],     
      prix: [''],   
    });
  }

  newBook: any = {}; // Définissez newBook pour stocker les données du formulaire

  ngOnInit() {
    this.loadBooks();
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] ?? null;
  }
  onUpload() {
    if (this.selectedFile) {
      this.bookService.uploadFile(this.selectedFile).subscribe(
        (data: any) => {
          if (data && data.length > 0) {
            this.books = new MatTableDataSource(data);
            this.books.sort = this.sort;
            this.books.paginator = this.paginator;
            this.loadBooks();
            this._coreService.openSnackBar('Fichier EXCEL ajouté avec succès !', '✔️', 3000); // Durée de 3000 ms pour succès
          } else {
            console.error('No data returned or data length is zero.');
          }
        },
        (error) => {
          if (error.error && error.error.message) {   
            this._coreService.openSnackBar(error.error.message, '⚠️', 5000); // Durée de 5000 ms pour erreur
          } else {
            console.error('Error uploading file', error);
          }
        }
      );
    } else {
      console.error('No file selected');
    }
  }
        
  
  loadBooks() {
    this.bookService.getBooks().subscribe(
      response => {
        if (response.length > 0) {
          this.books = new MatTableDataSource(response);
          console.log(response);
          this.books.sort = this.sort;
          this.books.paginator = this.paginator;
        }else{
          this.books = new MatTableDataSource();
        } 
      },
      error => {
        console.error('Error loading books', error);
      }
    );
  }
  

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.books.filter = filterValue.trim().toLowerCase();

    if (this.books.paginator) {
      this.books.paginator.firstPage();
    }
  }

  deleteBook(id: number) {
    this.bookService.deleteBook(id).subscribe({
      next: (res) => {
        this._coreService.openSnackBar('Book deleted!', 'done')
        this.loadBooks();
      },
      error: console.log
    })
  }

  openAddEditBookForm() {
    const dialogRef = this._dialog.open(BookAddEditComponent);
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.loadBooks();
        }
      }
    })
  }

  openEditBookForm(data: any) {
    const dialogRef = this._dialog.open(BookAddEditComponent, {
      data,
    });
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.loadBooks();
        }
      }
    })
  }
  navigateToDashboard() {
    this.router.navigate(['/dashboard']); // Adjust the route according to your app's routing configuration
  }
}      