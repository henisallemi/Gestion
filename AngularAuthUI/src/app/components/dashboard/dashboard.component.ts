import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { BookService } from '../../services/book.service';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';

import { BookAddEditComponent } from '../book-add-edit/book-add-edit.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  selectedFile: File | null = null;
  books!: MatTableDataSource<any>;
  headers: string[] = [
      "id",
      "title",
      "author",
      "isbn",
      "genre",
      "datePublication",
      "editeur",
      "langue",
      "description",
      "nb_Page",
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
    private _dialog : MatDialog
  ) {
    this.bookForm = this.fb.group({
      title: [''],
      author: [''],
      isbn: [''],
      genre: [''],
      datePublication: [''],
      editeur: [''],
      langue: [''],
      description: [''],
      nb_Page: [0],
      prix: [0]
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
        data => {
          if (data.length > 0) {
            this.books = new MatTableDataSource(data);
            this.books.sort = this.sort;
            this.books.paginator = this.paginator;
          }
        },
        error => {
          console.error('Error uploading file', error);
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

  deleteBook(id: number){
    this.bookService.deleteBook(id).subscribe({
      next:(res)=> {
        alert('Book deleted !');
        this.loadBooks();
      },
      error: console.log
    })
  }

  openAddEditBookForm(){
    const dialogRef = this._dialog.open(BookAddEditComponent);
    dialogRef.afterClosed().subscribe({
      next:(val) => {
        if(val) {
          this.loadBooks();
        }
      }
    })
  }

  openEditBookForm(data :any){
    const dialogRef = this._dialog.open(BookAddEditComponent, {
      data,
    });
    dialogRef.afterClosed().subscribe({
      next:(val) => {
        if(val) {
          this.loadBooks();
        }
      }
    })
  }
}
