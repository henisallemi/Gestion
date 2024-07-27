import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { BookService } from '../../services/book.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { BookAddEditComponent } from '../book-add-edit/book-add-edit.component';
import { CoreService } from '../../services/core.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  selectedFile: File | null = null;
  books!: MatTableDataSource<any>;
  headers: string[] = [];
  addBookModal: NgbModalRef | undefined;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private bookService: BookService,
    private _dialog: MatDialog,
    private _coreService: CoreService,
    private dialog: MatDialog  
  ) {}


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
  
          let errorMessage = 'An unexpected error occurred while uploading the file.';
          if (error.status === 400) {
            if (error.error && typeof error.error === 'object') {
              errorMessage = error.error.error; // Assuming the error is in the "error" field
            } else if (typeof error.error === 'string') {
              errorMessage = error.error;
            }
          }
          alert(`Error: ${errorMessage}`);
        }
      );
    } else {
      console.error('No file selected');
      alert('No file selected. Please choose a file to upload.');
    }
  }

  loadBooks() {
    this.bookService.getBooks().subscribe(
      response => {
        if (response) {
          console.log("Books:",response);
          this.setHeaders(response);
          console.log("headers:",this.headers);
          this.books = new MatTableDataSource(response);
          this.books.sort = this.sort;
          this.books.paginator = this.paginator;
        }
      },
      error => {
        console.error('Error loading books', error);
      }
    );
  }


  setHeaders(data: any[]) {
    if (data.length > 0) {
      this.headers = Object.keys(data[0]).filter(header => header !== 'id').concat('action');
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.books.filter = filterValue.trim().toLowerCase();

    if (this.books.paginator) {
      this.books.paginator.firstPage();
    }
  }

 
deleteBook(id: number) {
  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    width: '300px'
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.bookService.deleteBook(id).subscribe({
        next: () => {
          this._coreService.openSnackBar('Book deleted!', 'done');
          this.loadBooks();
        },
        error: (err) => {
          console.error('Error deleting book:', err);
          this._coreService.openSnackBar('Error deleting book. Please try again.');
        }
      });
    }
  });
}

  openAddEditBookForm() {
    const dialogRef = this._dialog.open(BookAddEditComponent, {
      data: { headers: this.headers.filter(header => header !== 'action') } // Pass headers here
    });
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.loadBooks();
        }
      }
    });
  }
  
  openEditBookForm(data: any) {
    const dialogRef = this._dialog.open(BookAddEditComponent, {
      data: { ...data, headers: this.headers.filter(header => header !== 'action') } // Pass headers here along with the data
    });
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.loadBooks();
        }
      }
    });
  }
  
}
