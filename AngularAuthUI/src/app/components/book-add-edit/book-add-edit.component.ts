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

  constructor(
    private _fb: FormBuilder,
    private _bookservice: BookService,
    private _dialogRef: MatDialogRef<BookAddEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _coreService: CoreService
  ) {
    // Initialize form group with an empty object
    this.bookForm = this._fb.group({});
  }

  ngOnInit(): void {
    if (this.data) {
      this.headers = this.data.headers;
      this.createFormControls();
      this.bookForm.patchValue(this.data); // Patch existing data if any
    }
  }

  createFormControls() {
    // Use Record<string, any> to define the shape of controls
    const controls: Record<string, any> = {};
    this.headers.forEach(header => {
      controls[header] = ['']; // Initialize with empty values or set default values as needed
    });
    this.bookForm = this._fb.group(controls);
  }

  onFormSubmit() {
    if (this.bookForm.valid) {
      const formData = this.bookForm.value;
      formData.datePublication = new Date(formData.datePublication);

      this._bookservice.checkIsbnExists(formData.isbn).subscribe({
        next: (isbnExists: boolean) => {
          if (isbnExists) {
            this._coreService.openSnackBar('ISBN already exists!');
          } else {
            if (this.data && this.data.id) {
              this._bookservice.updateBook(this.data.id, formData).subscribe({
                next: (val: any) => {
                  this._coreService.openSnackBar('Book updated!');
                  this._dialogRef.close(true);
                },
                error: (err: any) => {
                  console.error(err);
                }
              });
            } else {
              this._bookservice.addBook(formData).subscribe({
                next: (val: any) => {
                  this._coreService.openSnackBar('Book added successfully!');
                  this._dialogRef.close(true);
                },
                error: (err: any) => {
                  console.error(err);
                }
              });
            }
          }
        },
        error: (err: any) => {
          console.error(err);
        }
      });
    }
  }
}
