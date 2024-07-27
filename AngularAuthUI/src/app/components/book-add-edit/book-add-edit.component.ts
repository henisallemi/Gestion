import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BookService } from '../../services/book.service';
import { CoreService } from '../../services/core.service';

@Component({
  selector: 'app-book-add-edit',
  templateUrl: './book-add-edit.component.html',
  styleUrls: ['./book-add-edit.component.scss']
})
export class BookAddEditComponent implements OnInit {
  bookForm: FormGroup;
  headers: string[] = [];
  bookData: any;

  constructor(
    private _fb: FormBuilder,
    private _bookservice: BookService,
    private _dialogRef: MatDialogRef<BookAddEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _coreService: CoreService
  ) {
    this.bookData = data; // Access all properties passed via data
    this.headers = data.headers; // Extract headers if needed
    // Initialize form group with an empty object
    this.bookForm = this._fb.group({});
  }

  ngOnInit(): void {
    if (this.data) {
      this.headers = this.data.headers;
      this.createFormControls();
      this.bookForm.patchValue(this.data); // Patch existing data if any
      console.log(this.data)
    }
  }

  isSaveMode(): boolean {
    // Check if the data object only contains the headers property
    return Object.keys(this.bookData).length === 1 && this.bookData.hasOwnProperty('headers');
  }
  
  createFormControls() {
    const controls: Record<string, any> = {};
    this.headers.forEach(header => {
      controls[header] = ['']; // Initialize with empty values or set default values as needed
    });
    this.bookForm = this._fb.group(controls);
  }
  onFormSubmit() {
    console.log('Is Save Mode:', this.isSaveMode());
  
    const formData = this.bookForm.value;
  
    if (this.isSaveMode()) {
      console.log("I am adding a new book");
      this._bookservice.addBook(formData).subscribe({
        next: (val: any) => {
          this._coreService.openSnackBar('Book added successfully!');
          this._dialogRef.close(true);
        },
        error: (err: any) => {
          console.error('Error adding book:', err);
          this._coreService.openSnackBar('Error adding book. Please try again.');
        }
      });
    } else {
      console.log("I am updating an existing book");
      if (this.data && this.data.id) {
        console.log('Updating book with ID:', this.data.id);
        console.log('Form data :', formData);
        this._bookservice.updateBook(this.data.id, formData).subscribe({
          next: (val: any) => {
            this._coreService.openSnackBar('Book updated successfully!');
            this._dialogRef.close(true);
          },
          error: (err: any) => {
            console.error('Error updating book:', err);
            this._coreService.openSnackBar('Error updating book. Please try again.');
          }
        });
      } else {
        console.error('No book ID available for update.');
        this._coreService.openSnackBar('No book ID available for update.');
      }
    }
  }
  
}
